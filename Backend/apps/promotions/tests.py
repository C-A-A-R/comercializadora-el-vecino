from decimal import Decimal
from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status

from apps.product.models import Product
from apps.promotions.models import (
    DiscountedPromotions,
    PromotionProduct,
    PromotionCombo,
    ProductCombo
)


class DiscountedPromotionsModelTest(TestCase):
    """Pruebas unitarias para el modelo DiscountedPromotions y el cálculo de descuentos."""

    def setUp(self):
        self.product = Product.objects.create(
            product_name="Nevera Inverter Test",
            price=Decimal('1000.00')
        )
        self.now = timezone.now()

    def test_percentage_discount_calculation(self):
        """Verifica que el cálculo de descuento porcentual sea exacto."""
        promo = DiscountedPromotions.objects.create(
            name="Descuento 20%",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('20.00'),
            start_date=self.now - timedelta(days=1),
            end_date=self.now + timedelta(days=5)
        )
        discounted_price = promo.apply_discount(self.product.price)
        # 1000 - 20% = 800.00
        self.assertEqual(discounted_price, Decimal('800.00'))

    def test_fixed_discount_calculation(self):
        """Verifica que el cálculo de descuento por monto fijo sea exacto."""
        promo = DiscountedPromotions.objects.create(
            name="Descuento $150 Fijo",
            discounted_type=DiscountedPromotions.FIXED,
            discounted_value=Decimal('150.00'),
            start_date=self.now - timedelta(days=1),
            end_date=self.now + timedelta(days=5)
        )
        discounted_price = promo.apply_discount(self.product.price)
        # 1000 - 150 = 850.00
        self.assertEqual(discounted_price, Decimal('850.00'))

    def test_fixed_discount_exceeding_price_returns_zero(self):
        """Verifica que si el descuento fijo supera el precio base, retorne 0.00 y nunca negativo."""
        promo = DiscountedPromotions.objects.create(
            name="Mega Bono $1500",
            discounted_type=DiscountedPromotions.FIXED,
            discounted_value=Decimal('1500.00'),
            start_date=self.now - timedelta(days=1),
            end_date=self.now + timedelta(days=5)
        )
        discounted_price = promo.apply_discount(self.product.price)
        self.assertEqual(discounted_price, Decimal('0.00'))

    def test_is_active_property(self):
        """Verifica el estado de vigencia según fechas y borrado lógico."""
        # Promo activa
        active_promo = DiscountedPromotions.objects.create(
            name="Activa",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('10.00'),
            start_date=self.now - timedelta(days=2),
            end_date=self.now + timedelta(days=2)
        )
        self.assertTrue(active_promo.is_active)

        # Promo expirada
        expired_promo = DiscountedPromotions.objects.create(
            name="Expirada",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('10.00'),
            start_date=self.now - timedelta(days=10),
            end_date=self.now - timedelta(days=2)
        )
        self.assertFalse(expired_promo.is_active)

        # Promo borrada lógicamente
        active_promo.delete()
        self.assertTrue(active_promo.is_deleted)
        self.assertFalse(active_promo.is_active)

    def test_validation_invalid_dates(self):
        """Verifica que start_date posterior a end_date lance ValidationError."""
        invalid_promo = DiscountedPromotions(
            name="Fechas Invalidas",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('15.00'),
            start_date=self.now + timedelta(days=5),
            end_date=self.now + timedelta(days=1)
        )
        with self.assertRaises(ValidationError):
            invalid_promo.full_clean()

    def test_validation_invalid_percentage_range(self):
        """Verifica que porcentaje <= 0 o > 100 lance ValidationError."""
        promo_zero = DiscountedPromotions(
            name="Cero",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('0.00'),
            start_date=self.now,
            end_date=self.now + timedelta(days=1)
        )
        with self.assertRaises(ValidationError):
            promo_zero.full_clean()

        promo_over = DiscountedPromotions(
            name="Over 100",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('105.00'),
            start_date=self.now,
            end_date=self.now + timedelta(days=1)
        )
        with self.assertRaises(ValidationError):
            promo_over.full_clean()

    def test_promotion_product_promotional_price(self):
        """Verifica que PromotionProduct calcule correctamente el promotional_price."""
        promo = DiscountedPromotions.objects.create(
            name="Promo 25%",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('25.00'),
            start_date=self.now - timedelta(days=1),
            end_date=self.now + timedelta(days=3)
        )
        pp = PromotionProduct.objects.create(
            discounted_promotions=promo,
            product=self.product
        )
        # 1000 - 25% = 750.00
        self.assertEqual(pp.promotional_price, Decimal('750.00'))


class PromotionComboModelTest(TestCase):
    """Pruebas unitarias para combos promocionales y sus cálculos de ahorro."""

    def setUp(self):
        self.now = timezone.now()
        self.tv = Product.objects.create(
            product_name="Smart TV 55",
            price=Decimal('500.00')
        )
        self.soundbar = Product.objects.create(
            product_name="Soundbar Dolby",
            price=Decimal('200.00')
        )

    def test_combo_original_price_and_savings_calculation(self):
        """Verifica el cálculo de precio original acumulado y ahorro total del combo."""
        combo = PromotionCombo.objects.create(
            name="Combo Cine en Casa",
            price=Decimal('550.00'),
            start_date=self.now - timedelta(days=1),
            end_date=self.now + timedelta(days=10)
        )
        ProductCombo.objects.create(combo=combo, product=self.tv, quantity=1)
        ProductCombo.objects.create(combo=combo, product=self.soundbar, quantity=1)

        # Precio original: 500 + 200 = 700.00
        self.assertEqual(combo.original_total_price, Decimal('700.00'))
        # Ahorro: 700 - 550 = 150.00
        self.assertEqual(combo.savings, Decimal('150.00'))
        # Porcentaje de ahorro: (150 / 700) * 100 = 21.43%
        self.assertEqual(combo.savings_percentage, Decimal('21.43'))
        self.assertTrue(combo.is_active)

    def test_combo_with_multiple_quantities(self):
        """Verifica el cálculo con cantidades múltiples de un producto."""
        combo = PromotionCombo.objects.create(
            name="Pack 2x Soundbars",
            price=Decimal('320.00'),
            start_date=self.now
        )
        ProductCombo.objects.create(combo=combo, product=self.soundbar, quantity=2)

        # Subtotal: 2 * 200 = 400.00
        self.assertEqual(combo.original_total_price, Decimal('400.00'))
        self.assertEqual(combo.savings, Decimal('80.00'))
        self.assertEqual(combo.savings_percentage, Decimal('20.00'))

    def test_combo_validation_negative_price(self):
        """Verifica que precio negativo lance ValidationError."""
        combo = PromotionCombo(
            name="Combo Precio Invalido",
            price=Decimal('-50.00'),
            start_date=self.now
        )
        with self.assertRaises(ValidationError):
            combo.full_clean()

    def test_product_combo_validation_zero_quantity(self):
        """Verifica que cantidad < 1 en ProductCombo lance ValidationError."""
        combo = PromotionCombo.objects.create(
            name="Combo Test",
            price=Decimal('100.00'),
            start_date=self.now
        )
        pc = ProductCombo(combo=combo, product=self.tv, quantity=0)
        with self.assertRaises(ValidationError):
            pc.full_clean()


class PromotionsAPITest(APITestCase):
    """Pruebas de integración con la API REST para promociones y combos."""

    def setUp(self):
        self.now = timezone.now()
        self.product = Product.objects.create(
            product_name="Lavadora Carga Frontal",
            price=Decimal('600.00')
        )
        self.combo = PromotionCombo.objects.create(
            name="Combo Lavandería Full",
            price=Decimal('500.00'),
            start_date=self.now - timedelta(days=1),
            end_date=self.now + timedelta(days=7)
        )
        ProductCombo.objects.create(
            combo=self.combo,
            product=self.product,
            quantity=1
        )
        self.discount_promo = DiscountedPromotions.objects.create(
            name="Descuento 15% Lavado",
            discounted_type=DiscountedPromotions.PERCENTAGE,
            discounted_value=Decimal('15.00'),
            start_date=self.now - timedelta(days=1),
            end_date=self.now + timedelta(days=7)
        )
        PromotionProduct.objects.create(
            discounted_promotions=self.discount_promo,
            product=self.product
        )

    def test_list_promotion_combos_api(self):
        """GET /api/promotions/combos/ retorna lista paginada de combos."""
        response = self.client.get('/api/promotions/combos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertGreaterEqual(len(results), 1)

        combo_data = next((c for c in results if c['id'] == self.combo.id), None)
        self.assertIsNotNone(combo_data)
        self.assertEqual(combo_data['name'], "Combo Lavandería Full")
        self.assertEqual(float(combo_data['price']), 500.00)
        self.assertTrue(combo_data['is_active'])
        self.assertIn('combo_products', combo_data)

    def test_retrieve_promotion_combo_api(self):
        """GET /api/promotions/combos/<id>/ retorna detalle completo del combo."""
        response = self.client.get(f'/api/promotions/combos/{self.combo.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.combo.id)
        self.assertEqual(response.data['name'], "Combo Lavandería Full")
        self.assertEqual(len(response.data['combo_products']), 1)

    def test_create_promotion_combo_api(self):
        """POST /api/promotions/combos/ crea un nuevo combo con productos asociados."""
        payload = {
            'name': 'Nuevo Combo Cocina',
            'description': 'Cocina + Campana',
            'price': '450.00',
            'start_date': self.now.isoformat(),
            'end_date': (self.now + timedelta(days=15)).isoformat(),
            'items': [
                {'product_id': self.product.id, 'quantity': 1}
            ]
        }
        response = self.client.post('/api/promotions/combos/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Nuevo Combo Cocina')
        self.assertTrue(PromotionCombo.objects.filter(name='Nuevo Combo Cocina').exists())

    def test_list_discounted_promotions_api(self):
        """GET /api/promotions/discounted-promotions/ retorna lista de promociones."""
        response = self.client.get('/api/promotions/discounted-promotions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertGreaterEqual(len(results), 1)

        promo_data = next((p for p in results if p['id'] == self.discount_promo.id), None)
        self.assertIsNotNone(promo_data)
        self.assertEqual(promo_data['name'], "Descuento 15% Lavado")
        self.assertEqual(promo_data['discounted_type'], 'percentage')

    def test_soft_deleted_combo_excluded_from_api(self):
        """Verifica que combos eliminados lógicamente no aparezcan en la API."""
        self.combo.delete()
        self.assertTrue(self.combo.is_deleted)

        response = self.client.get('/api/promotions/combos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        results = data.get('results', data) if isinstance(data, dict) else data
        ids = [c['id'] for c in results]
        self.assertNotIn(self.combo.id, ids)
