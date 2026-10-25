from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin, UserManager
from django.utils import timezone

from apps.base.models import BaseModel, SoftDeleteQuerySet


class UserQuerySet(SoftDeleteQuerySet):
    """QuerySet para User con soporte de borrado lógico y filtros de rol."""

    def superadmins(self):
        return self.filter(role=User.Roles.SUPER_ADMIN)

    def admins(self):
        return self.filter(role=User.Roles.ADMIN)


class CustomUserManager(UserManager):
    """
    Manager personalizado para el modelo User.
    Gestiona dos niveles de usuarios para Catálogo El Vecino:
    - Super Admin: acceso a Django Admin (is_staff=True, is_superuser=True)
    - Admin: administrador del catálogo (is_staff=False, is_superuser=False)
    """

    def get_queryset(self):
        return UserQuerySet(self.model, using=self._db).filter(is_deleted=False)

    def with_deleted(self):
        return UserQuerySet(self.model, using=self._db)

    def create_user(self, username, email=None, password=None, role=None, **extra_fields):
        extra_fields.setdefault('is_active', True)

        # Determinar rol y permisos de acceso al admin de Django
        if role == User.Roles.SUPER_ADMIN or extra_fields.get('is_superuser') or extra_fields.get('is_staff'):
            role = User.Roles.SUPER_ADMIN
            extra_fields['is_staff'] = True
            extra_fields['is_superuser'] = True
        else:
            role = User.Roles.ADMIN
            extra_fields['is_staff'] = False
            extra_fields['is_superuser'] = False

        if email:
            email = self.normalize_email(email)

        user = self.model(username=username, email=email, role=role, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(
            username=username,
            email=email,
            password=password,
            role=User.Roles.SUPER_ADMIN,
            **extra_fields
        )


class User(AbstractUser, PermissionsMixin, BaseModel):
    """
    Modelo de Usuario personalizado adaptado a Catálogo El Vecino.
    Gestiona únicamente dos niveles de usuarios:
    1. super_admin: Capaz de ingresar al admin de Django (/admin/) y con privilegios totales.
    2. admin: Administrador del catálogo (crear, listar, editar y eliminar productos/categorías/promociones),
       sin acceso al panel de administración de Django.
    """

    class Roles(models.TextChoices):
        SUPER_ADMIN = 'super_admin', 'Super Administrador'
        ADMIN = 'admin', 'Administrador'

    username = models.CharField(
        'Nombre de usuario',
        max_length=150,
        unique=True,
        help_text='150 caracteres o menos. Letras, dígitos y @/./+/-/_'
    )
    email = models.EmailField(
        'Correo electrónico',
        unique=True,
        help_text='Correo electrónico único del usuario'
    )
    first_name = models.CharField('Nombres', max_length=150, blank=True)
    last_name = models.CharField('Apellidos', max_length=150, blank=True)
    phone = models.CharField('Teléfono', max_length=20, blank=True, null=True, help_text='Número de contacto telefónico')

    role = models.CharField(
        'Rol de usuario',
        max_length=20,
        choices=Roles.choices,
        default=Roles.ADMIN,
        help_text='Nivel de privilegios: Super Administrador (acceso a Django Admin) o Administrador'
    )

    is_staff = models.BooleanField(
        'Es personal (Staff)',
        default=False,
        help_text='Indica si el usuario puede acceder al sitio de administración de Django'
    )
    is_superuser = models.BooleanField(
        'Es superusuario',
        default=False,
        help_text='Indica si el usuario tiene todos los permisos en Django'
    )
    is_active = models.BooleanField(
        'Está activo',
        default=True,
        help_text='Indica si la cuenta se encuentra habilitada'
    )

    objects = CustomUserManager()
    all_objects = models.Manager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_super_admin(self):
        """Retorna True si el usuario es Super Admin."""
        return self.role == self.Roles.SUPER_ADMIN or self.is_superuser

    @property
    def is_admin(self):
        """Retorna True si el usuario tiene rol Admin o Super Admin."""
        return self.role in [self.Roles.ADMIN, self.Roles.SUPER_ADMIN] or self.is_staff or self.is_superuser

    @property
    def full_name(self):
        """Retorna el nombre completo o username."""
        full = f"{self.first_name} {self.last_name}".strip()
        return full if full else self.username

    def can_access_django_admin(self):
        """Indica explícitamente si este usuario puede acceder a Django Admin (/admin/)."""
        return bool(self.is_active and (self.is_staff or self.is_superuser or self.role == self.Roles.SUPER_ADMIN))

    def save(self, *args, **kwargs):
        """
        Sincroniza y asegura estrictamente la regla de los dos niveles de usuario:
        - super_admin: is_staff=True, is_superuser=True (acceso al admin de Django)
        - admin: is_staff=False, is_superuser=False (sin acceso al admin de Django)
        """
        if self.role == self.Roles.ADMIN:
            self.is_staff = False
            self.is_superuser = False
        elif self.role == self.Roles.SUPER_ADMIN or self.is_superuser or self.is_staff:
            self.role = self.Roles.SUPER_ADMIN
            self.is_staff = True
            self.is_superuser = True

        if self.email:
            self.email = self.email.strip().lower()
        if self.username:
            self.username = self.username.strip()

        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        """Borrado lógico."""
        self.is_active = False
        self.is_deleted = True
        self.deleted_at = timezone.now().date()
        super().delete(using=using, keep_parents=keep_parents)
