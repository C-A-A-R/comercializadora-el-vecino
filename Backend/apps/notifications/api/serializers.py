from rest_framework import serializers
from apps.notifications.models import SpecialCommercialDate, CommercialEventAlert


class SpecialCommercialDateSerializer(serializers.ModelSerializer):
    """
    Serializer para consulta y personalización de temporadas comerciales especiales.
    """
    next_occurrence = serializers.SerializerMethodField(read_only=True)
    days_until = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SpecialCommercialDate
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'month',
            'day',
            'days_in_advance',
            'is_active',
            'last_notified_year',
            'suggested_strategy',
            'next_occurrence',
            'days_until',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'last_notified_year',
            'next_occurrence',
            'days_until',
            'created_at',
            'updated_at',
        ]

    def get_next_occurrence(self, obj) -> str:
        return obj.get_next_occurrence().isoformat()

    def get_days_until(self, obj) -> int:
        return obj.days_until()

    def validate(self, attrs):
        month = attrs.get('month', getattr(self.instance, 'month', None))
        day = attrs.get('day', getattr(self.instance, 'day', None))

        if month and day:
            max_days = {
                1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
                7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
            }
            limit = max_days.get(month, 31)
            if day > limit:
                raise serializers.ValidationError({
                    'day': f'El mes {month} no puede tener más de {limit} días.'
                })
        return attrs


class CommercialEventAlertSerializer(serializers.ModelSerializer):
    """
    Serializer para el historial de alertas emitidas y el panel web de notificaciones.
    """
    season_name = serializers.CharField(source='commercial_date.name', read_only=True)

    class Meta:
        model = CommercialEventAlert
        fields = [
            'id',
            'event_type',
            'commercial_date',
            'season_name',
            'title',
            'message',
            'event_year',
            'days_until_event',
            'telegram_sent',
            'telegram_error',
            'is_read',
            'read_at',
            'metadata',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'telegram_sent',
            'telegram_error',
            'created_at',
            'updated_at',
        ]
