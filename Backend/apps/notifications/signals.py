import logging
from django.db.models.signals import post_migrate
from django.dispatch import receiver

logger = logging.getLogger(__name__)

DEFAULT_COMMERCIAL_DATES = [
    {
        'name': 'Año Nuevo',
        'slug': 'ano-nuevo',
        'month': 1,
        'day': 1,
        'days_in_advance': 15,
        'description': 'Temporada de renovación de hogar y nuevos propósitos. Ideal para ofertas de electrodomésticos y tecnología.',
        'suggested_strategy': 'Campaña "Año Nuevo, Hogar Nuevo" con descuentos destacados en línea blanca y refrigeración.'
    },
    {
        'name': 'San Valentín',
        'slug': 'san-valentin',
        'month': 2,
        'day': 14,
        'days_in_advance': 15,
        'description': 'Día del Amor y la Amistad. Alta demanda en tecnología personal, audio y pequeños electrodomésticos.',
        'suggested_strategy': 'Combos especiales para parejas y descuentos en Smart TVs, barras de sonido y air fryers.'
    },
    {
        'name': 'Día de la Madre',
        'slug': 'dia-de-la-madre',
        'month': 5,
        'day': 10,
        'days_in_advance': 20,
        'description': 'Una de las temporadas comerciales más rentables del año. Fuerte impulso en línea blanca, cocina y cuidado.',
        'suggested_strategy': 'Promociones combo en lavadoras, refrigeración y pequeños electrodomésticos.'
    },
    {
        'name': 'Día del Padre',
        'slug': 'dia-del-padre',
        'month': 6,
        'day': 15,
        'days_in_advance': 15,
        'description': 'Celebración del Día del Padre con alta demanda en entretenimiento, gaming, Smart TVs y sonido.',
        'suggested_strategy': 'Descuentos destacados en televisores OLED/QLED y barras de sonido de alta fidelidad.'
    },
    {
        'name': 'Halloween',
        'slug': 'halloween',
        'month': 10,
        'day': 31,
        'days_in_advance': 15,
        'description': 'Fin de octubre. Oportunidad para ofertas temáticas y promociones relámpago de media temporada.',
        'suggested_strategy': 'Ventas especiales temáticas y precios especiales en categorías seleccionadas.'
    },
    {
        'name': 'Black Friday',
        'slug': 'black-friday',
        'month': 11,
        'day': 27,
        'days_in_advance': 20,
        'description': 'La mayor jornada global de descuentos comerciales. Máxima conversión en todas las líneas.',
        'suggested_strategy': 'Mega descuentos por tiempo limitado y liquidación de inventario con precios insuperables.'
    },
    {
        'name': 'Cyber Monday',
        'slug': 'cyber-monday',
        'month': 11,
        'day': 30,
        'days_in_advance': 15,
        'description': 'Jornada de comercio electrónico por excelencia. Cierre del fin de semana de rebajas de noviembre.',
        'suggested_strategy': 'Ofertas exclusivas en el catálogo online con promociones destacadas en tecnología.'
    },
    {
        'name': 'Navidad',
        'slug': 'navidad',
        'month': 12,
        'day': 25,
        'days_in_advance': 30,
        'description': 'El pico comercial más alto del año. Compras navideñas de regalos, combos familiares y renovación de equipos.',
        'suggested_strategy': 'Combos navideños especiales, facilidades de pago y destacados de regalos para el hogar.'
    },
]


def seed_default_commercial_dates() -> int:
    """
    Siembra o sincroniza de manera idempotente las fechas comerciales obligatorias.
    
    Reglas de Resiliencia:
    - Si el registro no existe, lo crea con los valores por defecto.
    - Si fue borrado lógicamente, lo restaura.
    - Si ya existe y está activo, NO sobreescribe personalizaciones del administrador (como días de anticipación).
    - Retorna el número de registros creados o restaurados.
    """
    from apps.notifications.models import SpecialCommercialDate

    count = 0
    for data in DEFAULT_COMMERCIAL_DATES:
        slug = data['slug']
        existing = SpecialCommercialDate.all_objects.filter(slug=slug).first()

        if existing:
            if existing.is_deleted:
                existing.is_deleted = False
                existing.deleted_at = None
                existing.save()
                count += 1
                logger.info("[Seeding] Fecha comercial restaurada: %s", existing.name)
        else:
            SpecialCommercialDate.objects.create(
                name=data['name'],
                slug=slug,
                month=data['month'],
                day=data['day'],
                days_in_advance=data['days_in_advance'],
                description=data['description'],
                suggested_strategy=data['suggested_strategy'],
                is_active=True
            )
            count += 1
            logger.info("[Seeding] Fecha comercial creada: %s", data['name'])

    return count


@receiver(post_migrate)
def auto_seed_commercial_dates_on_migrate(sender, **kwargs):
    """
    Hook de Django que autogenera las fechas comerciales inmediatamente
    después de aplicar las migraciones de la app apps.notifications.
    """
    if sender.name == 'apps.notifications':
        logger.info("[Notifications] Ejecutando autocarga post_migrate de fechas comerciales...")
        created_count = seed_default_commercial_dates()
        logger.info("[Notifications] Autocarga completada. Fechas creadas/restauradas: %d", created_count)
