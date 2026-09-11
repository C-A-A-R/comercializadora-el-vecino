from rest_framework.routers import DefaultRouter
from django.urls import path
from apps.promotions.api.api import DiscountedPromotionsViewSet, PromotionComboViewSet
from apps.promotions.api.promtions_images_views import PromotionlImagesView

urlpatterns = [
    path('promotions-images/', PromotionlImagesView.as_view(), name='promotionsimage'),
]

router = DefaultRouter()
router.register(r'discounted-promotions', DiscountedPromotionsViewSet, basename='discountedpromotions')
router.register(r'combos', PromotionComboViewSet, basename='promotioncombos')

urlpatterns += router.urls
