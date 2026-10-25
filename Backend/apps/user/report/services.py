from django.db.models import Q
from apps.base.reportes.services.services import BaseReportService
from apps.user.models import User


class UsuariosReportService(BaseReportService):
    """
    Servicio de generación de reportes para el módulo de usuarios de Catálogo El Vecino.
    Reporta sobre los dos niveles de usuario: Super Admin y Admin.
    """

    @staticmethod
    def _get_qs():
        return User.objects.filter(is_deleted=False)

    @classmethod
    def usuarios(cls, filters):
        """Reporte general de usuarios registrados (Super Admin y Admin)."""
        qs = cls._get_qs()

        # Filtros opcionales
        is_active = filters.get("activo") or filters.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active in ("true", "True", "1"))

        role = filters.get("rol") or filters.get("role")
        if role:
            qs = qs.filter(role=role.strip())

        columns = [
            "Usuario",
            "Nombre completo",
            "Correo",
            "Teléfono",
            "Nivel de Acceso",
            "Acceso a Django Admin",
            "Estado",
            "Último acceso",
            "Fecha de registro",
        ]

        rows = [
            [
                u.username,
                u.full_name or "—",
                u.email or "—",
                u.phone or "—",
                u.get_role_display(),
                "Sí (Permitido)" if u.can_access_django_admin() else "No (Bloqueado)",
                "Activo" if u.is_active else "Inactivo",
                u.last_login.strftime("%d/%m/%Y %H:%M") if u.last_login else "Nunca",
                u.created_at.strftime("%d/%m/%Y") if u.created_at else "—",
            ]
            for u in qs
        ]

        return cls.build_response(
            filename="reporte_usuarios_sistema",
            columns=columns,
            rows=rows,
        )

    @classmethod
    def administradores(cls, filters):
        """Reporte específico de administradores del catálogo."""
        qs = cls._get_qs().filter(role=User.Roles.ADMIN)

        columns = [
            "Usuario",
            "Nombre completo",
            "Correo",
            "Teléfono",
            "Nivel de Acceso",
            "Acceso a Django Admin",
            "Estado",
            "Último acceso",
            "Fecha de registro",
        ]

        rows = [
            [
                u.username,
                u.full_name or "—",
                u.email or "—",
                u.phone or "—",
                u.get_role_display(),
                "No (Bloqueado)",
                "Activo" if u.is_active else "Inactivo",
                u.last_login.strftime("%d/%m/%Y %H:%M") if u.last_login else "Nunca",
                u.created_at.strftime("%d/%m/%Y") if u.created_at else "—",
            ]
            for u in qs
        ]

        return cls.build_response(
            filename="reporte_administradores_catalogo",
            columns=columns,
            rows=rows,
        )

    @classmethod
    def usuario_detalle(cls, filters):
        """Reporte detallado de un usuario en formato cabecera."""
        pk = filters.get("id") or filters.get("pk")
        if not pk:
            raise ValueError("El ID del usuario es requerido.")

        u = cls._get_qs().get(pk=pk)

        header_table = [
            ("Usuario", u.username),
            ("Nombre completo", u.full_name or "—"),
            ("Correo", u.email or "—"),
            ("Teléfono", u.phone or "—"),
            ("Nivel de acceso", u.get_role_display()),
            ("Acceso a Django Admin", "Sí (Permitido)" if u.can_access_django_admin() else "No (Bloqueado)"),
            ("Estado de la cuenta", "Activo" if u.is_active else "Inactivo"),
            ("Último acceso", u.last_login.strftime("%d/%m/%Y %H:%M") if u.last_login else "Nunca"),
            ("Fecha de registro", u.created_at.strftime("%d/%m/%Y") if u.created_at else "—"),
        ]

        return {
            "filename": f"detalle_usuario_{u.username}",
            "header_table": header_table,
        }
