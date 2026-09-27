import datetime
import logging
from typing import Optional, Dict, Any, List
from django.utils import timezone
from apps.notifications.models import SpecialCommercialDate
from apps.notifications.services.dispatcher import notify_event

logger = logging.getLogger(__name__)


def check_and_send_commercial_reminders(
    reference_date: Optional[datetime.date] = None,
    force: bool = False
) -> Dict[str, Any]:
    """
    Verifica las temporadas comerciales especiales activas y emite alertas
    si se encuentran dentro de su ventana de anticipación configurada.
    
    Evita cuellos de botella:
    - Consulta única optimizada de temporadas activas.
    - No bloquea ante fallos de conexión en Telegram.
    - Registra el año notificado para evitar repeticiones en el mismo ciclo comercial.
    
    :param reference_date: Fecha de referencia para evaluación (por defecto hoy).
    :param force: Si es True, envía la alerta incluso si ya fue notificada este año.
    :return: Diccionario resumen con estadísticas y alertas procesadas.
    """
    today = reference_date or timezone.now().date()
    active_dates = SpecialCommercialDate.objects.filter(is_active=True, is_deleted=False)
    
    notified_list: List[Dict[str, Any]] = []
    skipped_count = 0

    for season in active_dates:
        should_notify, days_left, target_year = season.should_trigger_notification(today)

        # Si se fuerza la ejecución, verificamos que esté en ventana sin importar si ya se notificó
        if force:
            next_date = season.get_next_occurrence(today)
            days_left = (next_date - today).days
            target_year = next_date.year
            should_notify = 0 <= days_left <= season.days_in_advance

        if should_notify:
            next_date = season.get_next_occurrence(today)
            formatted_date = next_date.strftime("%d de %B de %Y") if hasattr(next_date, 'strftime') else str(next_date)
            
            title = f"Recordatorio Comercial: {season.name} (en {days_left} días)"
            strategy_text = season.suggested_strategy or season.description or "Configura promociones, descuentos y combos con anticipación en el panel administrativo."
            
            message = (
                f"La temporada comercial <b>{season.name}</b> está próxima a ocurrir el <b>{next_date.strftime('%d/%m/%Y')}</b> "
                f"(faltan <b>{days_left} días</b>).\n\n"
                f"💡 <b>Estrategia Sugerida:</b>\n{strategy_text}\n\n"
                f"🔗 Ingresa al panel de promociones para configurar o programar combos y descuentos."
            )

            # Despachar a través del dispatcher (Telegram + SSE en vivo + Base de Datos)
            alert = notify_event(
                event_type='commercial_season',
                title=title,
                message=message,
                commercial_date=season,
                event_year=target_year,
                days_until_event=days_left,
                channels=['telegram', 'web'],
                metadata={
                    'slug': season.slug,
                    'season_name': season.name,
                    'target_date': next_date.isoformat(),
                    'days_in_advance': season.days_in_advance
                }
            )

            # Marcar el año para evitar duplicados en el mismo año
            season.last_notified_year = target_year
            season.save(update_fields=['last_notified_year', 'updated_at'])

            notified_list.append({
                'id': alert.id,
                'season': season.name,
                'days_left': days_left,
                'target_year': target_year,
                'telegram_sent': alert.telegram_sent
            })
            logger.info("[ReminderService] Alerta generada para '%s' (%d días restantes)", season.name, days_left)
        else:
            skipped_count += 1

    return {
        'evaluation_date': today.isoformat(),
        'total_evaluated': active_dates.count(),
        'notified_count': len(notified_list),
        'skipped_count': skipped_count,
        'alerts': notified_list
    }
