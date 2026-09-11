from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.promotions.models import DiscountedPromotions, PromotionCombo
from apps.promotions.api.serializers import PromotionImageSerializer


class PromotionlImagesView(APIView):
    """
    Vista para obtener imágenes de promociones y combos para el carrusel del frontend.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            discounted_qs = DiscountedPromotions.objects.filter(
                is_deleted=False,
                image__isnull=False
            ).exclude(image='')
            
            combo_qs = PromotionCombo.objects.filter(
                is_deleted=False,
                image__isnull=False
            ).exclude(image='')
            
            # Filtrar por vigencia (is_active) en Python
            discounted_items = [item for item in discounted_qs if item.is_active]
            combo_items = [item for item in combo_qs if item.is_active]
            
            all_items = discounted_items + combo_items
            all_items.sort(key=lambda x: x.start_date, reverse=True)
            
            serializer = PromotionImageSerializer(
                all_items, 
                many=True, 
                context={'request': request}
            )

            return Response({
                'success': True,
                'data': serializer.data,
                'count': len(serializer.data),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Ha ocurrido un error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)