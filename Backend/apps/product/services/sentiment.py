"""
Clasificador de sentimiento ligero basado en léxico para comentarios en español.

Estrategia:
- Diccionario embebido de ~300 palabras positivas/negativas en español.
- Tokenización simple, conteo de hits, score normalizado [-1, 1].
- Sin dependencias pesadas (no PyTorch, no Transformers).
- Optimizado para recursos limitados de servidor.
"""

import re
import unicodedata

# ── Diccionario léxico de sentimiento en español ──

_POSITIVE_WORDS = frozenset([
    # Adjetivos positivos
    'excelente', 'genial', 'bueno', 'buena', 'buenos', 'buenas', 'buenísimo', 'buenisimo',
    'maravilloso', 'maravillosa', 'fantástico', 'fantastico', 'fantástica', 'fantastica',
    'increíble', 'increible', 'espectacular', 'perfecto', 'perfecta',
    'hermoso', 'hermosa', 'bonito', 'bonita', 'lindo', 'linda', 'precioso', 'preciosa',
    'magnífico', 'magnifico', 'magnífica', 'magnifica', 'estupendo', 'estupenda',
    'brillante', 'sobresaliente', 'destacado', 'destacada', 'notable',
    'superior', 'sublime', 'impresionante', 'excepcional', 'extraordinario', 'extraordinaria',
    'fenomenal', 'formidable', 'fabuloso', 'fabulosa', 'grandioso', 'grandiosa',
    'óptimo', 'optimo', 'óptima', 'optima', 'ideal', 'admirable',

    # Cualidades de producto
    'resistente', 'duradero', 'duradera', 'robusto', 'robusta', 'sólido', 'solido', 'sólida', 'solida',
    'eficiente', 'rápido', 'rapido', 'rápida', 'rapida', 'veloz',
    'cómodo', 'comodo', 'cómoda', 'comoda', 'confortable', 'práctico', 'practico', 'práctica', 'practica',
    'elegante', 'moderno', 'moderna', 'innovador', 'innovadora',
    'silencioso', 'silenciosa', 'potente', 'versátil', 'versatil',
    'compacto', 'compacta', 'liviano', 'liviana', 'ligero', 'ligera',
    'fiable', 'confiable', 'seguro', 'segura',

    # Verbos/expresiones positivas
    'encanta', 'encantan', 'fascina', 'fascinan', 'gusta', 'gustan', 'gustó', 'gusto',
    'satisfecho', 'satisfecha', 'contento', 'contenta', 'feliz', 'enamorado', 'enamorada',
    'recomiendo', 'recomendable', 'recomendado', 'recomendada',
    'funciona', 'funcionando', 'cumple', 'superó', 'supero', 'superado',
    'vale', 'conviene', 'ahorra', 'mejora', 'mejoró', 'mejoro',

    # Adverbios intensificadores positivos
    'mejor', 'mejores', 'buen', 'gran',

    # Expresiones de valor
    'calidad', 'garantía', 'garantia', 'económico', 'economico', 'económica', 'economica',
    'barato', 'barata', 'accesible', 'asequible', 'oferta', 'ganga',
    'útil', 'util', 'impecable', 'nuevo', 'nueva',
])

_NEGATIVE_WORDS = frozenset([
    # Adjetivos negativos
    'malo', 'mala', 'malos', 'malas', 'malísimo', 'malisimo', 'pésimo', 'pesimo', 'pésima', 'pesima',
    'terrible', 'horrible', 'horrendo', 'horrenda', 'espantoso', 'espantosa',
    'deficiente', 'mediocre', 'inferior', 'pobre', 'deplorable', 'lamentable',
    'asqueroso', 'asquerosa', 'desagradable', 'molesto', 'molesta',
    'feo', 'fea', 'horroroso', 'horrorosa', 'grotesco', 'grotesca',
    'decepcionante', 'frustrante', 'irritante', 'insoportable', 'intolerable',
    'inservible', 'inútil', 'inutil', 'defectuoso', 'defectuosa',

    # Problemas de producto
    'roto', 'rota', 'dañado', 'dañada', 'averiado', 'averiada', 'descompuesto', 'descompuesta',
    'frágil', 'fragil', 'endeble', 'débil', 'debil',
    'lento', 'lenta', 'pesado', 'pesada', 'ruidoso', 'ruidosa', 'ruidosos', 'ruidosas',
    'incómodo', 'incomodo', 'incómoda', 'incomoda',
    'inseguro', 'insegura', 'peligroso', 'peligrosa',
    'caro', 'cara', 'carísimo', 'carisimo', 'costoso', 'costosa', 'sobreprecio',
    'estafa', 'fraude', 'engaño', 'engano', 'timo', 'robo',

    # Verbos/expresiones negativas
    'odio', 'detesto', 'arrepiento', 'arrepentido', 'arrepentida',
    'decepcionado', 'decepcionada', 'frustrado', 'frustrada', 'enojado', 'enojada',
    'devolver', 'devolución', 'devolucion', 'devuelto', 'devuelta',
    'quejar', 'queja', 'reclamo', 'reclamar', 'reclamación', 'reclamacion',
    'falló', 'fallo', 'falla', 'fallar', 'fallan',
    'rompió', 'rompio', 'rompe', 'romperse', 'quebró', 'quebro',
    'descompuso', 'descompone', 'descomponer',

    # Adverbios/expresiones negativas
    'peor', 'peores', 'nunca', 'jamás', 'jamas',
    'nada', 'ninguno', 'ninguna',

    # Calidad negativa
    'basura', 'chatarra', 'porquería', 'porqueria', 'desperdicio',
    'problema', 'problemas', 'error', 'errores', 'defecto', 'defectos',
])

_NEGATION_WORDS = frozenset([
    'no', 'ni', 'nunca', 'jamás', 'jamas', 'tampoco', 'sin', 'nada',
])

_INTENSIFIER_WORDS = {
    'muy': 1.5,
    'mucho': 1.3,
    'bastante': 1.3,
    'demasiado': 1.4,
    'extremadamente': 1.8,
    'super': 1.5,
    'súper': 1.5,
    'ultra': 1.6,
    'totalmente': 1.5,
    'completamente': 1.5,
    'absolutamente': 1.6,
    'increíblemente': 1.7,
    'increiblemente': 1.7,
    'realmente': 1.3,
    'verdaderamente': 1.3,
    'sumamente': 1.5,
    'enormemente': 1.4,
}


def _normalize_text(text: str) -> str:
    """Normaliza texto: minúsculas, elimina acentos, limpia caracteres especiales."""
    text = text.lower().strip()
    # Mantener la ñ pero quitar otros diacríticos
    normalized = ''
    for char in text:
        if char == 'ñ':
            normalized += char
        else:
            nfkd = unicodedata.normalize('NFKD', char)
            normalized += ''.join(c for c in nfkd if not unicodedata.combining(c))
    return normalized


def _tokenize(text: str) -> list[str]:
    """Tokeniza el texto en palabras individuales."""
    normalized = _normalize_text(text)
    tokens = re.findall(r'[a-záéíóúñü]+', normalized)
    return tokens


def classify_comment(text: str) -> dict:
    """
    Clasifica el sentimiento de un comentario en español usando análisis léxico.

    Args:
        text: El comentario a clasificar.

    Returns:
        dict con keys:
            - "label": "positive" | "neutral" | "negative"
            - "score": float entre 0.0 y 1.0 indicando confianza
    """
    if not text or not text.strip():
        return {"label": "neutral", "score": 0.5}

    tokens = _tokenize(text)

    if not tokens:
        return {"label": "neutral", "score": 0.5}

    positive_score = 0.0
    negative_score = 0.0
    total_sentiment_tokens = 0

    i = 0
    while i < len(tokens):
        token = tokens[i]

        # Detectar negación (ventana de 2 palabras hacia adelante)
        is_negated = False
        if i > 0 and tokens[i - 1] in _NEGATION_WORDS:
            is_negated = True
        if i > 1 and tokens[i - 2] in _NEGATION_WORDS and tokens[i - 1] not in _POSITIVE_WORDS | _NEGATIVE_WORDS:
            is_negated = True

        # Detectar intensificador
        multiplier = 1.0
        if i > 0 and tokens[i - 1] in _INTENSIFIER_WORDS:
            multiplier = _INTENSIFIER_WORDS[tokens[i - 1]]

        if token in _POSITIVE_WORDS:
            if is_negated:
                negative_score += 1.0 * multiplier
            else:
                positive_score += 1.0 * multiplier
            total_sentiment_tokens += 1

        elif token in _NEGATIVE_WORDS:
            if is_negated:
                positive_score += 0.7 * multiplier  # Negación de negativo es menos fuerte
            else:
                negative_score += 1.0 * multiplier
            total_sentiment_tokens += 1

        i += 1

    # Calcular score final
    if total_sentiment_tokens == 0:
        return {"label": "neutral", "score": 0.5}

    total = positive_score + negative_score
    if total == 0:
        return {"label": "neutral", "score": 0.5}

    # Score normalizado: -1 (totalmente negativo) a +1 (totalmente positivo)
    raw_score = (positive_score - negative_score) / total

    # Determinar etiqueta con umbrales
    if raw_score > 0.15:
        label = "positive"
        confidence = min(0.5 + (raw_score * 0.5), 1.0)
    elif raw_score < -0.15:
        label = "negative"
        confidence = min(0.5 + (abs(raw_score) * 0.5), 1.0)
    else:
        label = "neutral"
        confidence = 0.5 + (1.0 - abs(raw_score)) * 0.3

    # Ajustar confianza por cantidad de tokens de sentimiento encontrados
    # Más tokens = más confianza en la clasificación
    token_factor = min(total_sentiment_tokens / 3.0, 1.0)
    confidence = confidence * (0.6 + 0.4 * token_factor)

    return {
        "label": label,
        "score": round(min(max(confidence, 0.0), 1.0), 4),
    }
