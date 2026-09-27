import os
import sys
import time
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)

_scheduler_thread: Optional[threading.Thread] = None
_stop_event = threading.Event()


def _scheduler_loop(check_interval_seconds: int = 21600):  # Por defecto cada 6 horas
    """
    Bucle en segundo plano para verificar periódicamente las temporadas comerciales.
    Se ejecuta automáticamente sin requerir que ningún usuario visite la web.
    """
    logger.info("[Scheduler] Hilo de verificación automática de recordatorios iniciado.")
    
    # Pequeña pausa inicial de 10 segundos tras levantar el servidor para permitir que la BD esté lista
    time.sleep(10)

    while not _stop_event.is_set():
        try:
            from apps.notifications.services.reminder_service import check_and_send_commercial_reminders
            logger.info("[Scheduler] Ejecutando verificación automática de temporadas comerciales...")
            res = check_and_send_commercial_reminders()
            logger.info(
                "[Scheduler] Verificación completada: %d evaluadas, %d alertas emitidas.",
                res.get('total_evaluated', 0),
                res.get('notified_count', 0)
            )
        except Exception as e:
            logger.error("[Scheduler] Error durante la verificación periódica de recordatorios: %s", str(e))

        # Dormir en intervalos de 5 segundos para reaccionar inmediatamente a señales de parada
        elapsed = 0
        while elapsed < check_interval_seconds and not _stop_event.is_set():
            time.sleep(5)
            elapsed += 5


def start_scheduler():
    """
    Inicia el programador en segundo plano si las condiciones del entorno son las adecuadas.
    Evita ejecuciones dobles durante el reload de desarrollo de Django (autoreload).
    """
    global _scheduler_thread

    # Evitar iniciar durante comandos de administración interactivos o migraciones
    disallowed_commands = {'migrate', 'makemigrations', 'test', 'shell', 'seed_commercial_dates'}
    for arg in sys.argv:
        if arg in disallowed_commands:
            return

    # En entorno de desarrollo (runserver con autoreload), solo arrancar en el proceso hijo principal
    if 'runserver' in sys.argv and os.environ.get('RUN_MAIN') != 'true':
        return

    if _scheduler_thread is not None and _scheduler_thread.is_alive():
        return

    _stop_event.clear()
    _scheduler_thread = threading.Thread(
        target=_scheduler_loop,
        name="CommercialReminderSchedulerThread",
        daemon=True
    )
    _scheduler_thread.start()
    logger.info("[Scheduler] BackgroundNotificationScheduler arrancado con éxito.")


def stop_scheduler():
    """Detiene el hilo del programador."""
    _stop_event.set()
