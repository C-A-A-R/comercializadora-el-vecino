// components/layout/Footer.js

export function renderAdminFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="bg-white border-t border-slate-border px-4 md:px-6 py-4 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
      <div class="flex items-center gap-2 text-center sm:text-left">
        <span class="font-bold text-deep-obsidian">Comercializadora EL VECINO</span>
        <span class="hidden sm:inline">&middot;</span>
        <span>&copy; ${currentYear} Todos los derechos reservados.</span>
      </div>
      <div class="flex items-center gap-4 text-gray-500">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Panel Operativo</span>
        </span>
        <a 
          href="../index.html" 
          target="_blank" 
          class="font-semibold text-electric-blue hover:underline flex items-center gap-1 transition"
        >
          <span>Ir a la Tienda</span>
          <span class="material-symbols-outlined text-xs">open_in_new</span>
        </a>
      </div>
    </footer>
  `;
}

