// Precio ocultado en el admin – componente ahora devuelve una cadena vacía.
export function PriceDisplay() {
  return '';
}

PriceDisplay.prototype.render = function() {
  return '';
};

// Mantener la API para evitar errores en otras partes del código.
PriceDisplay.render = function() {
  return '';
};