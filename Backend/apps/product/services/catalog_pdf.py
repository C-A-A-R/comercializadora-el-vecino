"""
===============================================================================
SERVICIO DE GENERACIÓN Y EXPORTACIÓN DE CATÁLOGO EN PDF (apps.product)
===============================================================================

Este servicio permite generar un catálogo en formato PDF a partir de una plantilla
base (PDF Maestro prediseñado) y una lista filtrada de productos de la base de datos.

ARQUITECTURA DE PÁGINAS DEL PDF MAESTRO:
----------------------------------------
- Página 0: Portada inicial del catálogo.
- Páginas 1, 2, 3, 4: Páginas plantilla de contenido (cuadrículas de productos).
- Página 5: Página de cierre / Contraportada con información de contacto.

INSTRUCCIONES PARA AJUSTES MANUALES:
------------------------------------
1. COORDENADAS Y SLOTS:
   No necesitas tocar este archivo Python para mover productos o textos.
   Edita directamente el archivo JSON:
   `apps/product/templates/catalogs/catalog_layout.json`
   Allí puedes ajustar (en puntos tipográficos de PDF, origen (0,0) abajo a la izquierda):
   - img_x, img_y: Esquina inferior izquierda del contenedor de la imagen.
   - img_w, img_h: Ancho y alto máximos del contenedor de la imagen.
   - name_x, name_y, name_font_size: Posición y tamaño del título del producto.
   - price_x, price_y, price_font_size: Posición y tamaño del precio.
   - score_x, score_y, score_font_size: Posición y tamaño del score de ranking.

2. IMÁGENES:
   El servicio lee la imagen usando el sistema de almacenamiento configurado en Django
   (compatible con almacenamiento local en desarrollo y configuraciones de producción).
   Convierte internamente imágenes WebP a formato compatible con ReportLab.

3. FUENTES Y COLORES:
   Configurables en la sección "fonts" y "colors" de `catalog_layout.json`.
"""

import io
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from PIL import Image
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from django.conf import settings

logger = logging.getLogger(__name__)

# Rutas estándar hacia los archivos de recursos
DEFAULT_CONFIG_PATH = Path(settings.BASE_DIR) / 'apps' / 'product' / 'templates' / 'catalogs' / 'catalog_layout.json'
DEFAULT_MASTER_PATH = Path(settings.BASE_DIR) / 'apps' / 'product' / 'templates' / 'catalogs' / 'catalog_master.pdf'


# ===============================================================================
# 1. CARGA DE CONFIGURACIÓN
# ===============================================================================

def load_layout_config(config_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Carga el archivo JSON de layout y coordenadas.
    Si el archivo no existe o está corrupto, retorna una configuración por defecto.
    """
    path = config_path or DEFAULT_CONFIG_PATH
    if path.exists():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error al cargar layout JSON (%s): %s", path, e)

    # Configuración de respaldo por defecto
    return {
        "page_size": "letter",
        "items_per_page": 4,
        "pages_config": {
            "cover_page_index": 0,
            "body_page_indices": [1, 2, 3, 4],
            "closing_page_index": 5
        },
        "fonts": {
            "name_font": "Helvetica-Bold",
            "price_font": "Helvetica-Bold",
            "score_font": "Helvetica"
        },
        "colors": {
            "name_rgb": [0.1, 0.1, 0.1],
            "price_rgb": [0.15, 0.55, 0.2],
            "score_rgb": [0.35, 0.35, 0.35]
        },
        "text_limits": {
            "name_max_chars": 35
        },
        "slots": [
            {"img_x": 50, "img_y": 460, "img_w": 220, "img_h": 180, "name_x": 50, "name_y": 440, "name_font_size": 11, "price_x": 50, "price_y": 420, "price_font_size": 10, "score_x": 130, "score_y": 420, "score_font_size": 8},
            {"img_x": 320, "img_y": 460, "img_w": 220, "img_h": 180, "name_x": 320, "name_y": 440, "name_font_size": 11, "price_x": 320, "price_y": 420, "price_font_size": 10, "score_x": 400, "score_y": 420, "score_font_size": 8},
            {"img_x": 50, "img_y": 180, "img_w": 220, "img_h": 180, "name_x": 50, "name_y": 160, "name_font_size": 11, "price_x": 50, "price_y": 140, "price_font_size": 10, "score_x": 130, "score_y": 140, "score_font_size": 8},
            {"img_x": 320, "img_y": 180, "img_w": 220, "img_h": 180, "name_x": 320, "name_y": 160, "name_font_size": 11, "price_x": 320, "price_y": 140, "price_font_size": 10, "score_x": 400, "score_y": 140, "score_font_size": 8}
        ]
    }


# ===============================================================================
# 2. FUNCIONES DE DIBUJO E INSERCIÓN (FÁCILES DE MODIFICAR Y ENTENDER)
# ===============================================================================

def _resolve_product_image_reader(product) -> Optional[ImageReader]:
    """
    Obtiene y prepara la imagen del producto para ser insertada en ReportLab.
    
    COMPATIBILIDAD:
    - Lee a través del sistema de almacenamiento configurado en Django (FileSystem, S3, etc.).
    - Convierte formatos como WebP a PNG/RGB en memoria con Pillow para que ReportLab
      la procese sin errores.
    
    Retorna un ImageReader de ReportLab o None si no hay imagen válida.
    """
    image_field = getattr(product, 'product_image', None)
    if not image_field:
        return None

    try:
        # 1. Intentar abrir el archivo mediante el Storage API de Django
        image_bytes: Optional[bytes] = None
        
        try:
            image_field.open()
            image_bytes = image_field.read()
            image_field.close()
        except Exception:
            pass

        # 2. Fallback a ruta local en disco si storage.open falló
        if not image_bytes:
            try:
                if hasattr(image_field, 'path') and Path(image_field.path).exists():
                    with open(image_field.path, 'rb') as f:
                        image_bytes = f.read()
            except Exception:
                pass

        if not image_bytes:
            return None

        # 3. Procesar y normalizar con Pillow (Conversión WebP/RGBA a RGB/PNG para ReportLab)
        pil_img = Image.open(io.BytesIO(image_bytes))
        
        # Convertir a RGB o RGBA seguro
        if pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info):
            converted_img = pil_img.convert('RGBA')
            out_format = 'PNG'
        else:
            converted_img = pil_img.convert('RGB')
            out_format = 'JPEG'

        buffer = io.BytesIO()
        converted_img.save(buffer, format=out_format)
        buffer.seek(0)
        
        return ImageReader(buffer)

    except Exception as exc:
        logger.warning("No se pudo procesar la imagen del producto ID=%s: %s", getattr(product, 'id', None), exc)
        return None


def draw_product_image(pdf_canvas: canvas.Canvas, product, slot_config: Dict[str, Any]) -> bool:
    """
    Dibuja la imagen del producto dentro del recuadro asignado.
    
    PARÁMETROS DEL SLOT (JSON):
    - img_x: Posición horizontal (en puntos, desde la izquierda).
    - img_y: Posición vertical (en puntos, desde abajo).
    - img_w: Ancho máximo del recuadro de la imagen.
    - img_h: Alto máximo del recuadro de la imagen.
    
    Retorna True si se insertó la imagen, False si no tenía o falló.
    """
    image_reader = _resolve_product_image_reader(product)
    if not image_reader:
        return False

    try:
        pdf_canvas.drawImage(
            image_reader,
            slot_config["img_x"],
            slot_config["img_y"],
            width=slot_config["img_w"],
            height=slot_config["img_h"],
            preserveAspectRatio=True,
            anchor='c',
            mask='auto'
        )
        return True
    except Exception as exc:
        logger.warning("Error al dibujar imagen en canvas para producto %s: %s", getattr(product, 'id', None), exc)
        return False


def draw_product_text(pdf_canvas: canvas.Canvas, product, slot_config: Dict[str, Any], full_config: Dict[str, Any]) -> None:
    """
    Dibuja los textos asociados al producto (Nombre, Precio, Ranking Score, etc.).
    
    PARÁMETROS DEL SLOT Y CONFIGURACIÓN (JSON):
    - name_x, name_y, name_font_size: Ubicación y tamaño del título del producto.
    - price_x, price_y, price_font_size: Ubicación y tamaño del precio.
    - score_x, score_y, score_font_size: Ubicación y tamaño del score.
    - fonts / colors: Fuentes y colores definidos en el JSON.
    """
    fonts = full_config.get("fonts", {})
    colors = full_config.get("colors", {})
    limits = full_config.get("text_limits", {})

    # 1. Nombre del Producto
    product_name = getattr(product, 'product_name', '') or ''
    max_chars = limits.get("name_max_chars", 35)
    display_name = (product_name[:max_chars] + '...') if len(product_name) > max_chars else product_name

    pdf_canvas.setFont(fonts.get("name_font", "Helvetica-Bold"), slot_config.get("name_font_size", 11))
    name_rgb = colors.get("name_rgb", [0.08, 0.08, 0.08])
    pdf_canvas.setFillColorRGB(*name_rgb)
    pdf_canvas.drawString(slot_config["name_x"], slot_config["name_y"], display_name)

    # 2. Precio
    price = getattr(product, 'price', 0)
    price_text = f"${price:,.2f}" if isinstance(price, (int, float)) else f"${price}"

    pdf_canvas.setFont(fonts.get("price_font", "Helvetica-Bold"), slot_config.get("price_font_size", 10))
    price_rgb = colors.get("price_rgb", [0.15, 0.55, 0.2])
    pdf_canvas.setFillColorRGB(*price_rgb)
    pdf_canvas.drawString(slot_config["price_x"], slot_config["price_y"], price_text)

    # 3. Score de Ranking / Popularidad (si existe)
    ranking_score = getattr(product, 'ranking_score', None)
    if ranking_score is not None and "score_x" in slot_config and "score_y" in slot_config:
        score_text = f"Score: {float(ranking_score):.2f}"
        pdf_canvas.setFont(fonts.get("score_font", "Helvetica"), slot_config.get("score_font_size", 8))
        score_rgb = colors.get("score_rgb", [0.35, 0.35, 0.35])
        pdf_canvas.setFillColorRGB(*score_rgb)
        pdf_canvas.drawString(slot_config["score_x"], slot_config["score_y"], score_text)

    # Reset de color a negro estándar
    pdf_canvas.setFillColorRGB(0, 0, 0)


def create_overlay_page_stream(products_chunk: List[Any], layout_config: Dict[str, Any]) -> io.BytesIO:
    """
    Genera un stream en memoria de una página PDF transparente (overlay)
    conteniendo las imágenes y textos de los productos asignados a los slots.
    """
    packet = io.BytesIO()
    pdf_canvas = canvas.Canvas(packet, pagesize=letter)
    slots = layout_config.get('slots', [])

    for product, slot in zip(products_chunk, slots):
        # 1. Dibujar Imagen
        draw_product_image(pdf_canvas, product, slot)
        # 2. Dibujar Textos
        draw_product_text(pdf_canvas, product, slot, layout_config)

    pdf_canvas.save()
    packet.seek(0)
    return packet


# ===============================================================================
# 3. GENERADOR DE PDF MAESTRO DE PRUEBA (FALLBACK / TESTS)
# ===============================================================================

def create_fallback_master_pdf(num_pages: int = 6) -> io.BytesIO:
    """
    Genera un PDF maestro dummy en memoria si no existe el archivo catalog_master.pdf.
    Estructura generada:
      - Página 0: Portada
      - Páginas 1, 2, 3, 4: Páginas de contenido con cuadrículas guía
      - Página 5: Contraportada / Cierre
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)

    for i in range(num_pages):
        if i == 0:
            # Portada
            c.setFont("Helvetica-Bold", 26)
            c.drawCentredString(306, 450, "CATÁLOGO DE PRODUCTOS")
            c.setFont("Helvetica", 14)
            c.drawCentredString(306, 410, "El Vecino - Edición Digital")
        elif i == num_pages - 1:
            # Contraportada / Cierre
            c.setFont("Helvetica-Bold", 20)
            c.drawCentredString(306, 450, "GRACIAS POR SU PREFERENCIA")
            c.setFont("Helvetica", 12)
            c.drawCentredString(306, 410, "Visítenos en nuestro catálogo en línea")
        else:
            # Plantilla de contenido
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, 740, f"Catálogo El Vecino - Página {i}")
            c.setFont("Helvetica", 9)
            c.setFillColorRGB(0.7, 0.7, 0.7)
            # Dibujar rectángulos guía tenues de fondo
            c.rect(48, 458, 224, 184, stroke=1, fill=0)
            c.rect(318, 458, 224, 184, stroke=1, fill=0)
            c.rect(48, 178, 224, 184, stroke=1, fill=0)
            c.rect(318, 178, 224, 184, stroke=1, fill=0)
            c.setFillColorRGB(0, 0, 0)
        c.showPage()

    c.save()
    buffer.seek(0)
    return buffer


# ===============================================================================
# 4. MOTOR PRINCIPAL DE ENSAMBLADO
# ===============================================================================

def build_filtered_catalog_pdf(products_queryset, master_pdf_path: Optional[Path] = None, config_path: Optional[Path] = None) -> bytes:
    """
    Ensambla el catálogo completo en bytes PDF:
    1. Carga el layout y el PDF Maestro.
    2. Inserta la Portada (Página 0).
    3. Para cada grupo de productos, fusiona la información dinámica sobre
       las páginas plantilla del cuerpo (Páginas 1..4).
    4. Inserta la Contraportada (Página 5).
    
    Retorna:
        bytes: Contenido binario del PDF generado.
    """
    layout_config = load_layout_config(config_path)
    pages_cfg = layout_config.get("pages_config", {})
    
    cover_idx = pages_cfg.get("cover_page_index", 0)
    body_indices = pages_cfg.get("body_page_indices", [1, 2, 3, 4])
    closing_idx = pages_cfg.get("closing_page_index", 5)

    # Cargar el PDF maestro (o generar el dummy de respaldo si no existe)
    master_file = master_pdf_path or DEFAULT_MASTER_PATH
    if master_file.exists():
        reader = PdfReader(str(master_file))
    else:
        dummy_stream = create_fallback_master_pdf(num_pages=6)
        reader = PdfReader(dummy_stream)

    writer = PdfWriter()
    total_master_pages = len(reader.pages)

    # ---------------------------------------------------------------------------
    # PASO 1: Agregar Portada (Página 0)
    # ---------------------------------------------------------------------------
    if total_master_pages > cover_idx:
        writer.add_page(reader.pages[cover_idx])
    elif total_master_pages > 0:
        writer.add_page(reader.pages[0])

    # ---------------------------------------------------------------------------
    # PASO 2: Agregar Páginas de Contenido con Productos Dinámicos
    # ---------------------------------------------------------------------------
    products = list(products_queryset)
    items_per_page = layout_config.get('items_per_page', 4)

    # Agrupar productos en bloques (chunks) de tamaño items_per_page
    product_chunks = [products[i:i + items_per_page] for i in range(0, len(products), items_per_page)]

    for page_num, chunk in enumerate(product_chunks):
        # Determinar qué plantilla de página del maestro utilizar (Página 1, 2, 3 o 4)
        if body_indices:
            template_idx = body_indices[page_num % len(body_indices)]
        else:
            template_idx = 1 if total_master_pages > 1 else 0

        # Asegurar índice válido en el lector
        actual_template_idx = template_idx if template_idx < total_master_pages else min(1, total_master_pages - 1)
        
        # 1. Crear el overlay con imágenes y textos en memoria
        overlay_stream = create_overlay_page_stream(chunk, layout_config)
        overlay_reader = PdfReader(overlay_stream)
        overlay_page = overlay_reader.pages[0]

        # 2. Clonar la página plantilla del PDF maestro y superponer el contenido
        base_page = reader.pages[actual_template_idx]
        merged_page = writer.add_page(base_page)
        merged_page.merge_page(overlay_page)

    # ---------------------------------------------------------------------------
    # PASO 3: Agregar Contraportada / Página de Cierre (Página 5)
    # ---------------------------------------------------------------------------
    actual_closing_idx = closing_idx if closing_idx < total_master_pages else total_master_pages - 1
    if actual_closing_idx >= 0 and actual_closing_idx < total_master_pages and actual_closing_idx != cover_idx:
        writer.add_page(reader.pages[actual_closing_idx])
    elif total_master_pages > 1 and actual_closing_idx != cover_idx:
        writer.add_page(reader.pages[-1])

    # ---------------------------------------------------------------------------
    # PASO 4: Exportar a Bytes
    # ---------------------------------------------------------------------------
    output_stream = io.BytesIO()
    writer.write(output_stream)
    output_stream.seek(0)
    return output_stream.getvalue()
