from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from apps.base.pagination import StandardResultsSetPagination


class BaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet base para todos los endpoints de la API:
    - Borrado lógico por defecto en get_queryset() y destroy().
    - Restauración automática de registros con campos únicos previamente eliminados lógicamente.
    - Soporte integrado de Paginación, Filtrado (DjangoFilterBackend), Búsqueda (SearchFilter) y Ordenación (OrderingFilter).
    """
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        model = self.get_serializer().Meta.model
        if hasattr(model, 'objects'):
            return model.objects.all()
        return model.objects.filter(is_deleted=False)

    def create(self, request, *args, **kwargs):
        """
        Sobrescribe create para interceptar registros duplicados previamente borrados lógicamente,
        restaurándolos y actualizándolos en lugar de fallar por unicidad.
        Si el duplicado está ACTIVO, responde con HTTP 400 indicando el conflicto.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            model = getattr(serializer.Meta, 'model', None) if hasattr(serializer, 'Meta') else None
            if model and hasattr(model, 'is_deleted'):
                valid_fields = {f.name for f in model._meta.fields}
                temp_kwargs = {k: v for k, v in request.data.items() if k in valid_fields}
                temp_obj = model(**temp_kwargs)
                soft_deleted = temp_obj._find_soft_deleted_duplicate()
                if soft_deleted:
                    for key, val in request.data.items():
                        if key in valid_fields and key not in ('id', 'created_at', 'is_deleted', 'deleted_at'):
                            setattr(soft_deleted, key, val)
                    soft_deleted.is_deleted = False
                    soft_deleted.deleted_at = None
                    soft_deleted.save()

                    out_serializer = self.get_serializer(soft_deleted)
                    return Response(out_serializer.data, status=status.HTTP_201_CREATED)

            serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        """Aplica borrado lógico en lugar de borrado físico en la base de datos."""
        message = kwargs.pop("message", None)
        instance = self.get_object()
        instance.delete()

        if message is not None:
            serializer = self.get_serializer(instance)
            return Response({"mensaje": message, "objeto": serializer.data}, status=status.HTTP_200_OK)

        return Response({"message": "Registro eliminado correctamente"}, status=status.HTTP_204_NO_CONTENT)