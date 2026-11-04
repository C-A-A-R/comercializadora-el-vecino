from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.user.api.permisos import IsAdmin
from apps.user.api.serializers import UserSerializer, UserCreateSerializer
from apps.user.models import User
from apps.base.api import BaseViewSet


class UserViewSet(BaseViewSet):
    """
    ViewSet para el modelo User y gestión de clientes.
    Acceso restringido a administradores y superusuarios.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    ordering = ['-date_joined', '-id']
    search_fields = [
        'username',
        'email',
        'first_name',
        'first_last_name',
        'second_name',
        'second_last_name',
        'document_type',
        'identity_document',
        'phone',
    ]
    ordering_fields = [
        'username',
        'email',
        'date_joined',
        'created_at',
        'id',
        'first_name',
        'first_last_name',
    ]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        # Base: usuarios no eliminados
        queryset = User.objects.filter(is_deleted=False)

        # Filtro de Rol / Staff
        role = self.request.query_params.get("role") or self.request.query_params.get("tipo")
        if role in ["client", "cliente"]:
            queryset = queryset.filter(is_staff=False, is_superuser=False)
        else:
            is_staff = self.request.query_params.get("is_staff")
            if is_staff is not None:
                is_staff_normalized = is_staff.lower() in ["1", "true", "si", "yes"]
                queryset = queryset.filter(is_staff=is_staff_normalized)

        # Filtro de Estado (is_active / status)
        status_param = self.request.query_params.get("status") or self.request.query_params.get("is_active") or self.request.query_params.get("estado")
        if status_param and status_param.lower() not in ["all", "todos", ""]:
            is_active_normalized = status_param.lower() in ["1", "true", "si", "yes", "active", "activo"]
            queryset = queryset.filter(is_active=is_active_normalized)

        # Filtro de registro formal
        is_registered = self.request.query_params.get("is_registered") or self.request.query_params.get("esta_registrado")
        if is_registered is not None:
            is_registered_normalized = is_registered.lower() in ["1", "true", "si", "yes"]
            queryset = queryset.filter(is_registered=is_registered_normalized)

        # Filtro por Rango / Período de Fecha de Registro
        period = self.request.query_params.get("period") or self.request.query_params.get("periodo") or self.request.query_params.get("fecha_registro")
        now = timezone.now()
        if period:
            p = period.lower().strip()
            if p in ["today", "hoy"]:
                queryset = queryset.filter(date_joined__date=now.date())
            elif p in ["this_week", "semana", "esta_semana"]:
                start_week = now - timedelta(days=7)
                queryset = queryset.filter(date_joined__gte=start_week)
            elif p in ["this_month", "mes", "este_mes"]:
                queryset = queryset.filter(date_joined__year=now.year, date_joined__month=now.month)
            elif p in ["this_year", "ano", "año", "este_ano", "este_año"]:
                queryset = queryset.filter(date_joined__year=now.year)

        date_from = self.request.query_params.get("date_from") or self.request.query_params.get("fecha_desde")
        if date_from:
            queryset = queryset.filter(date_joined__date__gte=date_from)

        date_to = self.request.query_params.get("date_to") or self.request.query_params.get("fecha_hasta")
        if date_to:
            queryset = queryset.filter(date_joined__date__lte=date_to)

        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.is_deleted = True
        instance.deleted_at = timezone.now().date()
        instance.save(update_fields=["is_active", "is_deleted", "deleted_at"])

    @action(detail=False, methods=['get'], url_path='metrics')
    def metrics(self, request):
        """
        Retorna las métricas consolidadas requeridas para las tarjetas KPI de Clientes.
        """
        now = timezone.now()
        start_of_current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Mes anterior para cálculo comparativo
        if start_of_current_month.month == 1:
            start_of_last_month = start_of_current_month.replace(year=start_of_current_month.year - 1, month=12)
        else:
            start_of_last_month = start_of_current_month.replace(month=start_of_current_month.month - 1)

        # Base de clientes (excluye administradores y superusuarios)
        clients_qs = User.objects.filter(
            is_deleted=False, 
            is_staff=False, 
            is_superuser=False
        )
        total_clients = clients_qs.count()

        # Clientes nuevos este mes
        new_clients_this_month = clients_qs.filter(date_joined__gte=start_of_current_month).count()
        new_clients_last_month = clients_qs.filter(
            date_joined__gte=start_of_last_month,
            date_joined__lt=start_of_current_month
        ).count()

        # Porcentaje de crecimiento vs mes anterior
        if new_clients_last_month > 0:
            growth = ((new_clients_this_month - new_clients_last_month) / new_clients_last_month) * 100
            growth_str = f"{'+' if growth >= 0 else ''}{growth:.1f}% vs mes anterior"
        else:
            growth_str = f"+{new_clients_this_month} este mes" if new_clients_this_month > 0 else "0% vs mes anterior"

        data = {
            "total_clients": total_clients,
            "new_clients_this_month": new_clients_this_month,
            "growth_percentage": growth_str,
            "clients_with_orders": 0,
            "clients_with_orders_percentage": "0.0%",
            "total_spent": 0.00,
            "total_orders": 0,
            "avg_ticket": 0.00
        }

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='cities')
    def cities(self, request):
        """
        Retorna el listado de ciudades disponibles.
        """
        default_cities = [
            "Barquisimeto",
            "Caracas",
            "Maracaibo",
            "Maracay",
            "Mérida",
            "Puerto La Cruz",
            "San Cristóbal",
            "Valencia",
        ]
        return Response(default_cities, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        """
        Retorna o actualiza la información del perfil del usuario autenticado actual.
        """
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "No autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # PUT o PATCH
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Si se envía 'full_name' sin first_name explícito, dividir en nombre y apellido
        if 'full_name' in data and not data.get('first_name'):
            parts = str(data['full_name']).strip().split(' ', 1)
            data['first_name'] = parts[0]
            if len(parts) > 1:
                data['first_last_name'] = parts[1]

        serializer = self.get_serializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

