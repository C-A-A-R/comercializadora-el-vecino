/**
 * Ubicación: components/ui/Badge.js
 * Descripción: Generador de badges atómicos con tokens de color para estados.
 */

export class Badge {
  /**
   * Genera HTML para un badge según el estado especificado.
   * @param {Object} options
   * @param {string} options.text - Texto del badge
   * @param {'success'|'danger'|'warning'|'accent'|'neutral'} [options.variant='neutral']
   * @returns {string} HTML renderizable
   */
  static render({ text, variant = 'neutral' }) {
    const variants = {
      success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      danger: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-amber-100 text-amber-800 border-amber-300',
      accent: 'bg-fuchsia-100 text-neon-magenta border-fuchsia-300',
      neutral: 'bg-slate-100 text-slate-700 border-slate-300'
    };

    const styleClass = variants[variant] || variants.neutral;

    return `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass}">
        ${text}
      </span>
    `;
  }
}