from django.contrib import admin
from apps.notifications.models import SpecialCommercialDate, CommercialEventAlert
from apps.notifications.services.dispatcher import notify_event


@admin.register(SpecialCommercialDate)
class SpecialCommercialDateAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'month',
        'day',
        'days_in_advance',
        'is_active',
        'last_notified_year',
        'created_at',
    )
    list_filter = ('month', 'is_active', 'is_deleted')
    search_fields = ('name', 'description', 'suggested_strategy', 'slug')
    readonly_fields = ('created_at', 'updated_at', 'deleted_at', 'last_notified_year')
    fieldsets = (
        ('Información de la Temporada', {
            'fields': ('name', 'slug', 'description', 'suggested_strategy')
        }),
        ('Programación Anual Recurrente', {
            'fields': ('month', 'day', 'days_in_advance', 'is_active', 'last_notified_year')
        }),
        ('Auditoría', {
            'fields': ('is_deleted', 'created_at', 'updated_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )
    actions = ['test_alert_action', 'activate_action', 'deactivate_action']

    @admin.action(description="🧪 Disparar alerta de prueba (Telegram + Web)")
    def test_alert_action(self, request, queryset):
        for season in queryset:
            notify_event(
                event_type='commercial_season',
                title=f"[Admin Test] Recordatorio: {season.name}",
                message=f"Alerta de prueba manual emitida desde el panel de administración para {season.name}.",
                commercial_date=season,
                channels=['telegram', 'web']
            )
        self.message_user(request, f"Alertas de prueba disparadas para {queryset.count()} temporada(s).")

    @admin.action(description="Activar temporadas seleccionadas")
    def activate_action(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} temporadas fueron activadas.")

    @admin.action(description="Desactivar temporadas seleccionadas")
    def deactivate_action(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} temporadas fueron desactivadas.")


@admin.register(CommercialEventAlert)
class CommercialEventAlertAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'event_type',
        'commercial_date',
        'is_read',
        'telegram_sent',
        'created_at',
    )
    list_filter = ('is_read', 'event_type', 'telegram_sent', 'created_at')
    search_fields = ('title', 'message')
    readonly_fields = ('created_at', 'updated_at', 'deleted_at', 'read_at', 'telegram_sent', 'telegram_error')
    actions = ['mark_as_read_action']

    @admin.action(description="Marcar como leídas")
    def mark_as_read_action(self, request, queryset):
        updated = queryset.filter(is_read=False).update(is_read=True)
        self.message_user(request, f"{updated} alertas marcadas como leídas.")
