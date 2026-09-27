from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
    verbose_name = 'Sistema de Notificaciones'

    def ready(self):
        # 1. Registrar señales (post_migrate para autocarga de fechas comerciales)
        import apps.notifications.signals  # noqa

        # 2. Conectar despachador y receptores de señales transversales
        import apps.notifications.services.dispatcher  # noqa

        # 3. Arrancar el programador en segundo plano para verificación periódica sin interacción humana
        from apps.notifications.services.scheduler import start_scheduler
        start_scheduler()
