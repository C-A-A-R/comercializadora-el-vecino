import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Carga una vista HTML estática ubicada en /src/stitch y la renderiza como contenido
 * de la aplicación React. Se usa para reutilizar pantallas diseñadas previamente con
 * estructura sin integrarlas como componente JSX puro.
 */
export function StitchPage({ src, title }: { src: string; title: string }) {
  const [markup, setMarkup] = useState("");
  const [error, setError] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar la vista");
        return response.text();
      })
      .then((html) => {
        if (isMounted) setMarkup(html);
      })
      .catch(() => {
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  useEffect(() => {
    if (!rootRef.current) return;

    const routeMap: Record<string, string> = {
      inicio: "/",
      home: "/",
      catalogo: "/catalogo",
      catalog: "/catalogo",
      categorias: "/categorias",
      destacados: "/destacados",
      promociones: "/promociones",
      tiktok: "/tiktok",
      contacto: "/contacto",
      "detalle-producto": "/productos/1",
      productos: "/productos/1",
      admin: "/admin",
      "admin-panel": "/admin",
      resumen: "/admin",
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[data-path]");

      if (!anchor) return;

      const rawPath = anchor.dataset.path;
      const destination = rawPath ? routeMap[rawPath] : undefined;

      if (!destination) return;

      event.preventDefault();
      navigate(destination);
    };

    const currentRoot = rootRef.current;
    currentRoot.addEventListener("click", handleClick);

    return () => {
      currentRoot.removeEventListener("click", handleClick);
    };
  }, [markup, navigate]);

  if (error) {
    return (
      <main className="min-h-screen grid place-items-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No se pudo cargar la pantalla</h1>
          <p>Revisa el recurso Stitch.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={rootRef}
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
