import os
import uuid
from django.db import models
from apps.base.models import BaseModel
from apps.base.utils.images import rename_image_upload_to, compress_and_save_image
from apps.base.utils.videos import rename_video_upload_to, compress_and_save_video


class Category(BaseModel):
    """Modelo para representar las Categorías de productos."""

    category_name = models.CharField('Nombre de Categoría', max_length=150, unique=True)
    description = models.TextField('Descripción', null=True, blank=True)
    category_image = models.ImageField('Imagen de Categoría', upload_to=rename_image_upload_to, null=True, blank=True)

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['category_name']

    def __str__(self):
        return self.category_name

    def save(self, *args, **kwargs):
        if self.category_image:
            compress_and_save_image(self.category_image)
        super().save(*args, **kwargs)


class ProductType(BaseModel):
    """Modelo para representar los Tipos de Productos."""

    product_type_name = models.CharField('Nombre del Tipo', max_length=100, unique=True)
    description = models.TextField('Descripción', null=True, blank=True)
    product_type_image = models.ImageField('Imagen del Tipo', upload_to=rename_image_upload_to, null=True, blank=True)

    class Meta:
        verbose_name = 'Tipo de Producto'
        verbose_name_plural = 'Tipos de Productos'
        ordering = ['product_type_name']

    def __str__(self):
        return self.product_type_name

    def save(self, *args, **kwargs):
        if self.product_type_image:
            compress_and_save_image(self.product_type_image)
        super().save(*args, **kwargs)


class Product(BaseModel):
    """Modelo para representar los Productos."""

    categories = models.ManyToManyField(
        Category,
        related_name='products',
        verbose_name='Categorías',
        blank=True
    )
    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Tipo de Producto'
    )
    product_name = models.CharField('Nombre del Producto', max_length=200)
    brand = models.CharField('Marca', max_length=150, null=True, blank=True)
    capacity = models.CharField('Capacidad', max_length=100, null=True, blank=True, help_text='Ej. 1.5L, 500GB, 12kg, 60L')
    voltage = models.CharField('Voltaje', max_length=50, null=True, blank=True, help_text='Ej. 110V, 220V, 110V/220V')
    weight = models.DecimalField('Peso (kg)', max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    weight_type = models.CharField('Tipo de Peso / Clasificación', max_length=100, null=True, blank=True, help_text='Ej. Neto, Bruto, Embalado')
    description = models.TextField('Descripción', null=True, blank=True)
    is_feature_product = models.BooleanField('Producto Destacado', default=False)
    height_cm = models.DecimalField('Alto (cm)', max_digits=10, decimal_places=2, default=0)
    depth_cm = models.DecimalField('Profundo (cm)', max_digits=10, decimal_places=2, default=0)
    width_cm = models.DecimalField('Ancho (cm)', max_digits=10, decimal_places=2, default=0)
    security = models.CharField('Seguridad', max_length=255, default='', blank=True)
    price = models.DecimalField('Precio', max_digits=12, decimal_places=2, default=0)
    product_image = models.ImageField('Imagen del Producto', upload_to=rename_image_upload_to, null=True, blank=True)
    product_video = models.FileField('Video del Producto', upload_to=rename_video_upload_to, null=True, blank=True)

    # ── Campos de analíticas ──
    total_views = models.PositiveIntegerField('Total de Vistas', default=0)
    sentiment_score = models.FloatField('Score de Sentimiento', default=0.0)
    ranking_score = models.FloatField('Score de Ranking', default=0.0)

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['product_name']

    @property
    def category(self):
        """Retorna la primera categoría asignada para mantener compatibilidad hacia atrás."""
        return self.categories.first()

    def save(self, *args, **kwargs):
        if self.product_image:
            compress_and_save_image(self.product_image)
        if self.product_video:
            compress_and_save_video(self.product_video)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.product_name


class ProductFeature(BaseModel):
    """Modelo para representar las características o especificaciones técnicas de un producto."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='features',
        verbose_name='Producto'
    )
    feature_name = models.CharField('Nombre de la Característica', max_length=150, help_text='Ej. Material, Garantía, Eficiencia Energética')
    feature_value = models.CharField('Valor de la Característica', max_length=255, help_text='Ej. Acero Inoxidable, 1 Año, A++')

    class Meta:
        verbose_name = 'Característica de Producto'
        verbose_name_plural = 'Características de Productos'
        ordering = ['id']

    def __str__(self):
        return f"{self.feature_name}: {self.feature_value} - {self.product.product_name}"



class ProductColorImage(BaseModel):
    """Modelo para representar múltiples imágenes asociadas a un producto, asignando un color hexadecimal."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='color_images',
        verbose_name='Producto'
    )
    color_image = models.ImageField(
        'Imagen',
        upload_to=rename_image_upload_to,
        null=True,
        blank=True
    )
    color_hex = models.CharField(
        'Color Hexadecimal',
        max_length=7,
        default='#000000',
        help_text='Código de color hexadecimal (ej. #FF5733)'
    )
    color_name = models.CharField(
        'Nombre del Color',
        max_length=100,
        null=True,
        blank=True,
        help_text='Nombre del color asociado a la imagen (ej. Rojo, Azul, Verde)'
    )

    class Meta:
        verbose_name = 'Color de Producto'
        verbose_name_plural = 'Colores de los Productos'

    def save(self, *args, **kwargs):
        if self.color_image:
            compress_and_save_image(self.color_image)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Imagen ({self.color_hex}) - {self.product.product_name}"


class ProductAngleImage(BaseModel):
    """Modelo para representar imágenes de diferentes ángulos asociadas a un producto."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='angle_images',
        verbose_name='Producto'
    )
    image = models.ImageField(
        'Imagen del Ángulo',
        upload_to=rename_image_upload_to,
        null=True,
        blank=True
    )
    angle = models.CharField(
        'Ángulo / Vista',
        max_length=100,
        null=True,
        blank=True,
        help_text='Nombre o tipo de ángulo (ej. Frente, Lateral, Posterior, Detalle)'
    )

    class Meta:
        verbose_name = 'Ángulo de Producto'
        verbose_name_plural = 'Ángulos de Productos'
        ordering = ['id']

    def save(self, *args, **kwargs):
        if self.image:
            compress_and_save_image(self.image)
        super().save(*args, **kwargs)

    def __str__(self):
        angle_str = f" - {self.angle}" if self.angle else ""
        return f"Ángulo{angle_str} - {self.product.product_name}"


class ProductReview(BaseModel):
    """Modelo para almacenar reseñas de productos con clasificación de sentimiento."""

    SENTIMENT_CHOICES = [
        ('positive', 'Positivo'),
        ('neutral', 'Neutral'),
        ('negative', 'Negativo'),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='Producto'
    )
    comment = models.TextField('Comentario')
    sentiment_label = models.CharField(
        'Etiqueta de Sentimiento',
        max_length=10,
        choices=SENTIMENT_CHOICES,
        default='neutral'
    )
    sentiment_confidence = models.FloatField('Confianza del Sentimiento', default=0.0)

    class Meta:
        verbose_name = 'Reseña de Producto'
        verbose_name_plural = 'Reseñas de Productos'
        ordering = ['-created_at']

    def __str__(self):
        return f"Reseña ({self.sentiment_label}) - {self.product.product_name}"


class ProductViewLog(BaseModel):
    """Modelo para registrar vistas de productos con dirección IP."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='view_logs',
        verbose_name='Producto'
    )
    ip_address = models.GenericIPAddressField('Dirección IP', null=True, blank=True)

    class Meta:
        verbose_name = 'Registro de Vista'
        verbose_name_plural = 'Registros de Vistas'
        ordering = ['-created_at']

    def __str__(self):
        return f"Vista de {self.product.product_name} - {self.ip_address or 'IP desconocida'}"
