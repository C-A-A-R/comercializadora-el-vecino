import { Routes, Route, Navigate } from "react-router-dom";
import { StitchPage } from "./components/StitchPage";

/**
 * Envuelve la vista de una pantalla HTML estática del proyecto Stitch.
 * Cada route carga un archivo HTML diferente desde /src/stitch para mantener
 * la UI visual original, aunque la navegación se gestione con React Router.
 */
const Page = ({ file, title }: { file: string; title: string }) => (
  <StitchPage src={`/src/stitch/${file}`} title={title} />
);

/**
 * Aplicación principal.
 * Define las rutas públicas del frontend y carga la vista correspondiente.
 * Las URLs van al archivo HTML estático relacionado que se renderiza dentro
 * del componente principal de la app.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Page file="index.html" title="Inicio" />} />
      <Route path="/inicio" element={<Page file="index.html" title="Inicio" />} />
      <Route path="/home" element={<Page file="index.html" title="Inicio" />} />
      <Route path="/catalogo" element={<Page file="catalogo.html" title="Catálogo" />} />
      <Route path="/catalog" element={<Page file="catalogo.html" title="Catálogo" />} />
      <Route path="/categorias" element={<Page file="categorias.html" title="Categorías" />} />
      <Route path="/destacados" element={<Page file="destacados.html" title="Destacados" />} />
      <Route path="/promociones" element={<Page file="promociones.html" title="Promociones" />} />
      <Route path="/tiktok" element={<Page file="tiktok.html" title="TikTok" />} />
      <Route path="/contacto" element={<Page file="contacto.html" title="Contacto" />} />
      <Route path="/productos/:id" element={<Page file="detalle-producto.html" title="Detalle de producto" />} />
      <Route path="/productos" element={<Page file="detalle-producto.html" title="Detalle de producto" />} />
      <Route path="/admin" element={<Page file="dashboard.html" title="Dashboard" />} />
      <Route path="/admin-panel" element={<Page file="dashboard.html" title="Dashboard" />} />
      <Route path="/resumen" element={<Page file="dashboard.html" title="Dashboard" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
