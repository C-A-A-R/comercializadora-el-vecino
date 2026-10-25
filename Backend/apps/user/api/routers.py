from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path

from apps.user.api.api import UserViewSet
from apps.user.api.authentication_api_view import (
    LoginView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView,
)
from apps.user.report.views import UsuariosReportView

# Router CRUD para usuarios
user_router = DefaultRouter()
user_router.register(r"", UserViewSet, basename="users")

# Endpoints de autenticación JWT
auth_urlpatterns = [
    path("login/", LoginView.as_view(), name="user-login"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    path("me/", CurrentUserView.as_view(), name="user-me"),
    path("refresh/", TokenRefreshView.as_view(), name="user-token-refresh"),
    path("password/change/", ChangePasswordView.as_view(), name="user-change-password"),
]

# Endpoints de reportes
report_urlpatterns = [
    path("reports/<str:report_type>/", UsuariosReportView.as_view(), name="users-report"),
    path("reportes/<str:report_type>/", UsuariosReportView.as_view(), name="usuarios-reporte"),
]

urlpatterns = auth_urlpatterns + report_urlpatterns + user_router.urls
