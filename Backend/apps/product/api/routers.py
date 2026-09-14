from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.product.api.views import (
    CategoryViewSet,
    ProductViewSet,
    FeaturedProductsAPIView,
    ExportCatalogPDFAPIView
)
from apps.product.api.dashboard_views import DashboardSummaryAPIView

router = DefaultRouter()

router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'products', ProductViewSet, basename='products')

urlpatterns = [
    path('featured-products/', FeaturedProductsAPIView.as_view(), name='featured-products'),
    path('catalog/export-pdf/', ExportCatalogPDFAPIView.as_view(), name='export-catalog-pdf'),
    path('products/catalog/export-pdf/', ExportCatalogPDFAPIView.as_view(), name='export-products-catalog-pdf'),
    path('dashboard/summary/', DashboardSummaryAPIView.as_view(), name='dashboard-summary'),
    path('products/statistics/dashboard/', DashboardSummaryAPIView.as_view(), name='products-statistics-dashboard'),
] + router.urls

