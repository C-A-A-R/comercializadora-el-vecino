from django.contrib import admin
from apps.base.admin import BaseAdmin, BaseTabularInline
from apps.promotions.models import (
    DiscountedPromotions,
    PromotionProduct,
    PromotionCombo,
    ProductCombo
)


class PromotionProductInline(BaseTabularInline):
    model = PromotionProduct
    extra = 1


class ProductComboInline(BaseTabularInline):
    model = ProductCombo
    extra = 1


@admin.register(DiscountedPromotions)
class DiscountedPromotionsAdmin(BaseAdmin):
    list_display = ('name', 'discounted_type', 'discounted_value', 'start_date', 'end_date', 'is_active')
    list_filter = ('discounted_type', 'start_date', 'end_date', 'is_deleted')
    search_fields = ('name', 'description')
    inlines = [PromotionProductInline]


@admin.register(PromotionCombo)
class PromotionComboAdmin(BaseAdmin):
    list_display = ('name', 'price', 'original_total_price', 'savings', 'start_date', 'end_date', 'is_active')
    list_filter = ('start_date', 'end_date', 'is_deleted')
    search_fields = ('name', 'description')
    inlines = [ProductComboInline]
