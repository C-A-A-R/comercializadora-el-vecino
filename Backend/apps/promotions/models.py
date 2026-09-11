from decimal import Decimal
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.base.models import BaseModel
from apps.base.utils.images import rename_image_upload_to, compress_and_save_image
from apps.product.models import Product


class DiscountedPromotions(BaseModel):
    """
    Modelo para promociones con descuento (porcentaje o monto fijo)
    aplicables a uno o varios productos del catálogo.
    """
    PERCENTAGE = 'percentage'
    FIXED = 'fixed'
    DISCOUNTED_TYPE_CHOICES = [
        (PERCENTAGE, 'Porcentaje (%)'),
        (FIXED, 'Monto Fijo ($)'),
    ]

    name = models.CharField(max_length=200, verbose_name="Nombre")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    discounted_type = models.CharField(
        max_length=20,
        choices=DISCOUNTED_TYPE_CHOICES,
        default=PERCENTAGE,
        verbose_name="Tipo de descuento"
    )
    discounted_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Valor del descuento"
    )
    start_date = models.DateTimeField(verbose_name="Fecha de inicio")
    end_date = models.DateTimeField(verbose_name="Fecha de fin")
    image = models.ImageField(upload_to=rename_image_upload_to, blank=True, null=True, verbose_name="Imagen")
    
    products = models.ManyToManyField(
        Product,
        through='PromotionProduct',
        related_name='discounted_promotions',
        verbose_name="Productos en promoción",
        blank=True
    )

    class Meta:
        verbose_name = "Promoción con descuento"
        verbose_name_plural = "Promociones con descuento"
        ordering = ['-start_date']

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError({'end_date': 'La fecha de fin debe ser posterior a la fecha de inicio.'})
        
        if self.discounted_type == self.PERCENTAGE:
            if self.discounted_value <= Decimal('0') or self.discounted_value > Decimal('100'):
                raise ValidationError({'discounted_value': 'El porcentaje de descuento debe estar entre 0.01% y 100%.'})
        elif self.discounted_type == self.FIXED:
            if self.discounted_value <= Decimal('0'):
                raise ValidationError({'discounted_value': 'El monto de descuento fijo debe ser mayor a 0.'})

    @property
    def is_active(self):
        """Indica si la promoción está vigente según fechas y estado de eliminación lógica."""
        return not self.is_deleted and self.start_date <= timezone.now() <= self.end_date
    is_active.fget.short_description = "¿Promoción vigente?"

    def apply_discount(self, original_price: Decimal) -> Decimal:
        """Calcula el precio final aplicando el descuento sobre un precio base."""
        if not original_price or original_price <= Decimal('0'):
            return Decimal('0.00')

        if self.discounted_type == self.PERCENTAGE:
            discount = (original_price * self.discounted_value) / Decimal('100')
            final_price = original_price - discount
        else:
            final_price = original_price - self.discounted_value

        return max(final_price.quantize(Decimal('0.01')), Decimal('0.00'))

    def save(self, *args, **kwargs):
        if self.image:
            compress_and_save_image(self.image)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_discounted_type_display()}: {self.discounted_value})"


class PromotionProduct(BaseModel):
    """
    Modelo intermedio que asocia productos específicos a una promoción con descuento.
    """
    discounted_promotions = models.ForeignKey(
        DiscountedPromotions,
        on_delete=models.CASCADE,
        related_name='promotion_products',
        verbose_name="Promoción con descuento"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='promotion_products',
        verbose_name="Producto"
    )

    class Meta:
        verbose_name = "Producto en promoción"
        verbose_name_plural = "Productos en promoción"
        unique_together = ['discounted_promotions', 'product']

    @property
    def promotional_price(self):
        """Retorna el precio con descuento del producto asignado."""
        return self.discounted_promotions.apply_discount(self.product.price)

    def __str__(self):
        return f"{self.product.product_name} - {self.discounted_promotions.name}"


class PromotionCombo(BaseModel):
    """
    Modelo para combos promocionales con precio especial y vigencia,
    compuesto por uno o varios productos con cantidades definidas.
    """
    name = models.CharField(max_length=200, verbose_name="Nombre")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Precio del Combo")
    start_date = models.DateTimeField(verbose_name="Fecha de inicio", default=timezone.now)
    end_date = models.DateTimeField(verbose_name="Fecha de fin", null=True, blank=True)
    image = models.ImageField(
        upload_to=rename_image_upload_to, 
        blank=True, 
        null=True, 
        verbose_name="Imagen"
    )
    products = models.ManyToManyField(
        Product,
        through='ProductCombo',
        related_name='combos',
        verbose_name="Productos"
    )

    class Meta:
        verbose_name = "Combo Promocional"
        verbose_name_plural = "Combos Promocionales"
        ordering = ['-start_date', 'name']

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError({'end_date': 'La fecha de fin debe ser posterior a la fecha de inicio.'})
        if self.price is not None and self.price < Decimal('0'):
            raise ValidationError({'price': 'El precio del combo no puede ser negativo.'})

    @property
    def is_active(self):
        """Indica si el combo está vigente."""
        now = timezone.now()
        if self.is_deleted:
            return False
        if self.end_date:
            return self.start_date <= now <= self.end_date
        return self.start_date <= now
    is_active.fget.short_description = "¿Combo vigente?"

    @property
    def original_total_price(self):
        """Calcula el precio regular acumulado de todos los productos en el combo según sus cantidades."""
        total = Decimal('0.00')
        for item in self.combo_products.select_related('product').all():
            total += item.subtotal
        return total

    @property
    def savings(self):
        """Calcula el monto ahorrado comprando el combo en lugar de los productos por separado."""
        orig = self.original_total_price
        if orig > self.price:
            return orig - self.price
        return Decimal('0.00')

    @property
    def savings_percentage(self):
        """Porcentaje de ahorro que ofrece el combo."""
        orig = self.original_total_price
        if orig > Decimal('0') and orig > self.price:
            return (((orig - self.price) / orig) * Decimal('100')).quantize(Decimal('0.01'))
        return Decimal('0.00')

    def save(self, *args, **kwargs):
        if self.image:
            compress_and_save_image(self.image)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (${self.price})"


class ProductCombo(BaseModel):
    """
    Modelo intermedio que especifica qué productos y qué cantidades componen un combo.
    """
    combo = models.ForeignKey(
        PromotionCombo,
        on_delete=models.CASCADE,
        related_name='combo_products',
        verbose_name="Combo"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='combo_products',
        verbose_name="Producto"
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name="Cantidad"
    )

    class Meta:
        verbose_name = "Producto del Combo"
        verbose_name_plural = "Productos del Combo"
        unique_together = ['combo', 'product']

    def clean(self):
        super().clean()
        if self.quantity < 1:
            raise ValidationError({'quantity': 'La cantidad debe ser de al menos 1 unidad.'})

    @property
    def subtotal(self):
        """Subtotal regular del producto multiplicado por la cantidad."""
        if self.product and self.product.price:
            return self.product.price * self.quantity
        return Decimal('0.00')

    def __str__(self):
        return f"{self.quantity}x {self.product.product_name} en {self.combo.name}"
