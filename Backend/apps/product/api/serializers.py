from rest_framework import serializers
from apps.product.models import (
    Category, Product, ProductFeature,
    ProductColorImage, ProductAngleImage, ProductReview
)


class CategorySerializer(serializers.ModelSerializer):
    """Serializador para el modelo Category."""

    class Meta:
        model = Category
        fields = ['id', 'category_name', 'description', 'category_image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductFeatureSerializer(serializers.ModelSerializer):
    """Serializador para el modelo ProductFeature (características del producto)."""

    class Meta:
        model = ProductFeature
        fields = ['id', 'feature_name', 'feature_value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductColorImageSerializer(serializers.ModelSerializer):
    """Serializador para el modelo ProductColorImage (imágenes por color)."""

    class Meta:
        model = ProductColorImage
        fields = ['id', 'color_image', 'color_hex', 'color_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductAngleImageSerializer(serializers.ModelSerializer):
    """Serializador para el modelo ProductAngleImage (imágenes por ángulo)."""

    class Meta:
        model = ProductAngleImage
        fields = ['id', 'image', 'angle', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializador de lectura para reseñas de productos."""

    class Meta:
        model = ProductReview
        fields = ['id', 'comment', 'sentiment_label', 'sentiment_confidence', 'created_at']
        read_only_fields = ['id', 'sentiment_label', 'sentiment_confidence', 'created_at']


class ProductReviewCreateSerializer(serializers.Serializer):
    """Serializador para la creación de reseñas (solo recibe el comentario)."""

    comment = serializers.CharField(
        min_length=3,
        max_length=2000,
        help_text='Texto del comentario/reseña sobre el producto.'
    )


class ProductSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Product."""

    categories_detail = CategorySerializer(source='categories', many=True, read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    features = serializers.SerializerMethodField()
    color_images = serializers.SerializerMethodField()
    angle_images = serializers.SerializerMethodField()
    negative_reviews_count = serializers.SerializerMethodField()
    positive_reviews_count = serializers.SerializerMethodField()
    has_complaints = serializers.SerializerMethodField()
    is_top_ranked = serializers.SerializerMethodField()

    def get_features(self, obj):
        active_features = [f for f in obj.features.all() if not getattr(f, 'is_deleted', False)]
        return ProductFeatureSerializer(active_features, many=True, context=self.context).data

    def get_color_images(self, obj):
        active_images = [img for img in obj.color_images.all() if not getattr(img, 'is_deleted', False)]
        return ProductColorImageSerializer(active_images, many=True, context=self.context).data

    def get_angle_images(self, obj):
        active_images = [img for img in obj.angle_images.all() if not getattr(img, 'is_deleted', False)]
        return ProductAngleImageSerializer(active_images, many=True, context=self.context).data

    def get_negative_reviews_count(self, obj):
        if hasattr(obj, 'negative_reviews_count'):
            return obj.negative_reviews_count
        return obj.reviews.filter(sentiment_label='negative', is_deleted=False).count()

    def get_positive_reviews_count(self, obj):
        if hasattr(obj, 'positive_reviews_count'):
            return obj.positive_reviews_count
        return obj.reviews.filter(sentiment_label='positive', is_deleted=False).count()

    def get_has_complaints(self, obj):
        neg_count = self.get_negative_reviews_count(obj)
        return neg_count > 0 or obj.sentiment_score < 0.40

    def get_is_top_ranked(self, obj):
        top_ids = self.context.get('top_5_product_ids')
        if top_ids is not None:
            return obj.id in top_ids
        return obj.is_feature_product or obj.ranking_score >= 0.70

    class Meta:
        model = Product
        fields = [
            'id',
            'categories',
            'categories_detail',
            'category_detail',
            'product_name',
            'brand',
            'capacity',
            'voltage',
            'weight',
            'weight_type',
            'description',
            'is_feature_product',
            'height_cm',
            'depth_cm',
            'width_cm',
            'security',
            'price',
            'product_image',
            'product_video',
            'features',
            'color_images',
            'angle_images',
            'total_views',
            'sentiment_score',
            'ranking_score',
            'negative_reviews_count',
            'positive_reviews_count',
            'has_complaints',
            'is_top_ranked',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id', 'total_views', 'sentiment_score', 'ranking_score',
            'negative_reviews_count', 'positive_reviews_count', 'has_complaints', 'is_top_ranked',
            'created_at', 'updated_at'
        ]

