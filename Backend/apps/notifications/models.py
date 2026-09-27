import datetime
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.utils import timezone
from apps.base.models import BaseModel


class SpecialCommercialDate(BaseModel):
    """
    Modelo para registrar temporadas comerciales especiales y recurrentes anualmente
    (Navidad, Día de la Madre, San Valentín, Black Friday, etc.).
    
    Estructurado con mes y día para permitir recurrencia anual dinámica
    y campo dinámico de días de anticipación.
    """
    name = models.CharField('Nombre del Evento Comercial', max_length=150)
    slug = models.SlugField('Slug Identificador', max_length=160, unique=True, blank=True)
    description = models.TextField('Descripción / Sugerencia de Promoción', blank=True, null=True)
    month = models.PositiveSmallIntegerField(
        'Mes',
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text='Mes del evento (1-12)'
    )
    day = models.PositiveSmallIntegerField(
        'Día',
        validators=[MinValueValidator(1), MaxValueValidator(31)],
        help_text='Día del evento (1-31)'
    )
    days_in_advance = models.PositiveSmallIntegerField(
        'Días de Anticipación',
        default=15,
        validators=[MinValueValidator(1), MaxValueValidator(365)],
        help_text='Días de anticipación para emitir la alerta al administrador'
    )
    is_active = models.BooleanField('Activo', default=True)
    last_notified_year = models.PositiveIntegerField(
        'Último Año Notificado',
        null=True,
        blank=True,
        help_text='Año en el que se emitió la última alerta para evitar duplicados en el mismo ciclo'
    )
    suggested_strategy = models.CharField(
        'Estrategia Comercial Sugerida',
        max_length=200,
        blank=True,
        default='',
        help_text='Ej. Combos de cocina, Descuento 20% en pantallas'
    )

    class Meta:
        verbose_name = 'Temporada Comercial Especial'
        verbose_name_plural = 'Temporadas Comerciales Especiales'
        ordering = ['month', 'day']
        indexes = [
            models.Index(fields=['month', 'day']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.day:02d}/{self.month:02d}) - {self.days_in_advance} días antes"

    def clean(self):
        super().clean()
        if not self.month or not self.day:
            return

        # Validación de días válidos según el mes
        max_days = {
            1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
            7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
        }
        month_limit = max_days.get(self.month, 31)
        if self.day > month_limit:
            raise ValidationError({
                'day': f'El mes {self.month} solo tiene hasta {month_limit} días.'
            })

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while SpecialCommercialDate.all_objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def get_next_occurrence(self, reference_date: datetime.date = None) -> datetime.date:
        """
        Calcula la fecha calendario de la próxima ocurrencia del evento
        considerando el año de referencia (hoy por defecto).
        """
        ref = reference_date or timezone.now().date()
        year = ref.year

        # Manejo seguro para 29 de Febrero en años no bisiestos
        day = self.day
        if self.month == 2 and day == 29:
            day = 29 if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) else 28

        try:
            target_date = datetime.date(year, self.month, day)
        except ValueError:
            target_date = datetime.date(year, self.month, 28)

        # Si la fecha ya ocurrió este año, la próxima ocurrencia es el próximo año
        if target_date < ref:
            next_year = year + 1
            if self.month == 2 and self.day == 29:
                next_day = 29 if (next_year % 4 == 0 and (next_year % 100 != 0 or next_year % 400 == 0)) else 28
            else:
                next_day = self.day
            target_date = datetime.date(next_year, self.month, next_day)

        return target_date

    def days_until(self, reference_date: datetime.date = None) -> int:
        """Retorna cuántos días faltan para la próxima ocurrencia."""
        ref = reference_date or timezone.now().date()
        next_date = self.get_next_occurrence(ref)
        return (next_date - ref).days

    def should_trigger_notification(self, reference_date: datetime.date = None) -> tuple[bool, int, int]:
        """
        Evalúa si debe dispararse la alerta para esta temporada:
        Retorna (should_notify: bool, days_left: int, target_year: int).
        Garantiza idempotencia anual usando last_notified_year.
        """
        if not self.is_active or self.is_deleted:
            return False, -1, 0

        ref = reference_date or timezone.now().date()
        next_date = self.get_next_occurrence(ref)
        days_left = (next_date - ref).days
        target_year = next_date.year

        # Condición: Dentro de la ventana de anticipación y no notificado previamente para este año de evento
        in_window = 0 <= days_left <= self.days_in_advance
        not_yet_notified = self.last_notified_year != target_year

        return (in_window and not_yet_notified), days_left, target_year


class CommercialEventAlert(BaseModel):
    """
    Modelo para registrar el historial de alertas emitidas y notificaciones activas.
    
    Alimenta tanto el sistema de alertas de la web (leídas/no leídas)
    como la trazabilidad de envíos hacia Telegram.
    Soporta temporadas comerciales y notificaciones de eventos transversales.
    """
    EVENT_TYPE_CHOICES = [
        ('commercial_season', 'Temporada Comercial'),
        ('product_stock', 'Alerta de Inventario'),
        ('promotion_event', 'Evento de Promoción'),
        ('system_alert', 'Alerta del Sistema'),
        ('custom', 'Personalizada'),
    ]

    event_type = models.CharField(
        'Tipo de Evento',
        max_length=50,
        choices=EVENT_TYPE_CHOICES,
        default='commercial_season',
        db_index=True
    )
    commercial_date = models.ForeignKey(
        SpecialCommercialDate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='alerts',
        verbose_name='Temporada Comercial Relacionada'
    )
    title = models.CharField('Título de la Alerta', max_length=200)
    message = models.TextField('Cuerpo del Mensaje')
    event_year = models.PositiveIntegerField('Año del Evento', null=True, blank=True)
    days_until_event = models.IntegerField('Días Restantes al Emitir', null=True, blank=True)
    
    telegram_sent = models.BooleanField('Enviado a Telegram', default=False)
    telegram_error = models.TextField('Detalle de Error de Telegram', blank=True, null=True)
    
    is_read = models.BooleanField('Leída en Panel Web', default=False, db_index=True)
    read_at = models.DateTimeField('Fecha de Lectura', null=True, blank=True)
    metadata = models.JSONField('Metadatos Adicionales', default=dict, blank=True)

    class Meta:
        verbose_name = 'Alerta de Notificación'
        verbose_name_plural = 'Alertas de Notificaciones'
        ordering = ['-created_at', '-id']
        indexes = [
            models.Index(fields=['is_read']),
            models.Index(fields=['event_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        read_badge = "✓" if self.is_read else "●"
        return f"[{read_badge}] {self.title} ({self.created_at})"

    def mark_as_read(self):
        """Marca la notificación como leída en la interfaz web."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at', 'updated_at'])


# Alias para máxima flexibilidad semántica
NotificationAlert = CommercialEventAlert
