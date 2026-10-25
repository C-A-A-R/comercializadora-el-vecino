from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Crea usuarios iniciales de prueba para ambos niveles (Super Admin y Admin)."

    def handle(self, *args, **options):
        self.stdout.write("Inicializando usuarios de prueba para Catálogo El Vecino...")

        # 1. Super Admin
        super_user, created_super = User.objects.get_or_create(
            username="superadmin",
            defaults={
                "email": "superadmin@catalogoelvecino.com",
                "first_name": "Super",
                "last_name": "Administrador",
                "phone": "+57 300 000 0001",
                "role": User.Roles.SUPER_ADMIN,
                "is_active": True,
            }
        )
        super_user.role = User.Roles.SUPER_ADMIN
        super_user.set_password("admin1234")
        super_user.save()

        # 2. Admin (Administrador de Catálogo sin acceso a Django Admin)
        admin_user, created_admin = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@catalogoelvecino.com",
                "first_name": "Admin",
                "last_name": "Catálogo",
                "phone": "+57 300 000 0002",
                "role": User.Roles.ADMIN,
                "is_active": True,
            }
        )
        admin_user.role = User.Roles.ADMIN
        admin_user.set_password("admin1234")
        admin_user.save()

        self.stdout.write(self.style.SUCCESS("\n¡Usuarios listos para usar!"))
        self.stdout.write(
            f"1. Super Administrador (Acceso al admin de Django: SÍ):\n"
            f"   - Usuario: superadmin\n"
            f"   - Contraseña: admin1234\n"
            f"   - Rol: {super_user.get_role_display()} ({super_user.role})\n"
            f"   - URL Django Admin: http://127.0.0.1:8000/admin/\n\n"
            f"2. Administrador de Catálogo (Acceso al admin de Django: NO):\n"
            f"   - Usuario: admin\n"
            f"   - Contraseña: admin1234\n"
            f"   - Rol: {admin_user.get_role_display()} ({admin_user.role})\n"
            f"   - Panel Frontend: http://127.0.0.1:5500/Frontend/admin/\n"
        )
