from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.user.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializador de lectura completo para el modelo User."""

    full_name = serializers.CharField(read_only=True)
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    can_access_django_admin = serializers.BooleanField(source="can_access_django_admin", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "role_display",
            "is_staff",
            "is_superuser",
            "is_active",
            "can_access_django_admin",
            "date_joined",
            "last_login",
            "is_deleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "is_deleted",
            "created_at",
            "updated_at",
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializador para creación de usuarios (Super Admin o Admin)."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        help_text="Contraseña segura para el usuario"
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=False,
        style={"input_type": "password"},
        help_text="Confirmación de la contraseña"
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
        ]

    def validate_role(self, value):
        """Valida que solo un super_admin pueda crear otro super_admin."""
        request = self.context.get("request")
        if value == User.Roles.SUPER_ADMIN:
            if not request or not request.user.is_authenticated or not (
                request.user.role == User.Roles.SUPER_ADMIN or request.user.is_superuser
            ):
                raise serializers.ValidationError(
                    "Solo un Super Administrador puede crear usuarios con rol Super Admin."
                )
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        confirm = attrs.get("confirm_password")
        if confirm and password != confirm:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})

        # Validar robustez de contraseña mediante validadores de Django
        if password:
            validate_password(password)

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password")
        role = validated_data.get("role", User.Roles.ADMIN)

        user = User.objects.create_user(
            password=password,
            role=role,
            **validated_data
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializador para edición de datos de usuario (sin modificar contraseña)."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
        ]

    def validate_role(self, value):
        """Evita que un admin regular eleve a super_admin o cambie el rol de un super_admin."""
        request = self.context.get("request")
        current_role = getattr(self.instance, "role", None)

        is_super = bool(
            request
            and request.user.is_authenticated
            and (request.user.role == User.Roles.SUPER_ADMIN or request.user.is_superuser)
        )

        if value == User.Roles.SUPER_ADMIN and not is_super:
            raise serializers.ValidationError(
                "Solo un Super Administrador puede asignar el rol de Super Admin."
            )

        if current_role == User.Roles.SUPER_ADMIN and value != User.Roles.SUPER_ADMIN and not is_super:
            raise serializers.ValidationError(
                "Solo un Super Administrador puede modificar los privilegios de un Super Admin."
            )

        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializador para cambio o reseteo de contraseña."""

    user_id = serializers.IntegerField(required=False, help_text="ID del usuario a modificar (opcional)")
    old_password = serializers.CharField(
        required=False,
        write_only=True,
        style={"input_type": "password"},
        help_text="Contraseña actual del usuario"
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
        help_text="Nueva contraseña"
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
        help_text="Confirmación de la nueva contraseña"
    )

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user if request else None

        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")
        old_password = attrs.get("old_password")

        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Las nuevas contraseñas no coinciden."})

        validate_password(new_password)

        target_user = user
        user_id = attrs.get("user_id")
        if user_id and user:
            # Si se especificó otro usuario
            if user_id != user.id:
                try:
                    target_user = User.objects.get(id=user_id, is_deleted=False)
                except User.DoesNotExist:
                    raise serializers.ValidationError({"user_id": "Usuario no encontrado."})

        # Si el usuario cambia su propia clave, debe ingresar la anterior (salvo que sea super_admin)
        if target_user == user and not (user.role == User.Roles.SUPER_ADMIN or user.is_superuser):
            if not old_password:
                raise serializers.ValidationError({"old_password": "Debe ingresar su contraseña actual."})
            if not user.check_password(old_password):
                raise serializers.ValidationError({"old_password": "La contraseña actual es incorrecta."})

        attrs["target_user"] = target_user
        return attrs


class LoginSerializer(serializers.Serializer):
    """Serializador para el inicio de sesión y autenticación JWT."""

    username = serializers.CharField(required=False)
    identifier = serializers.CharField(required=False)
    email = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        ident = (
            attrs.get("username")
            or attrs.get("identifier")
            or attrs.get("email")
            or ""
        ).strip()
        password = attrs.get("password")

        if not ident or not password:
            raise serializers.ValidationError("Debe ingresar usuario o correo y contraseña.")

        # Buscar usuario insensible a mayúsculas
        from django.db.models import Q
        user = User.objects.filter(
            Q(username__iexact=ident) | Q(email__iexact=ident),
            is_deleted=False
        ).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError("Credenciales inválidas. Verifique sus datos.")

        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta de usuario se encuentra desactivada.")

        attrs["user"] = user
        return attrs
