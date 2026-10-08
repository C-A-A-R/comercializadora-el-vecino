from django.test import TestCase
from django.contrib.admin.sites import AdminSite
from apps.product.models import Product, ProductAngleImage, ProductColorImage, ProductReview, ProductViewLog
from apps.product.admin import ProductAngleImageInline, ProductColorImageInline
from apps.product.api.serializers import ProductSerializer
from apps.product.services.sentiment import classify_comment
from apps.product.services.scoring import recalculate_product_metrics
from rest_framework.test import APIClient
from django.db.models import F
import concurrent.futures


class ProductInlineSoftDeleteTest(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            product_name="Producto Test",
            price=100.00
        )
        self.angle1 = ProductAngleImage.objects.create(product=self.product, angle="Izquierdo")
        self.angle2 = ProductAngleImage.objects.create(product=self.product, angle="Frente")
        self.color1 = ProductColorImage.objects.create(product=self.product, color_name="Rojo", color_hex="#FF0000")

    def test_inline_get_queryset_excludes_soft_deleted(self):
        """Verifica que el inline de Django Admin excluya los ángulos borrados lógicamente."""
        from django.test import RequestFactory
        from django.contrib.auth.models import User

        factory = RequestFactory()
        request = factory.get('/admin/')
        request.user = User(is_superuser=True, is_staff=True)

        admin_site = AdminSite()
        inline = ProductAngleImageInline(ProductAngleImage, admin_site)

        # 1. Eliminar lógicamente angle2
        self.angle2.delete()
        self.assertTrue(ProductAngleImage.all_objects.get(id=self.angle2.id).is_deleted)

        # 2. Consultar el queryset del Inline
        queryset = inline.get_queryset(request)
        angles_in_queryset = list(queryset.filter(product=self.product))

        # 3. Solo debe estar angle1
        self.assertEqual(len(angles_in_queryset), 1)
        self.assertEqual(angles_in_queryset[0].id, self.angle1.id)

    def test_serializer_excludes_soft_deleted_angles_and_colors(self):
        """Verifica que el serializador de la API excluya ángulos y colores borrados lógicamente."""
        self.angle2.delete()
        self.color1.delete()

        serializer = ProductSerializer(self.product)
        data = serializer.data

        angle_ids = [a['id'] for a in data['angle_images']]
        color_ids = [c['id'] for c in data['color_images']]

        self.assertIn(self.angle1.id, angle_ids)
        self.assertNotIn(self.angle2.id, angle_ids)
        self.assertNotIn(self.color1.id, color_ids)


# ══════════════════════════════════════════════════════════════════════════════
# Tests de Analíticas
# ══════════════════════════════════════════════════════════════════════════════


class SentimentClassificationTest(TestCase):
    """Verifica que el clasificador léxico de sentimiento funcione correctamente en español."""

    def test_positive_comment(self):
        """Frases claramente positivas deben clasificarse como 'positive'."""
        result = classify_comment("Excelente producto, muy buena calidad")
        self.assertEqual(result['label'], 'positive')
        self.assertGreater(result['score'], 0.5)

    def test_negative_comment(self):
        """Frases claramente negativas deben clasificarse como 'negative'."""
        result = classify_comment("Pésimo producto, llegó roto y defectuoso")
        self.assertEqual(result['label'], 'negative')
        self.assertGreater(result['score'], 0.5)

    def test_neutral_comment(self):
        """Frases sin carga sentimental evidente deben ser 'neutral'."""
        result = classify_comment("El paquete llegó el martes por la tarde")
        self.assertEqual(result['label'], 'neutral')

    def test_negation_handling(self):
        """La negación debe invertir la polaridad."""
        result = classify_comment("No es bueno este producto")
        self.assertIn(result['label'], ['negative', 'neutral'])

    def test_intensifier_handling(self):
        """Los intensificadores deben aumentar la confianza."""
        result_base = classify_comment("Bueno")
        result_intensified = classify_comment("Muy bueno")
        # El intensificador debería dar un score igual o mayor
        self.assertGreaterEqual(result_intensified['score'], result_base['score'])

    def test_empty_comment(self):
        """Comentarios vacíos deben devolver neutral."""
        result = classify_comment("")
        self.assertEqual(result['label'], 'neutral')
        result2 = classify_comment("   ")
        self.assertEqual(result2['label'], 'neutral')

    def test_mixed_sentiment(self):
        """Comentarios con sentimiento mixto deben clasificarse razonablemente."""
        result = classify_comment("Buen producto pero es muy caro")
        self.assertIn(result['label'], ['positive', 'neutral', 'negative'])
        # Solo verificamos que retorne un resultado válido
        self.assertIn(result['label'], ['positive', 'neutral', 'negative'])
        self.assertGreaterEqual(result['score'], 0.0)
        self.assertLessEqual(result['score'], 1.0)

    def test_multiple_positive_words(self):
        """Múltiples palabras positivas deben resultar en clasificación positiva con alta confianza."""
        result = classify_comment("Excelente calidad, perfecto, increíble, maravilloso producto recomendado")
        self.assertEqual(result['label'], 'positive')
        self.assertGreater(result['score'], 0.7)

    def test_multiple_negative_words(self):
        """Múltiples palabras negativas deben resultar en clasificación negativa con alta confianza."""
        result = classify_comment("Horrible, terrible, pésimo, defectuoso, basura total")
        self.assertEqual(result['label'], 'negative')
        self.assertGreater(result['score'], 0.7)


class ReviewFilteringTest(TestCase):
    """Verifica que el endpoint GET /api/products/<id>/reviews/ filtre solo reseñas positivas."""

    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            product_name="Producto Filtro Test",
            price=50.00
        )

    def test_only_positive_reviews_returned(self):
        """Solo las reseñas con sentiment_label='positive' deben aparecer en GET."""
        # Crear reseñas directamente
        ProductReview.objects.create(
            product=self.product,
            comment="Excelente producto",
            sentiment_label='positive',
            sentiment_confidence=0.85
        )
        ProductReview.objects.create(
            product=self.product,
            comment="Terrible producto",
            sentiment_label='negative',
            sentiment_confidence=0.90
        )
        ProductReview.objects.create(
            product=self.product,
            comment="Normal, nada especial",
            sentiment_label='neutral',
            sentiment_confidence=0.60
        )

        response = self.client.get(f'/api/products/{self.product.id}/reviews/')
        self.assertEqual(response.status_code, 200)

        # Puede estar paginado o no
        data = response.data
        if isinstance(data, dict) and 'results' in data:
            reviews = data['results']
        else:
            reviews = data

        # Solo debe haber 1 reseña positiva
        self.assertEqual(len(reviews), 1)
        self.assertEqual(reviews[0]['sentiment_label'], 'positive')

    def test_soft_deleted_reviews_excluded(self):
        """Las reseñas borradas lógicamente no deben aparecer."""
        review = ProductReview.objects.create(
            product=self.product,
            comment="Buen producto",
            sentiment_label='positive',
            sentiment_confidence=0.80
        )
        review.delete()  # Borrado lógico

        response = self.client.get(f'/api/products/{self.product.id}/reviews/')
        self.assertEqual(response.status_code, 200)

        data = response.data
        if isinstance(data, dict) and 'results' in data:
            reviews = data['results']
        else:
            reviews = data

        self.assertEqual(len(reviews), 0)

    def test_create_review_via_api(self):
        """POST /api/products/<id>/reviews/ debe crear reseña con sentimiento clasificado."""
        response = self.client.post(
            f'/api/products/{self.product.id}/reviews/',
            {'comment': 'Excelente producto, muy recomendado'},
            format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('sentiment_label', response.data)
        self.assertIn('sentiment_confidence', response.data)
        self.assertEqual(response.data['sentiment_label'], 'positive')


class ViewCountAtomicTest(TestCase):
    """Verifica que el incremento de vistas sea atómico y consistente."""

    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            product_name="Producto Vistas Test",
            price=75.00
        )

    def test_single_view_increment(self):
        """Una llamada a POST /view/ debe incrementar total_views en 1."""
        self.assertEqual(self.product.total_views, 0)

        response = self.client.post(f'/api/products/{self.product.id}/view/')
        self.assertEqual(response.status_code, 200)

        self.product.refresh_from_db()
        self.assertEqual(self.product.total_views, 1)
        self.assertEqual(response.data['total_views'], 1)

    def test_multiple_view_increments(self):
        """Múltiples llamadas secuenciales deben incrementar total_views correctamente."""
        for i in range(5):
            response = self.client.post(f'/api/products/{self.product.id}/view/')
            self.assertEqual(response.status_code, 200)

        self.product.refresh_from_db()
        self.assertEqual(self.product.total_views, 5)

    def test_view_creates_log_entry(self):
        """Cada vista debe crear un ProductViewLog."""
        self.client.post(f'/api/products/{self.product.id}/view/')
        self.client.post(f'/api/products/{self.product.id}/view/')

        logs = ProductViewLog.objects.filter(product=self.product, is_deleted=False)
        self.assertEqual(logs.count(), 2)

    def test_concurrent_view_increments(self):
        """Llamadas concurrentes deben incrementar total_views correctamente gracias a F()."""
        from django.db import connection

        if connection.vendor == 'sqlite':
            for _ in range(10):
                resp = self.client.post(f'/api/products/{self.product.id}/view/')
                self.assertEqual(resp.status_code, 200)
            self.product.refresh_from_db()
            self.assertEqual(self.product.total_views, 10)
            return

        num_concurrent = 10

        def post_view():
            client = APIClient()
            return client.post(f'/api/products/{self.product.id}/view/')

        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = [executor.submit(post_view) for _ in range(num_concurrent)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        for result in results:
            self.assertEqual(result.status_code, 200)

        self.product.refresh_from_db()
        self.assertEqual(self.product.total_views, num_concurrent)


class RankingCalculationTest(TestCase):
    """Verifica que el cálculo de ranking pondere correctamente vistas y sentimiento."""

    def setUp(self):
        self.product_a = Product.objects.create(
            product_name="Producto Popular",
            price=100.00,
            total_views=100
        )
        self.product_b = Product.objects.create(
            product_name="Producto Impopular",
            price=100.00,
            total_views=2
        )

    def test_more_views_and_better_sentiment_higher_ranking(self):
        """Un producto con más vistas y mejores reseñas debe tener ranking superior."""
        # Producto A: muchas vistas + reseñas positivas
        for _ in range(5):
            ProductReview.objects.create(
                product=self.product_a,
                comment="Excelente",
                sentiment_label='positive',
                sentiment_confidence=0.9
            )

        # Producto B: pocas vistas + reseñas negativas
        for _ in range(5):
            ProductReview.objects.create(
                product=self.product_b,
                comment="Terrible",
                sentiment_label='negative',
                sentiment_confidence=0.9
            )

        recalculate_product_metrics(self.product_a.id)
        recalculate_product_metrics(self.product_b.id)

        self.product_a.refresh_from_db()
        self.product_b.refresh_from_db()

        self.assertGreater(self.product_a.ranking_score, self.product_b.ranking_score)

    def test_sentiment_score_range(self):
        """El sentiment_score debe estar en el rango [0, 1]."""
        ProductReview.objects.create(
            product=self.product_a,
            comment="Bueno",
            sentiment_label='positive',
            sentiment_confidence=0.8
        )
        recalculate_product_metrics(self.product_a.id)
        self.product_a.refresh_from_db()

        self.assertGreaterEqual(self.product_a.sentiment_score, 0.0)
        self.assertLessEqual(self.product_a.sentiment_score, 1.0)

    def test_ranking_score_range(self):
        """El ranking_score debe estar en el rango [0, 1]."""
        recalculate_product_metrics(self.product_a.id)
        self.product_a.refresh_from_db()

        self.assertGreaterEqual(self.product_a.ranking_score, 0.0)
        self.assertLessEqual(self.product_a.ranking_score, 1.0)

    def test_no_reviews_neutral_sentiment(self):
        """Sin reseñas, el sentiment_score debe ser 0.5 (neutral)."""
        recalculate_product_metrics(self.product_a.id)
        self.product_a.refresh_from_db()

        self.assertAlmostEqual(self.product_a.sentiment_score, 0.5, places=2)

    def test_product_ordering_by_ranking(self):
        """GET /api/products/?ordering=-ranking_score debe ordenar correctamente."""
        # Configurar rankings diferentes
        self.product_a.ranking_score = 0.9
        self.product_a.save(update_fields=['ranking_score'])
        self.product_b.ranking_score = 0.3
        self.product_b.save(update_fields=['ranking_score'])

        client = APIClient()
        response = client.get('/api/products/?ordering=-ranking_score')
        self.assertEqual(response.status_code, 200)

        data = response.data
        if isinstance(data, dict) and 'results' in data:
            products = data['results']
        else:
            products = data

        # El primer producto debe tener ranking mayor
        if len(products) >= 2:
            self.assertGreaterEqual(products[0]['ranking_score'], products[1]['ranking_score'])


class CatalogPDFExportTest(TestCase):
    """Pruebas automatizadas para el endpoint de exportación de catálogo en PDF."""

    def setUp(self):
        self.client = APIClient()

    def test_export_pdf_status_and_headers(self):
        """Verifica que el endpoint retorne HTTP 200, Content-Type application/pdf y Content-Disposition."""
        Product.objects.create(
            product_name="Producto PDF 1",
            price=120.00,
            ranking_score=0.85
        )

        response = self.client.get('/api/catalog/export-pdf/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('attachment', response['Content-Disposition'])
        self.assertIn('catalogo_el_vecino.pdf', response['Content-Disposition'])

    def test_export_pdf_starts_with_magic_bytes(self):
        """Verifica que el binario resultante sea un PDF válido comenzando con %PDF."""
        Product.objects.create(
            product_name="Producto Magico",
            price=50.00
        )

        response = self.client.get('/api/catalog/export-pdf/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content.startswith(b'%PDF'))

    def test_export_pdf_page_count_structure(self):
        """
        Verifica el cálculo de páginas del catálogo:
        Portada (1) + Bloques de contenido (ceil(N / 4)) + Contraportada (1).
        Con 6 productos (4 por página): 1 + 2 + 1 = 4 páginas.
        """
        from pypdf import PdfReader
        import io

        for i in range(6):
            Product.objects.create(
                product_name=f"Producto Cuadrícula {i+1}",
                price=10.0 * (i + 1),
                ranking_score=0.1 * (i + 1)
            )

        response = self.client.get('/api/catalog/export-pdf/')
        self.assertEqual(response.status_code, 200)

        reader = PdfReader(io.BytesIO(response.content))
        # 1 portada + 2 páginas de contenido (4 y 2 productos) + 1 contraportada = 4
        self.assertEqual(len(reader.pages), 4)

    def test_export_pdf_with_filters(self):
        """Verifica que los filtros de URL (min_price, min_score, etc.) reduzcan los productos exportados."""
        from pypdf import PdfReader
        import io

        # 5 productos económicos
        for i in range(5):
            Product.objects.create(
                product_name=f"Barato {i}",
                price=20.00,
                ranking_score=0.2
            )
        # 1 producto premium
        Product.objects.create(
            product_name="Premium 1",
            price=500.00,
            ranking_score=0.95
        )

        # Filtrar por precio mínimo de $100 -> Solo 1 producto -> 1 portada + 1 página de contenido + 1 cierre = 3 páginas
        response = self.client.get('/api/catalog/export-pdf/?min_price=100')
        self.assertEqual(response.status_code, 200)

        reader = PdfReader(io.BytesIO(response.content))
        self.assertEqual(len(reader.pages), 3)

    def test_export_pdf_empty_catalog(self):
        """Un catálogo sin productos debe retornar solo Portada y Contraportada (2 páginas)."""
        from pypdf import PdfReader
        import io

        response = self.client.get('/api/catalog/export-pdf/')
        self.assertEqual(response.status_code, 200)

        reader = PdfReader(io.BytesIO(response.content))
        self.assertEqual(len(reader.pages), 2)

    def test_export_pdf_with_image_rendering(self):
        """Verifica que productos con imágenes no provoquen errores durante el renderizado ReportLab."""
        import io
        from PIL import Image
        from django.core.files.uploadedfile import SimpleUploadedFile

        img_buffer = io.BytesIO()
        img = Image.new('RGB', (200, 200), color='blue')
        img.save(img_buffer, format='JPEG')
        img_buffer.seek(0)
        uploaded = SimpleUploadedFile("test_img.jpg", img_buffer.getvalue(), content_type="image/jpeg")

        Product.objects.create(
            product_name="Producto Con Imagen",
            price=99.99,
            ranking_score=0.88,
            product_image=uploaded
        )

        response = self.client.get('/api/catalog/export-pdf/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content.startswith(b'%PDF'))


class ImportConfigSeedCommandTest(TestCase):
    """Prueba unitaria para verificar la correcta importación de datos con import_config_seed."""

    def test_import_config_seed_creates_objects(self):
        from django.core.management import call_command
        from apps.product.models import Category, Product, ProductFeature
        from apps.promotions.models import PromotionCombo

        call_command('import_config_seed')

        # Verificar categorías creadas
        self.assertGreaterEqual(Category.objects.count(), 5)
        self.assertTrue(Category.objects.filter(category_name='Refrigeración').exists())
        self.assertTrue(Category.objects.filter(category_name='Smart TVs & Audio').exists())

        # Verificar productos creados
        self.assertGreaterEqual(Product.objects.count(), 2)
        samsung = Product.objects.get(product_name__icontains='Samsung SpaceMax')
        self.assertTrue(samsung.is_feature_product)
        self.assertEqual(samsung.price, 5299000)

        # Verificar especificaciones creadas
        features = ProductFeature.objects.filter(product=samsung)
        self.assertGreaterEqual(features.count(), 4)

        # Verificar combo promocional creado
        self.assertTrue(PromotionCombo.objects.filter(name__icontains='Combo Dúo Cocina Chef').exists())


class DashboardSummaryAPITest(TestCase):
    """Pruebas unitarias para el endpoint de analíticas del Dashboard."""

    def setUp(self):
        self.client = APIClient()
        self.p1 = Product.objects.create(
            product_name="Producto Top",
            price=150.00,
            total_views=100,
            sentiment_score=0.95,
            ranking_score=0.92,
            is_feature_product=True
        )
        self.p2 = Product.objects.create(
            product_name="Producto Con Reclamos",
            price=80.00,
            total_views=40,
            sentiment_score=0.30,
            ranking_score=0.35,
            is_feature_product=False
        )
        # Reseña positiva para p1
        ProductReview.objects.create(
            product=self.p1,
            comment="Excelente producto",
            sentiment_label="positive",
            sentiment_confidence=0.9
        )
        # Reseña negativa para p2 (Alerta de reclamo)
        ProductReview.objects.create(
            product=self.p2,
            comment="Llegó dañado y no funciona",
            sentiment_label="negative",
            sentiment_confidence=0.85
        )
        # Registros de vistas
        ProductViewLog.objects.create(product=self.p1, ip_address="192.168.1.1")
        ProductViewLog.objects.create(product=self.p2, ip_address="192.168.1.2")

    def test_dashboard_summary_endpoint(self):
        response = self.client.get('/api/dashboard/summary/')
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Validar métricas globales
        self.assertEqual(data['total_productos'], 2)
        self.assertEqual(data['total_views_catalog'], 140)
        self.assertIn('satisfaction_index', data)
        self.assertEqual(data['satisfaction_index']['total_reviews'], 2)
        self.assertEqual(data['satisfaction_index']['positive_reviews'], 1)
        self.assertEqual(data['satisfaction_index']['negative_reviews'], 1)

        # Validar producto más amado
        self.assertIsNotNone(data['most_loved_product'])
        self.assertEqual(data['most_loved_product']['id'], self.p1.id)
        self.assertEqual(data['most_loved_product']['name'], "Producto Top")

        # Validar top 5 y alertas
        self.assertGreaterEqual(len(data['top_5_featured']), 1)
        self.assertEqual(data['top_5_featured'][0]['id'], self.p1.id)

        self.assertGreaterEqual(len(data['complaint_alerts']), 1)
        self.assertEqual(data['complaint_alerts'][0]['id'], self.p2.id)
        self.assertEqual(data['complaint_alerts'][0]['negative_reviews_count'], 1)

    def test_product_serializer_includes_review_analytics(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        results = response.json().get('results', [])
        self.assertEqual(len(results), 2)

        prod_top = next(p for p in results if p['id'] == self.p1.id)
        prod_neg = next(p for p in results if p['id'] == self.p2.id)

        # p1 es top y no tiene quejas
        self.assertTrue(prod_top['is_top_ranked'])
        self.assertFalse(prod_top['has_complaints'])
        self.assertEqual(prod_top['total_views'], 100)

        # p2 tiene reclamos
        self.assertTrue(prod_neg['has_complaints'])
        self.assertEqual(prod_neg['negative_reviews_count'], 1)



