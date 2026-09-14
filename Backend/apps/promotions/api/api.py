from apps.base.api import BaseViewSet
from apps.promotions.models import DiscountedPromotions, PromotionCombo
from apps.promotions.api.serializers import DiscountedPromotionsSerializer, PromotionComboSerializer
from rest_framework.permissions import AllowAny


class DiscountedPromotionsViewSet(BaseViewSet):
    """
    ViewSet para gestionar las promociones con descuento.
    Soporta filtrado por tipo de descuento, búsqueda por nombre y fechas.
    """
    permission_classes = [AllowAny]
    queryset = DiscountedPromotions.objects.filter(is_deleted=False)
    serializer_class = DiscountedPromotionsSerializer
    filterset_fields = ['discounted_type']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'start_date', 'end_date', 'discounted_value', 'name']
    ordering = ['-start_date']


class PromotionComboViewSet(BaseViewSet):
    """
    ViewSet para gestionar los combos promocionales.
    Soporta filtrado, búsqueda por nombre/descripción y ordenación por precio o fecha.
    """
    permission_classes = [AllowAny]
    queryset = PromotionCombo.objects.filter(is_deleted=False)
    serializer_class = PromotionComboSerializer
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'start_date', 'end_date', 'price', 'name']
    ordering = ['-start_date']
