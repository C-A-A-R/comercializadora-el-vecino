from django.test import TestCase
from django.contrib.auth import get_user_model, authenticate
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserRoleAndAccessTests(TestCase):
    """
    Pruebas integrales para verificar el comportamiento de los dos niveles de usuario:
    1. Super Admin: capaz de ingresar al admin de Django (is_staff=True, is_superuser=True).
    2. Admin: usuario administrador de catálogo capaz de crear, listar, editar y eliminar,
       pero con acceso denegado al admin de Django (is_staff=False, is_superuser=False).
    """

    def setUp(self):
        self.client = APIClient()

        # 1. Super Admin
        self.super_admin = User.objects.create_superuser(
            username="superadmin_test",
            email="superadmin@elvecino.com",
            password="SuperPassword123!",
            first_name="Carlos",
            last_name="Super",
        )

        # 2. Admin regular (administrador de catálogo)
        self.regular_admin = User.objects.create_user(
            username="admin_test",
            email="admin@elvecino.com",
            password="AdminPassword123!",
            role=User.Roles.ADMIN,
            first_name="Ana",
            last_name="Admin",
        )

    def test_super_admin_attributes_and_django_admin_access(self):
        """Verifica que el Super Admin tiene is_staff=True, is_superuser=True y acceso a Django Admin."""
        self.assertEqual(self.super_admin.role, User.Roles.SUPER_ADMIN)
        self.assertTrue(self.super_admin.is_staff)
        self.assertTrue(self.super_admin.is_superuser)
        self.assertTrue(self.super_admin.is_active)
        self.assertTrue(self.super_admin.can_access_django_admin())
        self.assertTrue(self.super_admin.is_super_admin)
        self.assertTrue(self.super_admin.is_admin)

    def test_regular_admin_attributes_and_django_admin_restriction(self):
        """
        Verifica que el Admin regular tiene is_staff=False, is_superuser=False
        y tiene ESTRÍCTAMENTE denegado el acceso al admin de Django.
        """
        self.assertEqual(self.regular_admin.role, User.Roles.ADMIN)
        self.assertFalse(self.regular_admin.is_staff)
        self.assertFalse(self.regular_admin.is_superuser)
        self.assertTrue(self.regular_admin.is_active)
        self.assertFalse(self.regular_admin.can_access_django_admin())
        self.assertFalse(self.regular_admin.is_super_admin)
        self.assertTrue(self.regular_admin.is_admin)

    def test_role_enforcement_on_save(self):
        """Verifica que el método save() asegura la consistencia de los dos roles."""
        user = User(
            username="manipulated_user",
            email="manipulated@elvecino.com",
            role=User.Roles.ADMIN,
            is_staff=True,  # Intento de otorgar staff a un admin
        )
        user.save()
        # Al tener role=ADMIN, se asegura que no tenga staff ni superuser
        self.assertEqual(user.role, User.Roles.ADMIN)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        # Si se cambia explícitamente a SUPER_ADMIN
        user.role = User.Roles.SUPER_ADMIN
        user.save()
        self.assertEqual(user.role, User.Roles.SUPER_ADMIN)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_authenticate_both_roles(self):
        """Verifica que ambos niveles pueden autenticarse con sus credenciales."""
        auth_super = authenticate(username="superadmin_test", password="SuperPassword123!")
        self.assertIsNotNone(auth_super)
        self.assertEqual(auth_super.role, User.Roles.SUPER_ADMIN)

        auth_admin = authenticate(username="admin_test", password="AdminPassword123!")
        self.assertIsNotNone(auth_admin)
        self.assertEqual(auth_admin.role, User.Roles.ADMIN)

    def test_jwt_login_endpoint(self):
        """Verifica el login mediante JWT devolviendo claims y datos para ambos roles."""
        # 1. Login Super Admin
        resp_super = self.client.post(
            "/api/auth/login/",
            {"identifier": "superadmin_test", "password": "SuperPassword123!"},
            format="json"
        )
        self.assertEqual(resp_super.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_super.data["user"]["role"], User.Roles.SUPER_ADMIN)
        self.assertTrue(resp_super.data["user"]["can_access_django_admin"])

        # 2. Login Admin regular
        resp_admin = self.client.post(
            "/api/auth/login/",
            {"identifier": "admin@elvecino.com", "password": "AdminPassword123!"},
            format="json"
        )
        self.assertEqual(resp_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_admin.data["user"]["role"], User.Roles.ADMIN)
        self.assertFalse(resp_admin.data["user"]["can_access_django_admin"])

    def test_admin_cannot_access_django_admin_login(self):
        """Verifica que el usuario admin no puede iniciar sesión en /admin/."""
        # Cliente de sesión de Django
        login_success = self.client.login(username="admin_test", password="AdminPassword123!")
        # authenticate() funciona, pero el acceso a /admin/ debe redirigir o denegar
        response = self.client.get("/admin/")
        # Al no tener is_staff, Django admin redirige al login con parámetro ?next=/admin/
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)

    def test_super_admin_can_access_django_admin(self):
        """Verifica que el Super Admin sí puede acceder a /admin/."""
        self.client.login(username="superadmin_test", password="SuperPassword123!")
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_soft_delete(self):
        """Verifica el borrado lógico del modelo User."""
        self.regular_admin.delete()
        self.assertTrue(self.regular_admin.is_deleted)
        self.assertFalse(self.regular_admin.is_active)
        self.assertIsNotNone(self.regular_admin.deleted_at)

        # No debe aparecer en el queryset por defecto
        self.assertFalse(User.objects.filter(username="admin_test").exists())
        # Sí debe existir en all_objects o with_deleted()
        self.assertTrue(User.objects.with_deleted().filter(username="admin_test").exists())
