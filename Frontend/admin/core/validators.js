/**
 * Ubicación: core/validators.js
 * Descripción: Reglas de validación reutilizables para formularios.
 */

export const Validators = {
  required(value, fieldName = 'Este campo') {
    if (value === null || value === undefined || String(value).trim() === '') {
      return `${fieldName} es obligatorio.`;
    }
    return null;
  },

  number(value, fieldName = 'Este campo') {
    if (isNaN(Number(value))) {
      return `${fieldName} debe ser un número válido.`;
    }
    return null;
  },

  min(value, minValue, fieldName = 'Este campo') {
    if (Number(value) < minValue) {
      return `${fieldName} no puede ser menor a ${minValue}.`;
    }
    return null;
  },

  max(value, maxValue, fieldName = 'Este campo') {
    if (Number(value) > maxValue) {
      return `${fieldName} no puede superar a ${maxValue}.`;
    }
    return null;
  },

  hexColor(value) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (value && !hexRegex.test(value)) {
      return 'Formato de color hexadecimal inválido (ej: #FF00A8).';
    }
    return null;
  },

  dateRange(startDate, endDate) {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
    }
    return null;
  }
};