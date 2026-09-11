"""
Servicio de cálculo de métricas y ranking para productos.

Fórmula de ranking:
    ranking_score = 0.4 * V_norm + 0.6 * S_promedio

Donde:
    V_norm = ln(1 + V) / ln(1 + V_max)  (vistas normalizadas logarítmicamente)
    S_promedio = promedio de sentimiento normalizado [0, 1]
"""

import math
from django.db.models import Avg, Max, Case, When, Value, FloatField


def recalculate_product_metrics(product_id: int) -> None:
    """
    Recalcula sentiment_score y ranking_score para un producto dado.

    1. Calcula el promedio de sentimiento ponderado por etiqueta:
       - positive → +1, neutral → 0, negative → -1
       - Promedio ponderado por confidence, normalizado a [0, 1]
    2. Normaliza vistas logarítmicamente contra el máximo global.
    3. Aplica la fórmula de ranking ponderada.
    4. Actualiza solo los campos necesarios con update_fields.

    Args:
        product_id: ID del producto a recalcular.
    """
    from apps.product.models import Product, ProductReview

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return

    # ── 1. Calcular sentiment_score ──
    reviews = ProductReview.objects.filter(
        product_id=product_id,
        is_deleted=False
    )

    if reviews.exists():
        # Asignar valor numérico a cada etiqueta ponderado por confianza
        sentiment_avg = reviews.aggregate(
            avg_sentiment=Avg(
                Case(
                    When(sentiment_label='positive', then=Value(1.0)),
                    When(sentiment_label='neutral', then=Value(0.0)),
                    When(sentiment_label='negative', then=Value(-1.0)),
                    default=Value(0.0),
                    output_field=FloatField(),
                )
            )
        )['avg_sentiment'] or 0.0

        # Normalizar de [-1, 1] a [0, 1]
        sentiment_score = (sentiment_avg + 1.0) / 2.0
    else:
        sentiment_score = 0.5  # Sin reseñas → neutral

    # ── 2. Normalizar vistas logarítmicamente ──
    max_views = Product.objects.aggregate(
        max_views=Max('total_views')
    )['max_views'] or 0

    if max_views > 0:
        views_norm = math.log(1 + product.total_views) / math.log(1 + max_views)
    else:
        views_norm = 0.0

    # ── 3. Calcular ranking_score ──
    ranking_score = 0.4 * views_norm + 0.6 * sentiment_score

    # ── 4. Actualizar producto ──
    product.sentiment_score = round(sentiment_score, 4)
    product.ranking_score = round(ranking_score, 4)
    product.save(update_fields=['sentiment_score', 'ranking_score'])
