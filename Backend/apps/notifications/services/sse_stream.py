import json
import logging
import queue
import threading
from typing import Generator, Dict, Any

logger = logging.getLogger(__name__)

# Registro de colas de clientes activos conectados al streaming SSE
_connected_clients = set()
_clients_lock = threading.Lock()


def register_client() -> queue.Queue:
    """Registra una nueva conexión de cliente SSE y retorna su cola de eventos."""
    client_queue = queue.Queue(maxsize=100)
    with _clients_lock:
        _connected_clients.add(client_queue)
    logger.debug("[SSE] Nuevo cliente conectado. Clientes activos: %d", len(_connected_clients))
    return client_queue


def unregister_client(client_queue: queue.Queue):
    """Elimina una conexión de cliente SSE cerrada."""
    with _clients_lock:
        _connected_clients.discard(client_queue)
    logger.debug("[SSE] Cliente desconectado. Clientes restantes: %d", len(_connected_clients))


def broadcast_sse_event(event_name: str, data: Dict[str, Any]):
    """
    Difunde un evento en tiempo real a todos los navegadores/clientes conectados.
    No bloquea si una cola está llena (descarta el exceso para ese cliente).
    """
    message = f"event: {event_name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
    with _clients_lock:
        active_clients = list(_connected_clients)

    for client_queue in active_clients:
        try:
            client_queue.put_nowait(message)
        except queue.Full:
            logger.warning("[SSE] Cola de cliente llena, descartando evento para evitar bloqueo.")


def sse_event_generator(client_queue: queue.Queue) -> Generator[str, None, None]:
    """
    Generador que emite eventos hacia el cliente HTTP conectado.
    Envía 'keep-alive' periódicos cada 25 segundos para mantener viva la conexión TCP.
    """
    # Enviar handshake inicial
    yield f"event: connected\ndata: {json.dumps({'status': 'connected', 'message': 'Canal de notificaciones en vivo conectado'})}\n\n"

    try:
        while True:
            try:
                # Esperar hasta 25s por un nuevo mensaje
                message = client_queue.get(timeout=25)
                yield message
            except queue.Empty:
                # Keep-alive ping para evitar timeouts de proxies/navegadores
                yield ": keep-alive\n\n"
    except GeneratorExit:
        # El cliente cerró la pestaña o conexión HTTP
        unregister_client(client_queue)
    except Exception as e:
        logger.error("[SSE] Error en stream de cliente: %s", str(e))
        unregister_client(client_queue)
