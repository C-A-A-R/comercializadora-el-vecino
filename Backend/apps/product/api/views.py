from django.db.models import Prefetch, F, Q
from django.http import HttpResponse
from rest_framework import status, generics, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from apps.base.api import BaseViewSet
from apps.base.pagination import StandardResultsSetPagination
from apps.product.models import (
    Category,
    ProductType,
    Product,
    ProductFeature,
    ProductColorImage,
    ProductAngleImage,
    ProductReview,
    ProductViewLog
)
from apps.product.api.serializers import (
    CategorySerializer,
    ProductTypeSerializer,
    ProductSerializer,
    ProductReviewSerializer,
    ProductReviewCreateSerializer
)
from apps.product.services.sentiment import classify_comment
from apps.product.services.scoring import recalculate_product_metrics
from apps.product.services.catalog_pdf import build_filtered_catalog_pdf


def _get_client_ip(request):
    """Obtiene la dirección IP del cliente a partir de la petición."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class CategoryViewSet(BaseViewSet):
    """
    ViewSet para la gestión CRUD de Categorías.
    Soporta paginación, búsqueda por nombre/descripción y ordenamiento.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ['category_name', 'description']
    ordering_fields = ['id', 'category_name', 'created_at']
    ordering = ['category_name']


class ProductTypeViewSet(BaseViewSet):
    """
    ViewSet para la gestión CRUD de Tipos de Productos.
    Soporta paginación, búsqueda y ordenamiento.
    """
    serializer_class = ProductTypeSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ['product_type_name', 'description']
    ordering_fields = ['id', 'product_type_name', 'created_at']
    ordering = ['product_type_name']


class FeaturedProductsAPIView(generics.ListAPIView):
    """
    APIView dedicada para listar productos destacados (is_feature_product=True)
    con paginación y optimización de consultas SQL (prefetch).
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product_name', 'description', 'brand']
    ordering_fields = ['id', 'product_name', 'price', 'created_at']

    def get_queryset(self):
        return Product.objects.filter(is_deleted=False, is_feature_product=True).prefetch_related(
            'categories',
            Prefetch('features', queryset=ProductFeature.objects.filter(is_deleted=False)),
            Prefetch('color_images', queryset=ProductColorImage.objects.filter(is_deleted=False)),
            Prefetch('angle_images', queryset=ProductAngleImage.objects.filter(is_deleted=False))
        ).select_related('product_type')


class ExportCatalogPDFAPIView(APIView):
    """
    APIView independiente para generar y descargar el catálogo de productos en PDF.
    
    Acepta parámetros GET opcionales para filtrar el catálogo:
    - category / cat: ID de categoría
    - product_type / type: ID de tipo de producto
    - min_price: Precio mínimo (>=)
    - max_price: Precio máximo (<=)
    - min_score: Score de ranking mínimo (>=)
    - is_featured / featured: Filtrar productos destacados (true/false)
    - brand: Filtrar por marca
    - search / q: Búsqueda por texto en nombre o descripción
    - ordering: Campo de ordenación (default: '-ranking_score')
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        queryset = Product.objects.filter(is_deleted=False).prefetch_related(
            'categories',
            Prefetch('color_images', queryset=ProductColorImage.objects.filter(is_deleted=False)),
            Prefetch('angle_images', queryset=ProductAngleImage.objects.filter(is_deleted=False))
        ).select_related('product_type')

        # 1. Filtros de categoría y tipo
        cat_param = request.query_params.get('category') or request.query_params.get('cat')
        if cat_param and cat_param.lower() != 'all':
            queryset = queryset.filter(categories__id=cat_param)

        type_param = request.query_params.get('product_type') or request.query_params.get('type')
        if type_param and type_param.lower() != 'all':
            queryset = queryset.filter(product_type__id=type_param)

        # 2. Filtros de precio
        min_price = request.query_params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # 3. Filtro de ranking score
        min_score = request.query_params.get('min_score')
        if min_score:
            try:
                queryset = queryset.filter(ranking_score__gte=float(min_score))
            except ValueError:
                pass

        # 4. Filtro de destacados
        featured_param = request.query_params.get('is_featured') or request.query_params.get('featured')
        if featured_param is not None:
            is_feat = featured_param.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_feature_product=is_feat)

        # 5. Filtro de marca
        brand_param = request.query_params.get('brand')
        if brand_param:
            queryset = queryset.filter(brand__icontains=brand_param)

        # 6. Búsqueda por texto
        search_param = request.query_params.get('search') or request.query_params.get('q')
        if search_param:
            queryset = queryset.filter(
                Q(product_name__icontains=search_param) |
                Q(description__icontains=search_param) |
                Q(brand__icontains=search_param)
            )

        # 7. Ordenamiento
        ordering = request.query_params.get('ordering', '-ranking_score')
        valid_orderings = [
            'ranking_score', '-ranking_score',
            'price', '-price',
            'created_at', '-created_at',
            'product_name', '-product_name',
            'total_views', '-total_views',
            'id', '-id'
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-ranking_score')

        queryset = queryset.distinct()

        # 8. Generar PDF binario
        pdf_bytes = build_filtered_catalog_pdf(queryset)

        # 9. Responder como archivo descargable
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="catalogo_el_vecino.pdf"'
        return response



class ProductViewSet(BaseViewSet):
    """
    ViewSet para la gestión CRUD de Productos.
    - Soporta filtrado por categoría, tipo de producto, destacado, marca, voltaje.
    - Soporta búsqueda por texto en nombre, descripción, marca, capacidad, voltaje, seguridad y relaciones.
    - Soporta ordenamiento por precio, fecha, nombre, marca, ranking_score y total_views.
    - Responde por defecto con paginación optimizada sin cuellos de botella (evita N+1 con prefetch).
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['categories', 'product_type', 'is_feature_product', 'brand', 'voltage']
    search_fields = [
        'product_name',
        'description',
        'brand',
        'capacity',
        'voltage',
        'security',
        'product_type__product_type_name',
        'categories__category_name'
    ]
    ordering_fields = ['id', 'product_name', 'price', 'created_at', 'brand', 'ranking_score', 'total_views']
    ordering = ['-id']

    def get_queryset(self):
        queryset = Product.objects.filter(is_deleted=False).prefetch_related(
            'categories',
            Prefetch('features', queryset=ProductFeature.objects.filter(is_deleted=False)),
            Prefetch('color_images', queryset=ProductColorImage.objects.filter(is_deleted=False)),
            Prefetch('angle_images', queryset=ProductAngleImage.objects.filter(is_deleted=False))
        ).select_related('product_type')

        cat_param = self.request.query_params.get('category') or self.request.query_params.get('cat')
        type_param = self.request.query_params.get('type')

        if cat_param and cat_param.lower() != 'all':
            queryset = queryset.filter(categories__id=cat_param)
        if type_param and type_param.lower() != 'all':
            queryset = queryset.filter(product_type__id=type_param)

        return queryset.distinct()

    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request, *args, **kwargs):
        """Endpoint dentro del ViewSet para listar solo productos destacados."""
        featured_products = self.get_queryset().filter(is_feature_product=True)
        page = self.paginate_queryset(featured_products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        include_param = (
            request.query_params.get('include_info') or
            request.query_params.get('include_extra') or
            request.query_params.get('include_metadata') or
            request.query_params.get('include_categories_and_types') or
            request.query_params.get('extra_info')
        )

        if include_param is not None and include_param.lower() in ['true', '1', 'yes', '']:
            categories = Category.objects.filter(is_deleted=False)
            categories_serializer = CategorySerializer(categories, many=True)

            product_types = ProductType.objects.filter(is_deleted=False)
            product_types_serializer = ProductTypeSerializer(product_types, many=True)

            custom_data = {
                'pagination_data': response.data if isinstance(response.data, dict) else None,
                'products': response.data.get('results', response.data) if isinstance(response.data, dict) else response.data,
                'categories': categories_serializer.data,
                'product_types': product_types_serializer.data
            }
            return Response(custom_data, status=status.HTTP_200_OK)

        return response

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)

        include_param = (
            request.query_params.get('include_info') or
            request.query_params.get('include_extra') or
            request.query_params.get('include_metadata') or
            request.query_params.get('include_categories_and_types') or
            request.query_params.get('extra_info')
        )

        if include_param is not None and include_param.lower() in ['true', '1', 'yes', '']:
            categories = Category.objects.filter(is_deleted=False)
            categories_serializer = CategorySerializer(categories, many=True)

            product_types = ProductType.objects.filter(is_deleted=False)
            product_types_serializer = ProductTypeSerializer(product_types, many=True)

            custom_data = {
                'product': response.data,
                'categories': categories_serializer.data,
                'product_types': product_types_serializer.data
            }
            return Response(custom_data, status=status.HTTP_200_OK)

        return response

    @action(detail=True, methods=['post'], url_path='view', permission_classes=[permissions.AllowAny])
    def register_view(self, request, pk=None):
        """Registra una vista atómica del producto y recalcula métricas."""
        product = self.get_object()
        ProductViewLog.objects.create(
            product=product,
            ip_address=_get_client_ip(request)
        )
        Product.all_objects.filter(id=product.id).update(total_views=F('total_views') + 1)
        product.refresh_from_db(fields=['total_views'])
        recalculate_product_metrics(product.id)
        return Response({'total_views': product.total_views}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='reviews', permission_classes=[permissions.AllowAny])
    def reviews(self, request, pk=None):
        """
        GET: Lista solo reseñas positivas (público).
        POST: Crea una reseña con análisis de sentimiento automático (público).
        """
        product = self.get_object()

        if request.method == 'GET':
            reviews_qs = ProductReview.objects.filter(
                product=product,
                sentiment_label='positive',
                is_deleted=False
            ).order_by('-created_at')

            page = self.paginate_queryset(reviews_qs)
            if page is not None:
                serializer = ProductReviewSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = ProductReviewSerializer(reviews_qs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            serializer = ProductReviewCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            comment_text = serializer.validated_data['comment']
            sentiment_result = classify_comment(comment_text)

            review = ProductReview.objects.create(
                product=product,
                comment=comment_text,
                sentiment_label=sentiment_result['label'],
                sentiment_confidence=sentiment_result['score']
            )

            recalculate_product_metrics(product.id)
            return Response(
                ProductReviewSerializer(review).data,
                status=status.HTTP_201_CREATED
            )
