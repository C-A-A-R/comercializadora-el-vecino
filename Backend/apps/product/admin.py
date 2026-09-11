from django.contrib import admin
from apps.base.admin import BaseAdmin, BaseTabularInline
from apps.product.models import (
    Category, ProductType, Product, ProductFeature,
    ProductColorImage, ProductAngleImage,
    ProductReview, ProductViewLog
)


class ProductFeatureInline(BaseTabularInline):
    model = ProductFeature
    extra = 1
    fields = ('feature_name', 'feature_value')


class ProductColorImageInline(BaseTabularInline):
    model = ProductColorImage
    extra = 1
    fields = ('color_image', 'color_hex', 'color_name')


class ProductAngleImageInline(BaseTabularInline):
    model = ProductAngleImage
    extra = 1
    fields = ('image', 'angle')


class ProductReviewInline(BaseTabularInline):
    model = ProductReview
    extra = 0
    fields = ('comment', 'sentiment_label', 'sentiment_confidence', 'created_at')
    readonly_fields = ('sentiment_label', 'sentiment_confidence', 'created_at')


@admin.register(Category)
class CategoryAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo Category."""

    list_display = (
        'category_name',
        'description',
        'category_image',
        'created_at',
        'updated_at'
    )
    search_fields = ('category_name', 'description')
    list_filter = ('created_at',)
    ordering = ('id',)


@admin.register(ProductType)
class ProductTypeAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo ProductType."""

    list_display = (
        'product_type_name',
        'description',
        'product_type_image',
        'created_at',
        'updated_at'
    )
    search_fields = ('product_type_name', 'description')
    list_filter = ('created_at',)
    ordering = ('id',)


@admin.register(Product)
class ProductAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo Product."""

    inlines = [ProductFeatureInline, ProductColorImageInline, ProductAngleImageInline, ProductReviewInline]
    list_display = (
        'product_name',
        'brand',
        'capacity',
        'voltage',
        'weight',
        'get_categories',
        'product_type',
        'price',
        'is_feature_product',
        'total_views',
        'sentiment_score',
        'ranking_score',
        'created_at'
    )
    list_editable = ('is_feature_product',)
    search_fields = ('product_name', 'brand', 'capacity', 'voltage', 'description', 'product_type__product_type_name', 'security')
    list_filter = ('is_feature_product', 'brand', 'categories', 'product_type', 'created_at')
    ordering = ('id',)
    filter_horizontal = ('categories',)
    readonly_fields = ('total_views', 'sentiment_score', 'ranking_score')

    def get_categories(self, obj):
        return ", ".join([c.category_name for c in obj.categories.all()])
    get_categories.short_description = 'Categorías'


@admin.register(ProductColorImage)
class ProductColorImageAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo ProductColorImage."""

    list_display = ('product', 'color_hex', 'color_name', 'color_image', 'created_at')
    search_fields = ('product__product_name', 'color_hex', 'color_name')
    list_filter = ('created_at',)
    ordering = ('id',)


@admin.register(ProductAngleImage)
class ProductAngleImageAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo ProductAngleImage."""

    list_display = ('product', 'angle', 'image', 'created_at')
    search_fields = ('product__product_name', 'angle')
    list_filter = ('created_at',)
    ordering = ('id',)


@admin.register(ProductFeature)
class ProductFeatureAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo ProductFeature."""

    list_display = ('product', 'feature_name', 'feature_value', 'created_at')
    search_fields = ('product__product_name', 'feature_name', 'feature_value')
    list_filter = ('created_at',)
    ordering = ('id',)


@admin.register(ProductReview)
class ProductReviewAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo ProductReview."""

    list_display = ('product', 'sentiment_label', 'sentiment_confidence', 'short_comment', 'created_at')
    search_fields = ('product__product_name', 'comment')
    list_filter = ('sentiment_label', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('sentiment_label', 'sentiment_confidence')

    def short_comment(self, obj):
        """Muestra los primeros 80 caracteres del comentario."""
        return obj.comment[:80] + '...' if len(obj.comment) > 80 else obj.comment
    short_comment.short_description = 'Comentario'


@admin.register(ProductViewLog)
class ProductViewLogAdmin(BaseAdmin):
    """Configuración del panel de administración para el modelo ProductViewLog (solo lectura)."""

    list_display = ('product', 'ip_address', 'created_at')
    search_fields = ('product__product_name', 'ip_address')
    list_filter = ('created_at',)
    ordering = ('-created_at',)
    readonly_fields = ('product', 'ip_address', 'created_at')

    def has_add_permission(self, request):
        """Los registros de vista solo se crean desde la API."""
        return False
