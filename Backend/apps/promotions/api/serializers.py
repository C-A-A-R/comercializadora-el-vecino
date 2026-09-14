from rest_framework import serializers
from apps.promotions.models import (
    DiscountedPromotions, 
    PromotionProduct, 
    PromotionCombo, 
    ProductCombo
)


class PromotionProductSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.product_name')
    original_price = serializers.ReadOnlyField(source='product.price')
    promotional_price = serializers.ReadOnlyField()

    class Meta:
        model = PromotionProduct
        fields = ['id', 'product', 'product_name', 'original_price', 'promotional_price']


class DiscountedPromotionsSerializer(serializers.ModelSerializer):
    """
    Serializer para las promociones con descuento.
    """
    is_active = serializers.BooleanField(read_only=True)
    promotion_products = PromotionProductSerializer(many=True, read_only=True)

    class Meta:
        model = DiscountedPromotions
        fields = [
            'id', 'name', 'description', 'discounted_type', 'discounted_value',
            'start_date', 'end_date', 'is_active', 'image', 'promotion_products'
        ]
        read_only_fields = ['id', 'is_active']


class ProductComboSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.product_name')
    product_price = serializers.ReadOnlyField(source='product.price')
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = ProductCombo
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'subtotal']


class PromotionComboSerializer(serializers.ModelSerializer):
    """
    Serializer para combos promocionales.
    """
    is_active = serializers.BooleanField(read_only=True)
    combo_products = ProductComboSerializer(many=True, read_only=True)
    original_total_price = serializers.ReadOnlyField()
    savings = serializers.ReadOnlyField()
    savings_percentage = serializers.ReadOnlyField()

    class Meta:
        model = PromotionCombo
        fields = [
            'id', 'name', 'description', 'price', 'start_date', 'end_date',
            'is_active', 'image', 'combo_products', 'original_total_price',
            'savings', 'savings_percentage'
        ]
        read_only_fields = ['id', 'is_active', 'original_total_price', 'savings', 'savings_percentage']


class PromotionImageSerializer(serializers.Serializer):
    """
    Serializer unificado para el listado de imágenes de promociones y combos.
    """
    id = serializers.IntegerField()
    name = serializers.CharField()
    image_url = serializers.CharField()
    type = serializers.CharField()
    is_active = serializers.BooleanField()
    
    def to_representation(self, instance):
        data = {
            'id': instance.id,
            'name': instance.name,
            'is_active': instance.is_active,
        }
        
        if isinstance(instance, DiscountedPromotions):
            data['type'] = 'discounted'
        elif isinstance(instance, PromotionCombo):
            data['type'] = 'combo'
        else:
            data['type'] = 'unknown'
        
        if instance.image:
            request = self.context.get('request')
            if request:
                data['image_url'] = request.build_absolute_uri(instance.image.url)
            else:
                data['image_url'] = instance.image.url
        else:
            data['image_url'] = None
            
        return data
