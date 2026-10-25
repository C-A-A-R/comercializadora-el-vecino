import getpass
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Crear un Super Administrador interactivo con acceso a Django Admin (/admin/)."

    def handle(self, *args, **options):
        self.stdout.write("Creando Super Administrador (Super Admin). Responda los datos solicitados:")

        # username
        while True:
            username = input("Nombre de usuario: ").strip()
            if not username:
                self.stderr.write("El nombre de usuario no puede estar vacío.")
                continue
            if User.objects.filter(username=username).exists():
                self.stderr.write("Ya existe un usuario con ese nombre. Intente con otro.")
                continue
            break

        # email
        while True:
            correo = input("Correo electrónico: ").strip()
            if not correo:
                self.stderr.write("El correo electrónico es requerido.")
                continue
            if User.objects.filter(email=correo).exists():
                self.stderr.write("Ya existe un usuario con ese correo. Intente con otro.")
                continue
            break

        # password
        while True:
            password = getpass.getpass("Contraseña: ")
            password2 = getpass.getpass("Confirmar contraseña: ")
            if not password:
                self.stderr.write("La contraseña no puede estar vacía.")
                continue
            if password != password2:
                self.stderr.write("Las contraseñas no coinciden. Intente de nuevo.")
                continue
            break

        first_name = input("Nombres (opcional): ").strip()
        last_name = input("Apellidos (opcional): ").strip()
        phone = input("Teléfono (opcional): ").strip() or None

        # Crear superadmin
        user = User.objects.create_superuser(
            username=username,
            email=correo,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            is_active=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Super Administrador '{user.username}' creado con éxito.\n"
                f"- Rol: {user.get_role_display()}\n"
                f"- Acceso a Django Admin: SÍ (/admin/)"
            )
        )