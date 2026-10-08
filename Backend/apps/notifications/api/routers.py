from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.notifications.api.api import (
    SpecialCommercialDateViewSet,
    CommercialEventAlertViewSet,
    NotificationStreamView
)

router = DefaultRouter()
router.register(r'dates', SpecialCommercialDateViewSet, basename='commercial-dates')
router.register(r'alerts', CommercialEventAlertViewSet, basename='notification-alerts')

urlpatterns = [
    # Endpoint de transmisión en vivo (Server-Sent Events)
    path('stream/', NotificationStreamView.as_view(), name='notification-stream'),
]

urlpatterns += router.urls
