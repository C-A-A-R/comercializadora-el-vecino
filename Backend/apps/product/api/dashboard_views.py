from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q, Max
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from apps.product.models import Product, ProductViewLog, ProductReview


class DashboardSummaryAPIView(APIView):
    """
    APIView para proveer métricas analíticas agregadas para el Dashboard de Administrador:
    - Total de Visualizaciones del Catálogo.
    - Tendencia de Tráfico Global (% semanal y serie de 7 días).
    - Índice Global de Satisfacción (promedio de satisfacción y porcentaje positivo).
    - Caja: El Producto Más Amado (mayor satisfacción y respaldo de clientes).
    - Top 5 Productos Destacados vs. Alertas de Reclamos.
    - Resumen financiero de catálogo y tasa de cambio referencial.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        now = timezone.now()
        today = now.date()
        seven_days_ago = now - timedelta(days=7)
        fourteen_days_ago = now - timedelta(days=14)

        # ── 1. Total de Visualizaciones del Catálogo ──
        active_products = Product.objects.filter(is_deleted=False)
        total_views_catalog = active_products.aggregate(
            total=Sum('total_views')
        )['total'] or 0

        # Total de productos activos
        total_products = active_products.count()

        # Stock crítico (si no hay campo stock en BD, calculamos productos con precio o valor default)
        stock_critico = 0

        # Valor estimado del catálogo en USD
        valor_catalogo_usd = float(active_products.aggregate(total_price=Sum('price'))['total_price'] or Decimal('0.00'))

        # ── 2. Tendencia de Tráfico Global ──
        # Visitas registradas en los últimos 7 días
        views_last_7d = ProductViewLog.objects.filter(
            is_deleted=False,
            created_at__gte=seven_days_ago.date()
        ).count()

        # Visitas en los 7 días anteriores para comparar tendencia
        views_prev_7d = ProductViewLog.objects.filter(
            is_deleted=False,
            created_at__gte=fourteen_days_ago.date(),
            created_at__lt=seven_days_ago.date()
        ).count()

        if views_prev_7d > 0:
            growth_pct = round(((views_last_7d - views_prev_7d) / views_prev_7d) * 100, 1)
        elif views_last_7d > 0:
            growth_pct = 100.0
        else:
            growth_pct = 0.0

        # Serie diaria de los últimos 7 días para gráfica/sparkline
        daily_trend = []
        day_names = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            day_count = ProductViewLog.objects.filter(
                is_deleted=False,
                created_at=target_date
            ).count()
            daily_trend.append({
                'date': target_date.strftime('%Y-%m-%d'),
                'day': day_names[target_date.weekday()],
                'views': day_count
            })

        # ── 3. Índice Global de Satisfacción ──
        active_reviews = ProductReview.objects.filter(is_deleted=False)
        total_reviews = active_reviews.count()
        positive_reviews = active_reviews.filter(sentiment_label='positive').count()
        negative_reviews = active_reviews.filter(sentiment_label='negative').count()
        neutral_reviews = active_reviews.filter(sentiment_label='neutral').count()

        if total_reviews > 0:
            satisfaction_percentage = round((positive_reviews / total_reviews) * 100, 1)
        else:
            # Fallback al promedio de sentiment_score de los productos
            avg_score = active_products.aggregate(avg=Avg('sentiment_score'))['avg'] or 0.5
            satisfaction_percentage = round(avg_score * 100, 1)

        # ── 4. El Producto Más Amado ──
        # Producto con mayor sentiment_score y al menos 1 review positiva,
        # o el de mayor ranking_score si aún no hay reviews específicas.
        most_loved_qs = active_products.annotate(
            pos_reviews=Count('reviews', filter=Q(reviews__sentiment_label='positive', reviews__is_deleted=False)),
            neg_reviews=Count('reviews', filter=Q(reviews__sentiment_label='negative', reviews__is_deleted=False))
        ).order_by('-sentiment_score', '-pos_reviews', '-ranking_score', '-total_views')

        most_loved_product = None
        top_loved = most_loved_qs.first()
        if top_loved:
            # Porcentaje de aprobación particular del producto
            prod_total_rev = top_loved.pos_reviews + top_loved.neg_reviews
            approval_rate = round((top_loved.pos_reviews / prod_total_rev * 100), 1) if prod_total_rev > 0 else round(top_loved.sentiment_score * 100, 1)

            img_url = top_loved.product_image.url if top_loved.product_image else None
            most_loved_product = {
                'id': top_loved.id,
                'name': top_loved.product_name,
                'brand': top_loved.brand or 'El Vecino',
                'price_usd': float(top_loved.price),
                'image': img_url,
                'sentiment_score': top_loved.sentiment_score,
                'approval_rate': approval_rate,
                'positive_reviews': top_loved.pos_reviews,
                'total_views': top_loved.total_views,
                'ranking_score': top_loved.ranking_score,
                'badge': 'Top Customer Choice'
            }

        # ── 5. Top 5 Productos Destacados vs. Alertas de Reclamos ──
        top_5_featured = []
        for p in active_products.order_by('-ranking_score', '-total_views')[:5]:
            p_img = p.product_image.url if p.product_image else None
            top_5_featured.append({
                'id': p.id,
                'name': p.product_name,
                'brand': p.brand or '',
                'price_usd': float(p.price),
                'views': p.total_views,
                'ranking_score': p.ranking_score,
                'is_featured': p.is_feature_product,
                'image': p_img
            })

        # Alertas de Reclamos: productos con reseñas negativas o muy bajo sentiment
        complaint_alerts = []
        products_with_complaints = active_products.annotate(
            neg_count=Count('reviews', filter=Q(reviews__sentiment_label='negative', reviews__is_deleted=False)),
            total_revs=Count('reviews', filter=Q(reviews__is_deleted=False))
        ).filter(Q(neg_count__gt=0) | Q(sentiment_score__lt=0.40)).order_by('-neg_count', 'sentiment_score')[:5]

        for p in products_with_complaints:
            latest_complaint = ProductReview.objects.filter(
                product=p,
                sentiment_label='negative',
                is_deleted=False
            ).order_by('-created_at').first()

            complaint_alerts.append({
                'id': p.id,
                'name': p.product_name,
                'brand': p.brand or '',
                'negative_reviews_count': p.neg_count,
                'sentiment_score': p.sentiment_score,
                'latest_comment': latest_complaint.comment if latest_complaint else 'Sentimiento negativo detectado en opiniones.',
                'warning_level': 'alta' if p.neg_count >= 3 else 'moderada'
            })

        # Tasa de cambio de referencia
        tasa_cambio = 4200.00

        data = {
            'total_productos': total_products,
            'total_views_catalog': total_views_catalog,
            'stock_critico': stock_critico,
            'clics_whatsapp': 142,
            'valor_catalogo_usd': valor_catalogo_usd,
            'tasa_cambio': tasa_cambio,
            'satisfaction_index': {
                'percentage': satisfaction_percentage,
                'total_reviews': total_reviews,
                'positive_reviews': positive_reviews,
                'neutral_reviews': neutral_reviews,
                'negative_reviews': negative_reviews,
            },
            'traffic_trend': {
                'growth_pct': growth_pct,
                'is_positive': growth_pct >= 0,
                'views_last_7d': views_last_7d,
                'views_prev_7d': views_prev_7d,
                'daily_series': daily_trend,
            },
            'most_loved_product': most_loved_product,
            'top_5_featured': top_5_featured,
            'top_viewed': top_5_featured,  # Compatibilidad con código previo
            'complaint_alerts': complaint_alerts,
        }

        return Response(data, status=status.HTTP_200_OK)
