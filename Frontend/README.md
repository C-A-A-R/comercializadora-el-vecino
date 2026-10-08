# EL VECINO — Prototipo de Catálogo Digital & Combos Mayoristas (Electric Neo-Tech)

Sistema de catálogo web comercial para **EL VECINO (Electro & Hogar)** enfocado en la distribución directa de equipos de alta gama desde bodega, **sin precios fijos online** y con cotización y asesoría técnica inmediata vía WhatsApp.

---

## 🎨 Sistema de Diseño y Variables CSS

El proyecto está diseñado bajo la estética **Electric Neo-Tech**, utilizando variables CSS nativas centralizadas en [`css/variables.css`](./css/variables.css) e integradas con [`css/styles.css`](./css/styles.css).

### Paleta Neón Principal:
- **`--electric-blue` (`#0800FF`)**: Color primario institucional, confianza técnica y alto contraste.
- **`--neon-magenta` (`#FF00A8`)**: Color de énfasis para promociones, ofertas de temporada y paquetes.
- **`--neon-cyan` (`#00F0FF`)**: Color de acción y cotización (sustituto premium de alto impacto del verde WhatsApp tradicional).
- **`--deep-obsidian` (`#0A0A0A`)**: Fondo oscuro para escenarios inmersivos (Hero, Combos, Vídeo Catálogo).
- **`--pure-white` (`#FFFFFF`) / `--slate-surface` (`#F4F6FB`)**: Superficies claras para máxima legibilidad de fichas técnicas.

---

## 📁 Páginas y Pestañas Individuales del Proyecto

Cada sección cuenta con su propio archivo HTML independiente para navegación limpia por pestañas:

| Archivo | Pestaña / Sección | Descripción |
|---|---|---|
| [`index.html`](./index.html) | **Inicio** | Portada principal con Hero dark neo-tech, métricas en vivo, beneficios y accesos directos. |
| [`promociones.html`](./promociones.html) | **Promociones & Combos** | Publicaciones de combos (Chef, Lavandería, Climatización, Cine 4K) con accesorios bonificados, garantías y botón WhatsApp. |
| [`catalogo.html`](./catalogo.html) | **Catálogo** | Catálogo técnico completo con buscador en tiempo real, filtros por categoría y modal de fichas. |
| [`categorias.html`](./categorias.html) | **Categorías** | Vista de familias de equipos (Refrigeración, Lavado, Climatización, Smart TV & Audio). |
| [`destacados.html`](./destacados.html) | **Destacados** | Selección de los electrodomésticos y dispositivos más cotizados de alta gama. |
| [`tiktok.html`](./tiktok.html) | **Vídeo Catálogo** | Demostraciones en formato vertical interactivo tipo TikTok / Reels con unboxings y pruebas. |
| [`contacto.html`](./contacto.html) | **Contacto** | Mesa de asesoría comercial directa, horarios de bodega y botón de chat 1 a 1. |

---

## 📁 Estructura de Carpetas

```text
├── index.html              # Portada principal
├── promociones.html        # Página de Combos y Promociones
├── catalogo.html           # Página de Catálogo con buscador
├── categorias.html         # Explorador de Categorías
├── destacados.html         # Equipos Destacados
├── tiktok.html             # Vídeo Catálogo inmersivo
├── contacto.html           # Mesa de Contacto y Asesoría
├── README.md               # Documentación y guía de uso
├── css/
│   ├── variables.css       # Definición de tokens, colores neón, tipografías y radios
│   └── styles.css          # Estilos modulares, componentes, grids y responsividad
└── js/
    ├── config.js           # Configuración global (número WhatsApp, textos y plantillas)
    ├── data.js             # Base de datos de categorías, productos (sin precios) y combos
    └── app.js              # Lógica de renderizado dinámico, buscador, modal y enlaces
```

---

## ⚙️ Cómo Personalizar

### 1. Cambiar el número de WhatsApp o los mensajes automáticos
Edita el archivo [`js/config.js`](./js/config.js):
```javascript
const CONFIG = {
  storeName: "EL VECINO",
  whatsappNumber: "584120000000", // <-- Coloca aquí el número internacional
  whatsappTemplates: {
    generalQuote: "¡Hola El Vecino! Quisiera solicitar una cotización...",
    productQuote: (productName, sku) => `¡Hola! Me interesa cotizar: *${productName}* (SKU: ${sku})...`,
    comboQuote: (comboName, sku, includes) => `¡Hola! Deseo cotizar el *${comboName}* (SKU: ${sku})...`
  }
};
```

### 2. Agregar o Modificar Combos de Promoción
Edita el array `COMBOS_DATA` en [`js/data.js`](./js/data.js):
```javascript
{
  id: "combo-05",
  sku: "COMBO-NUEVO",
  title: "Nombre del Combo",
  tagline: "Subtítulo descriptivo",
  badge: "Promoción Especial",
  badgeColor: "neon-cyan", // o "neon-magenta", "electric-blue"
  bonification: "Accesorio o servicio de regalo 100% bonificado",
  image: "URL_DE_LA_IMAGEN",
  items: [
    { type: "Equipo 1", icon: "kitchen", name: "Nevera...", detail: "Detalles técnicos..." },
    { type: "Bonificación", icon: "bolt", name: "Regulador...", detail: "Protección..." }
  ],
  guarantee: "Garantía de fábrica oficial",
  summary: "Resumen del paquete"
}
```

### 3. Agregar Productos al Catálogo
Edita el array `PRODUCTS_DATA` en [`js/data.js`](./js/data.js). Ningún producto incluye precio, solo especificaciones y botón de cotización.

---

## 🚀 Cómo Visualizar

Puedes abrir directamente cualquiera de los archivos `.html` en tu navegador web:
- Haz doble clic en [`index.html`](./index.html) para empezar desde el Inicio.
- Puedes saltar a cualquiera de las otras páginas mediante la barra de navegación superior.
