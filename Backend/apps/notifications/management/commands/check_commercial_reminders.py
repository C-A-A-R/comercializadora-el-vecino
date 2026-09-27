import datetime
from django.core.management.base import BaseCommand
from apps.notifications.services.reminder_service import check_and_send_commercial_reminders


class Command(BaseCommand):
    help = 'Evalúa las fechas comerciales especiales y envía recordatorios vía Telegram y en vivo vía SSE si están dentro de la ventana de anticipación.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Fuerza el envío de las alertas incluso si ya fueron notificadas este año.'
        )
        parser.add_argument(
            '--date',
            type=str,
            help='Fecha de simulación en formato YYYY-MM-DD (ej: 2026-12-10).'
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        date_str = options.get('date')

        target_date = None
        if date_str:
            try:
                target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
                self.stdout.write(self.style.WARNING(f"Evaluando con fecha simulada: {target_date}"))
            except ValueError:
                self.stderr.write(self.style.ERROR("Formato de fecha inválido. Use YYYY-MM-DD."))
                return

        self.stdout.write(self.style.NOTICE("Iniciando evaluación de temporadas comerciales..."))
        result = check_and_send_commercial_reminders(reference_date=target_date, force=force)

        self.stdout.write(
            self.style.SUCCESS(
                f"Evaluación completada para {result['evaluation_date']}:\n"
                f"- Total evaluadas: {result['total_evaluated']}\n"
                f"- Alertas enviadas: {result['notified_count']}\n"
                f"- Fechas fuera de ventana: {result['skipped_count']}"
            )
        )

        for alert in result.get('alerts', []):
            status_tg = "✓ Telegram enviado" if alert['telegram_sent'] else "✗ Telegram no enviado"
            self.stdout.write(f"  • {alert['season']} ({alert['days_left']} días restantes) -> {status_tg}")
