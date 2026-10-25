from rest_framework import permissions


class IsAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permiso que autoriza a usuarios con rol 'admin' o 'super_admin'.
    Ambos niveles tienen facultades completas para listar, crear, editar y eliminar
    productos, categorías, promociones y recursos del catálogo en la API.
    """
    message = "Se requieren credenciales de administrador (Admin o Super Admin) para realizar esta acción."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and (
                getattr(user, "role", None) in ["admin", "super_admin"]
                or user.is_staff
                or user.is_superuser
            )
        )


# Alias para mantener retrocompatibilidad con importaciones existentes
IsAdmin = IsAdminOrSuperAdmin


class IsSuperAdmin(permissions.BasePermission):
    """
    Permiso exclusivo para usuarios de nivel Super Admin.
    Requerido para operaciones de máxima seguridad o acceso al panel de Django.
    """
    message = "Esta acción requiere privilegios de Super Administrador."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and (
                getattr(user, "role", None) == "super_admin"
                or user.is_superuser
            )
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite lectura (GET, HEAD, OPTIONS) a cualquier usuario público o cliente,
    y restringe escritura (POST, PUT, PATCH, DELETE) a administradores (Admin y Super Admin).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and (
                getattr(user, "role", None) in ["admin", "super_admin"]
                or user.is_staff
                or user.is_superuser
            )
        )


class CanManageUsers(permissions.BasePermission):
    """
    Permiso granular para la gestión de usuarios:
    - Super Admin: Control total sobre Super Admins y Admins.
    - Admin: Puede listar, crear, editar y eliminar usuarios con rol 'admin'.
      No puede modificar, eliminar ni crear usuarios con rol 'super_admin'.
    """
    message = "No posee los permisos necesarios para gestionar este usuario."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and (
                getattr(user, "role", None) in ["admin", "super_admin"]
                or user.is_staff
                or user.is_superuser
            )
        )

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Super admin puede operar sobre cualquiera
        if getattr(user, "role", None) == "super_admin" or user.is_superuser:
            return True

        # Un admin regular no puede modificar ni borrar a un super admin
        if getattr(obj, "role", None) == "super_admin" or obj.is_superuser:
            return False

        return True


class CanUpdatePassword(permissions.BasePermission):
    """
    Permiso para actualización de contraseña:
    - El propio usuario puede cambiar su clave.
    - Un Super Admin puede cambiar la clave de cualquier usuario.
    - Un Admin regular puede cambiar la clave de otros usuarios con rol 'admin'.
    """
    message = "No tiene permisos para modificar la contraseña de este usuario."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_active)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user == obj:
            return True
        if getattr(user, "role", None) == "super_admin" or user.is_superuser:
            return True
        if getattr(user, "role", None) == "admin" and getattr(obj, "role", None) != "super_admin" and not obj.is_superuser:
            return True
        return False