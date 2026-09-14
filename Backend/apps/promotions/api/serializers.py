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
    Soporta creación y actualización asociando productos mediante PromotionProduct.
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

    def create(self, validated_data):
        raw_products = self.initial_data.get('products') or self.initial_data.get('product_ids')
        if not raw_products and self.initial_data.get('product_id'):
            raw_products = [self.initial_data.get('product_id')]

        promo = super().create(validated_data)
        if raw_products and isinstance(raw_products, list):
            for prod_id in raw_products:
                pid = prod_id.get('id') if isinstance(prod_id, dict) else prod_id
                if pid:
                    PromotionProduct.objects.get_or_create(discounted_promotions=promo, product_id=pid)
        return promo

    def update(self, instance, validated_data):
        promo = super().update(instance, validated_data)
        raw_products = self.initial_data.get('products') or self.initial_data.get('product_ids')
        if not raw_products and self.initial_data.get('product_id'):
            raw_products = [self.initial_data.get('product_id')]

        if raw_products is not None and isinstance(raw_products, list):
            PromotionProduct.objects.filter(discounted_promotions=promo).delete()
            for prod_id in raw_products:
                pid = prod_id.get('id') if isinstance(prod_id, dict) else prod_id
                if pid:
                    PromotionProduct.objects.get_or_create(discounted_promotions=promo, product_id=pid)
        return promo


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
    Soporta creación y actualización con lista de items anidados.
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

    def create(self, validated_data):
        raw_items = self.initial_data.get('items') or self.initial_data.get('combo_products')
        combo = super().create(validated_data)
        if raw_items and isinstance(raw_items, list):
            for item in raw_items:
                pid = item.get('product_id') or item.get('product')
                if isinstance(pid, dict):
                    pid = pid.get('id')
                qty = int(item.get('quantity', 1))
                if pid:
                    ProductCombo.objects.get_or_create(combo=combo, product_id=pid, defaults={'quantity': qty})
        return combo

    def update(self, instance, validated_data):
        combo = super().update(instance, validated_data)
        raw_items = self.initial_data.get('items') or self.initial_data.get('combo_products')
        if raw_items is not None and isinstance(raw_items, list):
            ProductCombo.objects.filter(combo=combo).delete()
            for item in raw_items:
                pid = item.get('product_id') or item.get('product')
                if isinstance(pid, dict):
                    pid = pid.get('id')
                qty = int(item.get('quantity', 1))
                if pid:
                    ProductCombo.objects.get_or_create(combo=combo, product_id=pid, defaults={'quantity': qty})
        return combo


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
