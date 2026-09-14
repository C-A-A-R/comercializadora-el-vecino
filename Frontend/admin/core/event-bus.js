/**
 * Ubicación: core/event-bus.js
 * Descripción: Bus de eventos Pub/Sub desacoplado para comunicación entre módulos y layouts.
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Suscribe un callback a un evento especifico.
   * @param {string} eventName 
   * @param {Function} callback 
   * @returns {Function} Función para cancelar la suscripción
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    return () => this.off(eventName, callback);
  }

  /**
   * Remueve una suscripción.
   * @param {string} eventName 
   * @param {Function} callback 
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Emite un evento con datos asociados.
   * @param {string} eventName 
   * @param {any} data 
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();