from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.user.models import User
from apps.user.api.permisos import CanUpdatePassword
from apps.user.api.serializers import (
    LoginSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)


class LoginView(APIView):
    """
    Endpoint de autenticación JWT para Catálogo El Vecino.
    Permite iniciar sesión tanto a Super Admins como a Admins regulares.
    Devuelve los tokens de acceso y los datos de perfil con su rol respectivo.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        # Inyectar claims personalizados en el token JWT
        refresh["role"] = user.role
        refresh["name"] = user.full_name
        refresh["email"] = user.email
        refresh["username"] = user.username
        refresh["is_staff"] = user.is_staff
        refresh["is_superuser"] = user.is_superuser
        refresh["can_access_django_admin"] = user.can_access_django_admin()

        access_token = str(refresh.access_token)

        user_data = {
            "id": user.id,
            "username": user.username,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "role_display": user.get_role_display(),
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "can_access_django_admin": user.can_access_django_admin(),
        }

        return Response(
            {
                "success": True,
                "message": f"Bienvenido, {user.full_name}.",
                "token": access_token,
                "access": access_token,
                "refresh": str(refresh),
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    """
    Endpoint para obtener la información del usuario autenticado actualmente vía JWT.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Endpoint para cerrar sesión e invalidar el refresh token JWT en la lista negra.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh_token") or request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Se requiere el refresh_token para cerrar la sesión de forma segura."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"success": True, "message": "Sesión cerrada exitosamente."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": "Token inválido o ya expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ChangePasswordView(APIView):
    """
    Endpoint para cambiar la contraseña del usuario autenticado o de otro usuario si tiene permisos.
    """
    permission_classes = [permissions.IsAuthenticated, CanUpdatePassword]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        target_user = serializer.validated_data["target_user"]
        self.check_object_permissions(request, target_user)

        target_user.set_password(serializer.validated_data["new_password"])
        target_user.save(update_fields=["password"])

        return Response(
            {
                "success": True,
                "message": f"Contraseña actualizada exitosamente para el usuario {target_user.username}."
            },
            status=status.HTTP_200_OK,
        )
