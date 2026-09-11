# Documentación del código del frontend

## 1. Visión general

Este proyecto es una interfaz web construida con React, TypeScript, Vite y Tailwind. Su objetivo principal es servir como frontend de una tienda o catálogo para El Vecino, reutilizando pantallas HTML estáticas almacenadas en la carpeta `src/stitch` y conectándolas con un backend mediante API REST.

La arquitectura sigue una separación simple:

- `src/App.tsx`: define la navegación principal.
- `src/components/StitchPage.tsx`: carga contenido HTML externo y lo renderiza.
- `src/hooks/useProducts.ts`: gestiona consultas a productos desde el backend.
- `src/services/api.ts`: cliente central para peticiones HTTP.
- `src/types/product.ts`: tipos TypeScript para validar la estructura de datos.
- `src/index.css`: configuración de estilos base de Tailwind.
- `src/stitch`: archivos HTML de pantallas mock o de referencia visual.

---

## 2. `src/main.tsx`

Este archivo es el punto de entrada de la aplicación. Aquí se crea la raíz de React y se montan los providers globales.

### ¿Qué hace?

- Crea la aplicación con `ReactDOM.createRoot(...)`.
- Envuelve todo en `React.StrictMode` para detectar errores de desarrollo.
- Configura `BrowserRouter` para habilitar navegación con URLs.
- Configura `QueryClientProvider` para manejar el estado de carga de datos desde el backend con TanStack Query.
- Importa el CSS principal del proyecto.

### ¿Por qué es importante?

Es el lugar donde se inicializa todo lo que necesita la app para funcionar correctamente: el enrutador, la caché de datos y el arranque visual.

---

## 3. `src/App.tsx`

Este componente define todas las rutas de la aplicación. En lugar de crear todo en JSX puro, delega la carga visual de cada pantalla a `StitchPage`.

### ¿Qué hace?

- Declara un componente `Page` que recibe `file` y `title`.
- Carga el archivo HTML correspondiente desde `/src/stitch/<archivo>`. 
- Define rutas como `/`, `/catalogo`, `/promociones`, `/contacto`, `/admin`, etc.
- Si la ruta no existe, redirige a `/` con `Navigate`.

### ¿Cómo funciona?

Por ejemplo, si la URL es `/catalogo`, React Router renderiza:

```tsx
<Page file="catalogo.html" title="Catálogo" />
```

Luego, `StitchPage` intenta buscar ese archivo HTML y lo inyecta dentro del DOM.

### Objetivo

Mantener la visual original de cada pantalla mientras la navegación se gestiona desde React.

---

## 4. `src/components/StitchPage.tsx`

Este componente es el puente entre el frontend React y las pantallas HTML estáticas.

### ¿Qué hace?

- Recibe dos props: `src` y `title`.
- Usa `useState` para guardar el HTML cargado.
- Usa `useEffect` para hacer `fetch(src)` y recuperar el contenido del archivo.
- Si el archivo no existe o hay un error, muestra un aviso visual de error.
- Si todo sale bien, usa `dangerouslySetInnerHTML` para insertar el HTML crudo.

### ¿Por qué `dangerouslySetInnerHTML`?

Porque el contenido viene como HTML plano y React no lo renderiza automáticamente como markup nativo. Esta propiedad permite inyectarlo directamente en la página.

### Precaución

Es una forma útil de reutilizar páginas estáticas, pero requiere controlar bien el HTML para evitar inyección o errores de estructura.

---

## 5. `src/hooks/useProducts.ts`

Este hook encapsula la consulta de productos al backend.

### ¿Qué hace?

- Llama a `api.get("/products/", { params })`.
- Recibe la respuesta y normaliza los datos.
- Si la API responde con un arreglo directo, lo devuelve.
- Si responde con una estructura tipo `{ results: [...] }`, devuelve `data.results`.

### ¿Para qué sirve?

Permite reutilizar la consulta en diferentes componentes sin repetir la lógica de fetching.

### ¿Qué devuelve?

`useQuery` retorna un objeto con estado como:

- `data`
- `isLoading`
- `isError`
- `error`

Eso hace que cualquier componente pueda mostrar spinner, error o datos de forma consistente.

---

## 6. `src/services/api.ts`

Archivo central para las llamadas HTTP.

### ¿Qué hace?

- Crea un cliente Axios con base URL dinámicamente configurable.
- Usa `import.meta.env.VITE_API_URL` como origen base.
- Si no está definido, usa `http://127.0.0.1:8000/api`.
- Añade el header `Authorization: Bearer <token>` si existe un token en `localStorage`.

### ¿Por qué es útil?

Evita duplicar configuración en cada llamada y centraliza autenticación.

---

## 7. `src/types/product.ts`

Define la forma de los productos en TypeScript.

### ¿Qué contiene?

- `id`: identificador único.
- `product_name`: nombre del producto.
- `brand`: marca.
- `description`: descripción.
- `product_image`: imagen del producto.
- `price`: precio del producto.
- `capacity`: capacidad o tamaño.
- `voltage`: voltaje.
- `is_feature_product`: si es producto destacado.
- `ranking_score`: puntaje de popularidad o relevancia.

### ¿Para qué sirve?

Ayuda a TypeScript a saber qué propiedades pueden venir del backend y reduce errores al manipular datos del producto.

---

## 8. `src/index.css`

Archivo base de estilos globales.

### ¿Qué hace?

- Importa las bases de Tailwind.
- Define desplazamiento suave con `scroll-behavior: smooth`.
- Define un fondo y fuente general para la aplicación.

### Objetivo

Proporcionar un estilo mínimo y consistente para todo el frontend.

---

## 9. `src/stitch`

Esta carpeta contiene HTML estático de pantallas. Son recursos visuales o de referencia que se cargan dinámicamente en la app.

### ¿Qué representan?

Son páginas maestras o mockups visuales que pueden simular secciones como:

- inicio
- catálogo
- categorías
- destacados
- promociones
- tiktok
- contacto
- detalle de producto
- dashboard

### ¿Por qué está separado?

Porque la UI original puede estar diseñada en HTML estático y no necesita ser reescrita totalmente en JSX. Esto permite reutilizar diseño visual profesional sin perder fidelidad.

---

## 10. Flujo general del proyecto

El flujo principal es este:

1. El usuario entra a una ruta, por ejemplo `/catalogo`.
2. `App.tsx` decide qué HTML cargar.
3. `StitchPage` hace un `fetch()` al archivo HTML de la carpeta `src/stitch`.
4. El contenido HTML se inyecta en la vista principal.
5. Cuando hace falta traer datos reales desde el backend, se usa `useProducts` y `api`.
6. TanStack Query administra caché, recarga y errores.

En resumen, el proyecto combina dos enfoques:

- diseño visual estático reutilizado,
- lógica dinámica con React y consultas API.

---

## 11. Observaciones clave

- El proyecto está pensado para conservar fidelidad visual usando archivos HTML de referencia.
- La capa de datos está desacoplada: el backend se accede desde `src/services` y hooks.
- La estructura es modular y fácilmente extensible.
- La interfaz pública evita renderizar precios según la documentación del proyecto, aunque el tipo `Product` los incluye por compatibilidad con el backend.

---

## 12. Conclusión

Este frontend actúa como una capa de presentación avanzada que combina navegación React, consultas HTTP con Axios y reutilización de pantallas HTML estáticas. Su diseño facilita mantener el aspecto visual original mientras se incorpora una lógica moderna de React y manejo de datos.
