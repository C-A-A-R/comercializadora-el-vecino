from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from apps.base.api import BaseViewSet
from apps.notifications.models import SpecialCommercialDate, CommercialEventAlert
from apps.notifications.api.serializers import (
    SpecialCommercialDateSerializer,
    CommercialEventAlertSerializer
)
from apps.notifications.services.reminder_service import check_and_send_commercial_reminders
from apps.notifications.services.dispatcher import notify_event
from apps.notifications.services.sse_stream import register_client, sse_event_generator


class SpecialCommercialDateViewSet(BaseViewSet):
    """
    ViewSet para la administración de fechas comerciales especiales:
    - Listado paginado y ordenado por mes/día.
    - Creación y edición manual de fechas comerciales por el administrador.
    - Borrado lógico heredado de BaseViewSet.
    - Acciones para evaluar recordatorios bajo demanda o enviar alertas de prueba.
    """
    permission_classes = [AllowAny]
    queryset = SpecialCommercialDate.objects.all()
    serializer_class = SpecialCommercialDateSerializer
    filterset_fields = ['month', 'is_active']
    search_fields = ['name', 'description', 'suggested_strategy']
    ordering_fields = ['month', 'day', 'days_in_advance', 'name', 'created_at']
    ordering = ['month', 'day']

    @action(detail=True, methods=['post'], url_path='test-alert')
    def test_alert(self, request, pk=None):
        """
        Dispara una alerta de prueba inmediata hacia Telegram y SSE para esta fecha especial.
        """
        season = self.get_object()
        days_left = season.days_until()
        next_date = season.get_next_occurrence()

        title = f"[TEST] Alerta de Prueba: {season.name}"
        message = (
            f"🧪 Esta es una notificación de prueba para la temporada comercial <b>{season.name}</b>.\n\n"
            f"📅 Próxima fecha: <b>{next_date.strftime('%d/%m/%Y')}</b> (faltan {days_left} días).\n"
            f"💡 Estrategia configurada: {season.suggested_strategy or season.description or 'Sin estrategia'}\n"
            f"⚙️ Días de anticipación configurados: {season.days_in_advance} días."
        )

        alert = notify_event(
            event_type='commercial_season',
            title=title,
            message=message,
            commercial_date=season,
            event_year=next_date.year,
            days_until_event=days_left,
            channels=['telegram', 'web'],
            metadata={'test': True, 'slug': season.slug}
        )

        serializer = CommercialEventAlertSerializer(alert)
        return Response({
            'detail': 'Alerta de prueba emitida correctamente',
            'alert': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='check-now')
    def check_now(self, request):
        """
        Ejecuta manualmente el motor de recordatorios para evaluar todas las temporadas activas.
        """
        force = bool(request.data.get('force', False))
        result = check_and_send_commercial_reminders(force=force)
        return Response(result, status=status.HTTP_200_OK)


class CommercialEventAlertViewSet(BaseViewSet):
    """
    ViewSet para consultar y gestionar el historial de notificaciones y alertas activas:
    - Filtrado por estado de lectura (is_read), tipo de evento (event_type), estado de Telegram.
    - Soporta marcar alertas leídas individualmente o en lote.
    - Permite emitir eventos personalizados desde cualquier app o cliente autorizado.
    """
    permission_classes = [AllowAny]
    queryset = CommercialEventAlert.objects.all()
    serializer_class = CommercialEventAlertSerializer
    filterset_fields = ['is_read', 'event_type', 'telegram_sent']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'id', 'is_read']
    ordering = ['-created_at', '-id']

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Marca una alerta individual como leída en la web."""
        alert = self.get_object()
        alert.mark_as_read()
        serializer = self.get_serializer(alert)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Marca todas las alertas no leídas como leídas en una sola consulta."""
        updated_count = CommercialEventAlert.objects.filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'detail': f'{updated_count} alertas fueron marcadas como leídas exitosamente.',
            'count': updated_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='active')
    def active_alerts(self, request):
        """Retorna las alertas no leídas ordenadas cronológicamente."""
        active_qs = self.get_queryset().filter(is_read=False)[:50]
        serializer = self.get_serializer(active_qs, many=True)
        return Response({
            'unread_count': active_qs.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='broadcast')
    def broadcast_custom_event(self, request):
        """
        Permite enviar una notificación por eventos importantes en el catálogo o ERP
        (e.g., producto sin stock, promo relámpago, aviso del sistema).
        """
        title = request.data.get('title')
        message = request.data.get('message')
        event_type = request.data.get('event_type', 'system_alert')
        channels = request.data.get('channels', ['telegram', 'web'])
        metadata = request.data.get('metadata', {})

        if not title or not message:
            return Response(
                {'error': 'Los campos title y message son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        alert = notify_event(
            event_type=event_type,
            title=title,
            message=message,
            channels=channels,
            metadata=metadata
        )

        serializer = self.get_serializer(alert)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificationStreamView(APIView):
    """
    Endpoint de Streaming en Vivo (Server-Sent Events / SSE):
    GET /api/notifications/stream/
    
    Permite al frontend web reaccionar de inmediato 'en vivo' a nuevas notificaciones
    sin requerir polling constante ni Websockets pesados con Redis.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        client_queue = register_client()
        response = StreamingHttpResponse(
            sse_event_generator(client_queue),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache, no-transform'
        response['X-Accel-Buffering'] = 'no'
        return response
