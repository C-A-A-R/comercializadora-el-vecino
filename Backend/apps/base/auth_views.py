from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken


class LoginView(APIView):
    """
    Endpoint de autenticación JWT.
    Permite iniciar sesión con nombre de usuario o correo electrónico registrado en Django.
    Asigna automáticamente el rol 'admin' a usuarios staff o superusuarios.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        identifier = (data.get('username') or data.get('email') or data.get('identifier') or '').strip()
        password = data.get('password')

        if not identifier or not password:
            return Response(
                {'message': 'Debe proporcionar usuario/correo y contraseña.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Búsqueda por username o correo (insensible a mayúsculas/minúsculas)
        user = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()

        if user is None or not user.check_password(password):
            return Response(
                {'message': 'Credenciales inválidas. Verifique el usuario y la contraseña.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'message': 'Esta cuenta de usuario se encuentra inactiva.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generar tokens JWT SimpleJWT
        refresh = RefreshToken.for_user(user)
        role = 'admin' if (user.is_staff or user.is_superuser) else 'cliente'
        name = user.get_full_name() or user.username

        # Claims personalizados en el token
        refresh['role'] = role
        refresh['name'] = name
        refresh['email'] = user.email
        refresh['is_staff'] = user.is_staff
        refresh['is_superuser'] = user.is_superuser

        access_token = str(refresh.access_token)

        user_data = {
            'id': user.id,
            'username': user.username,
            'name': name,
            'email': user.email,
            'role': role,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        }

        return Response({
            'success': True,
            'token': access_token,
            'access': access_token,
            'refresh': str(refresh),
            'user': user_data,
            'message': 'Autenticación exitosa.'
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """
    Endpoint para obtener la información del usuario autenticado actualmente vía JWT.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = 'admin' if (user.is_staff or user.is_superuser) else 'cliente'
        return Response({
            'id': user.id,
            'username': user.username,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'role': role,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
