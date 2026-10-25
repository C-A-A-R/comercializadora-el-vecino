from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from apps.user.models import User
from apps.base.admin import BaseAdmin


class UserCreationForm(forms.ModelForm):
    """Formulario de creación de usuarios en el admin de Django."""

    password = forms.CharField(label="Contraseña", widget=forms.PasswordInput, required=True)
    password_confirm = forms.CharField(label="Confirmar contraseña", widget=forms.PasswordInput, required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
        )

    def clean_password_confirm(self):
        p1 = self.cleaned_data.get("password")
        p2 = self.cleaned_data.get("password_confirm")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Las contraseñas no coinciden.")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get("password")
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """Formulario de edición de usuarios en el admin; muestra contraseña con hash solo lectura."""

    password = ReadOnlyPasswordHashField(
        label="Contraseña",
        help_text="Las contraseñas están cifradas. Para modificarla use la acción de cambio de contraseña."
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
            "password",
        )

    def clean_password(self):
        return self.initial.get("password")


@admin.register(User)
class UserAdmin(BaseAdmin, DjangoUserAdmin):
    """
    Administración de usuarios en Django Admin.
    Solo accesible para usuarios Super Admin (is_staff=True, is_superuser=True).
    Permite gestionar tanto a Super Admins como a Admins regulares del catálogo.
    """
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = [
        "id",
        "username",
        "email",
        "full_name",
        "phone",
        "role",
        "is_staff",
        "is_superuser",
        "is_active",
        "created_at",
    ]

    list_filter = [
        "role",
        "is_active",
        "is_staff",
        "is_superuser",
        "is_deleted",
        "created_at",
    ]

    search_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
        "phone",
    ]

    readonly_fields = [
        "is_staff",
        "is_superuser",
        "last_login",
        "date_joined",
        "created_at",
        "updated_at",
    ]

    fieldsets = (
        ("Credenciales de Acceso", {"fields": ("username", "email", "password")}),
        (
            "Datos Personales",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone",
                )
            },
        ),
        (
            "Nivel de Usuario y Permisos",
            {
                "description": "Super Admin tiene acceso al Django Admin (/admin/). Admin solo gestiona el catálogo desde la plataforma web.",
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                )
            },
        ),
        ("Fechas Importantes", {"fields": ("last_login", "date_joined", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "phone",
                    "role",
                    "password",
                    "password_confirm",
                    "is_active",
                ),
            },
        ),
    )

    ordering = ["-created_at"]
