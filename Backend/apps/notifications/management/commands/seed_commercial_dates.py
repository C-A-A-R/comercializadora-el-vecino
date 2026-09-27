from django.core.management.base import BaseCommand
from apps.notifications.signals import seed_default_commercial_dates


class Command(BaseCommand):
    help = 'Prellena o sincroniza de forma idempotente las temporadas comerciales especiales por defecto en la base de datos.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Iniciando siembra de fechas comerciales...'))
        count = seed_default_commercial_dates()
        self.stdout.write(self.style.SUCCESS(f'Siembra completada con éxito. Fechas procesadas/restauradas: {count}'))
