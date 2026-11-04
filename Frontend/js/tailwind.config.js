/**
 * tailwind.config.js - Configuración centralizada de Tailwind CSS para Comercializadora El Vecino
 * Permite mantener la paleta y extensiones temáticas en un solo archivo referenciable.
 */
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'deep-obsidian': '#0A0A0A',
          'electric-blue': '#0800FF',
          'neon-magenta': '#FF00A8',
          'neon-cyan': '#00F0FF',
          'slate-surface': '#F4F6FB',
          'slate-border': '#E2E6EE'
        }
      }
    }
  };
}
