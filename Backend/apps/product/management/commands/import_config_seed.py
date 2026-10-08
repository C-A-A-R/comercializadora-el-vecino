import os
import json
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from apps.product.models import Category, Product, ProductFeature
from apps.promotions.models import PromotionCombo, ProductCombo


class Command(BaseCommand):
    help = 'Importa y siembra los datos del catálogo desde config.js (seed_config.json) hacia los modelos de Django.'

    def handle(self, *args, **options):
        json_path = os.path.join(settings.BASE_DIR, 'data', 'seed_config.json')
        if not os.path.exists(json_path):
            json_path = os.path.join(os.path.dirname(settings.BASE_DIR), 'data', 'seed_config.json')

        if not os.path.exists(json_path):
            self.stderr.write(self.style.ERROR(f"No se encontró el archivo de datos semilla en {json_path}"))
            return

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        self.stdout.write(self.style.MIGRATE_HEADING("Iniciando importación de datos semilla..."))

        with transaction.atomic():
            # 1. Importar Categorías
            category_map = {}
            for cat_data in data.get('categories', []):
                category, created = Category.objects.get_or_create(
                    category_name=cat_data['category_name'],
                    defaults={'description': cat_data.get('description', '')}
                )
                category_map[cat_data['id_slug']] = category
                status_str = "Creada" if created else "Ya existía"
                self.stdout.write(self.style.SUCCESS(f"  [Categoría] {category.category_name} ({status_str})"))

            # 2. Importar Productos
            product_map = {}
            for prod_data in data.get('products', []):
                product, created = Product.objects.get_or_create(
                    product_name=prod_data['product_name'],
                    defaults={
                        'price': prod_data.get('price', 0),
                        'brand': prod_data.get('brand', ''),
                        'is_feature_product': prod_data.get('is_feature_product', False),
                        'total_views': prod_data.get('total_views', 0),
                        'description': prod_data.get('description', '')
                    }
                )
                product_map[prod_data['id_slug']] = product

                # Asignar categoría
                cat_slug = prod_data.get('category_slug')
                if cat_slug and cat_slug in category_map:
                    product.categories.add(category_map[cat_slug])

                # Asignar características / especificaciones
                for spec_str in prod_data.get('specs', []):
                    if ':' in spec_str:
                        fname, fval = spec_str.split(':', 1)
                        fname = fname.strip()
                        fval = fval.strip()
                    else:
                        fname = 'Especificación'
                        fval = spec_str.strip()

                    ProductFeature.objects.get_or_create(
                        product=product,
                        feature_name=fname,
                        feature_value=fval
                    )

                status_str = "Creado" if created else "Ya existía"
                self.stdout.write(self.style.SUCCESS(f"  [Producto] {product.product_name} (${product.price}) ({status_str})"))

            # 3. Importar Combos Promocionales
            for promo_data in data.get('promotions', []):
                combo, created = PromotionCombo.objects.get_or_create(
                    name=promo_data['name'],
                    defaults={
                        'description': promo_data.get('description', ''),
                        'price': promo_data.get('price', 0),
                        'start_date': timezone.now()
                    }
                )

                for prod_slug in promo_data.get('product_slugs', []):
                    if prod_slug in product_map:
                        ProductCombo.objects.get_or_create(
                            combo=combo,
                            product=product_map[prod_slug],
                            defaults={'quantity': 1}
                        )

                status_str = "Creado" if created else "Ya existía"
                self.stdout.write(self.style.SUCCESS(f"  [Combo Promocional] {combo.name} (${combo.price}) ({status_str})"))

        self.stdout.write(self.style.SUCCESS("\n¡Importación de datos semilla finalizada con éxito!"))
