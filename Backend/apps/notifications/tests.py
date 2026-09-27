import datetime
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from apps.notifications.models import SpecialCommercialDate, CommercialEventAlert
from apps.notifications.signals import seed_default_commercial_dates, DEFAULT_COMMERCIAL_DATES
from apps.notifications.services.reminder_service import check_and_send_commercial_reminders
from apps.notifications.services.dispatcher import notify_event
from apps.base.services.telegram import BaseTelegramService


class CommercialDateModelTests(TestCase):
    """Pruebas del modelo SpecialCommercialDate y cálculo de recurrencia anual."""

    def test_seeding_creates_all_mandatory_dates(self):
        """Verifica que el prellenado crea las 8 fechas obligatorias."""
        count = seed_default_commercial_dates()
        self.assertEqual(SpecialCommercialDate.objects.count(), 8)

        # Verificar nombres obligatorios
        expected_slugs = {item['slug'] for item in DEFAULT_COMMERCIAL_DATES}
        db_slugs = set(SpecialCommercialDate.objects.values_list('slug', flat=True))
        self.assertEqual(expected_slugs, db_slugs)

    def test_seeding_is_idempotent(self):
        """Verifica que ejecutar el seeding varias veces no duplica registros."""
        seed_default_commercial_dates()
        initial_count = SpecialCommercialDate.objects.count()

        # Segunda ejecución
        seed_default_commercial_dates()
        self.assertEqual(SpecialCommercialDate.objects.count(), initial_count)

    def test_next_occurrence_and_days_until(self):
        """Prueba el cálculo de próxima ocurrencia respetando fechas pasadas y futuras."""
        date_obj = SpecialCommercialDate.objects.create(
            name="Navidad Test",
            month=12,
            day=25,
            days_in_advance=30
        )
        
        # Simular fecha antes de Navidad
        ref_before = datetime.date(2026, 12, 1)
        next_occ = date_obj.get_next_occurrence(ref_before)
        self.assertEqual(next_occ, datetime.date(2026, 12, 25))
        self.assertEqual(date_obj.days_until(ref_before), 24)

        # Simular fecha después de Navidad (debe pasar a 2027)
        ref_after = datetime.date(2026, 12, 26)
        next_occ_next_year = date_obj.get_next_occurrence(ref_after)
        self.assertEqual(next_occ_next_year, datetime.date(2027, 12, 25))
        self.assertEqual(date_obj.days_until(ref_after), 364)

    def test_anti_duplication_with_last_notified_year(self):
        """Verifica que una fecha notificada para un año no se vuelva a notificar."""
        date_obj = SpecialCommercialDate.objects.create(
            name="Cyber Test",
            month=11,
            day=30,
            days_in_advance=15,
            last_notified_year=None
        )

        ref_date = datetime.date(2026, 11, 20)  # 10 días antes -> dentro de ventana
        should_notify, days_left, year = date_obj.should_trigger_notification(ref_date)
        self.assertTrue(should_notify)
        self.assertEqual(days_left, 10)
        self.assertEqual(year, 2026)

        # Marcar como ya notificada en 2026
        date_obj.last_notified_year = 2026
        date_obj.save()

        should_notify_again, _, _ = date_obj.should_trigger_notification(ref_date)
        self.assertFalse(should_notify_again)


class TelegramServiceTests(TestCase):
    """Pruebas del servicio BaseTelegramService en apps.base."""

    def test_unconfigured_service_handles_gracefully(self):
        """Verifica que sin credenciales no rompa ni arroje excepción."""
        service = BaseTelegramService(bot_token="", default_chat_id="")
        self.assertFalse(service.is_configured)
        success, detail = service.send_message("Test message")
        self.assertFalse(success)
        self.assertIn("no está configurado", detail)

    @patch('urllib.request.urlopen')
    def test_configured_service_sends_successfully(self, mock_urlopen):
        """Verifica el envío exitoso simulando respuesta 200 de Telegram."""
        import io
        import json

        mock_response = io.BytesIO(json.dumps({'ok': True, 'result': {'message_id': 123}}).encode('utf-8'))
        mock_response.getcode = lambda: 200
        mock_urlopen.return_value.__enter__.return_value = mock_response

        service = BaseTelegramService(bot_token="test_token", default_chat_id="12345")
        success, detail = service.send_message("<b>Mensaje HTML</b>")
        self.assertTrue(success)
        self.assertEqual(detail, "Mensaje enviado exitosamente")


class NotificationDispatcherAndReminderTests(TestCase):
    """Pruebas del despachador universal y el servicio de recordatorios."""

    def test_notify_event_creates_alert_record(self):
        """Verifica que notify_event persiste en base de datos."""
        alert = notify_event(
            event_type='product_stock',
            title="Stock Bajo: Smart TV LG OLED",
            message="Quedan solo 2 unidades en inventario.",
            channels=['web']  # Solo web para esta prueba
        )
        self.assertIsNotNone(alert.id)
        self.assertEqual(alert.event_type, 'product_stock')
        self.assertFalse(alert.is_read)

        # Marcar como leída
        alert.mark_as_read()
        self.assertTrue(alert.is_read)
        self.assertIsNotNone(alert.read_at)

    def test_check_and_send_commercial_reminders(self):
        """Verifica el motor de recordatorios con una fecha próxima."""
        SpecialCommercialDate.objects.create(
            name="Temporada Simulación",
            slug="temporada-simulacion",
            month=5,
            day=10,
            days_in_advance=15
        )

        # Simular fecha 5 días antes (5 de Mayo)
        ref_date = datetime.date(2026, 5, 5)
        res = check_and_send_commercial_reminders(reference_date=ref_date)
        self.assertEqual(res['notified_count'], 1)
        self.assertEqual(res['alerts'][0]['season'], "Temporada Simulación")
        self.assertEqual(res['alerts'][0]['days_left'], 5)

        # Segunda ejecución sin force -> debe omitirse por anti-duplicidad
        res2 = check_and_send_commercial_reminders(reference_date=ref_date)
        self.assertEqual(res2['notified_count'], 0)


class NotificationAPITests(APITestCase):
    """Pruebas de los endpoints DRF en /api/notifications/."""

    def setUp(self):
        self.date_obj = SpecialCommercialDate.objects.create(
            name="San Valentín API Test",
            slug="san-valentin-api-test",
            month=2,
            day=14,
            days_in_advance=10
        )
        self.alert_obj = CommercialEventAlert.objects.create(
            event_type='commercial_season',
            title="Alerta API Test",
            message="Contenido de prueba",
            is_read=False
        )

    def test_get_commercial_dates(self):
        """GET /api/notifications/dates/"""
        url = reverse('commercial-dates-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # La paginación StandardResultsSetPagination envuelve en 'results'
        self.assertIn('results', response.data)

    def test_post_create_commercial_date(self):
        """POST /api/notifications/dates/ crea nueva temporada personalizada."""
        url = reverse('commercial-dates-list')
        payload = {
            'name': 'Día del Niño',
            'month': 8,
            'day': 16,
            'days_in_advance': 12,
            'description': 'Promociones en consolas y juguetes electrónicos.'
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SpecialCommercialDate.objects.filter(slug='dia-del-nino').exists())

    def test_post_test_alert_action(self):
        """POST /api/notifications/dates/{id}/test-alert/"""
        url = reverse('commercial-dates-test-alert', kwargs={'pk': self.date_obj.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Alerta de prueba emitida correctamente')

    def test_get_alerts_list(self):
        """GET /api/notifications/alerts/"""
        url = reverse('notification-alerts-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_mark_alert_read(self):
        """POST /api/notifications/alerts/{id}/mark-read/"""
        url = reverse('notification-alerts-mark-read', kwargs={'pk': self.alert_obj.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert_obj.refresh_from_db()
        self.assertTrue(self.alert_obj.is_read)

    def test_broadcast_custom_event(self):
        """POST /api/notifications/alerts/broadcast/"""
        url = reverse('notification-alerts-broadcast-custom-event')
        payload = {
            'event_type': 'system_alert',
            'title': 'Mantenimiento Programado',
            'message': 'El sistema entrará en mantenimiento el domingo a las 02:00 AM.',
            'channels': ['web']
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Mantenimiento Programado')
