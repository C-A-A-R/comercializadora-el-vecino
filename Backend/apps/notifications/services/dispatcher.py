import logging
from typing import Optional, List, Dict, Any
from django.dispatch import Signal
from apps.base.services.telegram import BaseTelegramService
from apps.notifications.services.sse_stream import broadcast_sse_event

logger = logging.getLogger(__name__)

# Señal Django para desacoplamiento total: cualquier app puede disparar esta señal
# notification_requested.send(sender=..., event_type=..., title=..., message=..., ...)
notification_requested = Signal()


def notify_event(
    event_type: str,
    title: str,
    message: str,
    commercial_date=None,
    event_year: Optional[int] = None,
    days_until_event: Optional[int] = None,
    channels: Optional[List[str]] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Any:
    """
    Despachador central y universal de notificaciones para todo el sistema.
    
    Permite a cualquier app (product, promotions, sales, etc.) emitir notificaciones
    que se persisten en base de datos, se envían a Telegram y se transmiten
    en vivo al frontend mediante Server-Sent Events (SSE).
    
    :param event_type: Tipo de evento ('commercial_season', 'product_stock', 'promotion_event', 'system_alert', etc.)
    :param title: Título corto y descriptivo
    :param message: Contenido detallado del aviso
    :param commercial_date: Instancia opcional de SpecialCommercialDate
    :param event_year: Año del evento si aplica
    :param days_until_event: Días de anticipación restantes si aplica
    :param channels: Lista de canales de destino ('telegram', 'web'). Por defecto ambos.
    :param metadata: Diccionario con datos contextuales adicionales (IDs de productos, slugs, etc.)
    :return: Instancia de CommercialEventAlert creada
    """
    from apps.notifications.models import CommercialEventAlert

    target_channels = channels or ['telegram', 'web']
    meta_dict = metadata or {}

    # 1. Persistencia en Base de Datos (Auditoría e Historial Web)
    alert = CommercialEventAlert.objects.create(
        event_type=event_type,
        commercial_date=commercial_date,
        title=title,
        message=message,
        event_year=event_year,
        days_until_event=days_until_event,
        metadata=meta_dict,
        is_read=False
    )

    # 2. Envío a Telegram (Push Externo)
    if 'telegram' in target_channels:
        try:
            telegram_service = BaseTelegramService()
            if telegram_service.is_configured:
                # Formato enriquecido en HTML para Telegram
                formatted_tg_text = (
                    f"🔔 <b>{title}</b>\n\n"
                    f"{message}\n\n"
                    f"📅 <i>Sistema Comercializadora El Vecino</i>"
                )
                success, detail = telegram_service.send_message(
                    text=formatted_tg_text,
                    parse_mode='HTML'
                )
                alert.telegram_sent = success
                if not success:
                    alert.telegram_error = detail
            else:
                alert.telegram_error = "Credenciales de Telegram no configuradas en el entorno."
        except Exception as e:
            logger.exception("[Dispatcher] Error al despachar alerta a Telegram: %s", str(e))
            alert.telegram_error = str(e)
            alert.telegram_sent = False

        alert.save(update_fields=['telegram_sent', 'telegram_error'])

    # 3. Emisión en Vivo al Frontend (Web SSE Stream)
    if 'web' in target_channels:
        try:
            sse_payload = {
                'id': alert.id,
                'event_type': alert.event_type,
                'title': alert.title,
                'message': alert.message,
                'days_until_event': alert.days_until_event,
                'created_at': alert.created_at.isoformat() if alert.created_at else None,
                'is_read': alert.is_read,
                'metadata': alert.metadata,
            }
            broadcast_sse_event('notification', sse_payload)
            logger.info("[Dispatcher] Alerta transmitida en vivo vía SSE: '%s' (ID %d)", title, alert.id)
        except Exception as e:
            logger.error("[Dispatcher] Error al emitir evento SSE: %s", str(e))

    return alert


def _handle_notification_signal(sender, **kwargs):
    """Receptor de la señal notification_requested."""
    event_type = kwargs.get('event_type', 'system_alert')
    title = kwargs.get('title', 'Notificación del Sistema')
    message = kwargs.get('message', '')
    channels = kwargs.get('channels', ['telegram', 'web'])
    metadata = kwargs.get('metadata', {})
    notify_event(
        event_type=event_type,
        title=title,
        message=message,
        channels=channels,
        metadata=metadata
    )


# Conexión automática de la señal
notification_requested.connect(_handle_notification_signal)
