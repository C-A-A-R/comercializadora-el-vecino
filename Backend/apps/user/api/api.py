from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.base.api import BaseViewSet
from apps.user.models import User
from apps.user.api.permisos import CanManageUsers, CanUpdatePassword
from apps.user.api.serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)


class UserViewSet(BaseViewSet):
    """
    ViewSet para la gestión administrativa de usuarios en Catálogo El Vecino.
    Gestiona los dos niveles de acceso:
    - Super Admin: Acceso al admin de Django y control global.
    - Admin: Gestión del catálogo web (productos, promociones, etc.), sin acceso a Django admin.
    """

    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserSerializer
    permission_classes = [CanManageUsers]
    ordering = ["-created_at"]
    search_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
        "phone",
    ]
    ordering_fields = [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
        "date_joined",
        "created_at",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        qs = User.objects.filter(is_deleted=False)

        # Filtro opcional por rol ('super_admin' o 'admin')
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role.strip())

        # Filtro opcional por estado activo
        is_active = self.request.query_params.get("is_active") or self.request.query_params.get("status")
        if is_active is not None and is_active != "":
            active_bool = is_active.lower() in ["1", "true", "si", "yes", "active"]
            qs = qs.filter(is_active=active_bool)

        return qs

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """Retorna el perfil del usuario autenticado actualmente."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="change-password", permission_classes=[CanUpdatePassword])
    def change_password(self, request, pk=None):
        """Actualiza la contraseña del usuario especificado."""
        user = self.get_object()

        data = request.data.copy()
        data["user_id"] = user.id

        serializer = ChangePasswordSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response(
            {
                "success": True,
                "message": f"Contraseña actualizada exitosamente para el usuario {user.username}."
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        """Activa o desactiva la cuenta de un usuario."""
        user = self.get_object()

        if user == request.user:
            return Response(
                {"error": "No puede desactivar su propia cuenta de usuario."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        state_str = "activado" if user.is_active else "desactivado"
        return Response(
            {
                "success": True,
                "message": f"Usuario {user.username} {state_str} exitosamente.",
                "is_active": user.is_active,
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        """Borrado lógico protegido contra auto-eliminación."""
        instance = self.get_object()

        if instance == request.user:
            return Response(
                {"error": "No puede eliminar su propia cuenta de usuario."},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.delete()
        return Response(
            {"success": True, "message": f"Usuario {instance.username} eliminado correctamente."},
            status=status.HTTP_200_OK
        )
