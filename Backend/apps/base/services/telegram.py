import json
import logging
import urllib.request
import urllib.error
from typing import Optional, Tuple
from django.conf import settings

logger = logging.getLogger(__name__)


class BaseTelegramService:
    """
    Servicio base reutilizable y resiliente para la integración con la API de Telegram Bot.
    
    Características:
    - Desacoplado y sin hardcoding de credenciales (extraídas de settings / .env).
    - Timeout estricto de 5 segundos para prevenir bloqueos de hilo o cuellos de botella.
    - Manejo seguro de excepciones y logging detallado.
    - Formato HTML o Markdown compatible.
    """

    def __init__(self, bot_token: Optional[str] = None, default_chat_id: Optional[str] = None, timeout: float = 5.0):
        self.bot_token = bot_token or getattr(settings, 'TELEGRAM_BOT_TOKEN', '') or ''
        self.default_chat_id = default_chat_id or getattr(settings, 'TELEGRAM_ADMIN_CHAT_ID', '') or ''
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        """Verifica si el servicio tiene credenciales configuradas."""
        return bool(self.bot_token and self.default_chat_id)

    def send_message(
        self,
        text: str,
        chat_id: Optional[str] = None,
        parse_mode: str = 'HTML',
        disable_web_page_preview: bool = True
    ) -> Tuple[bool, str]:
        """
        Envía un mensaje de texto a través del Bot de Telegram.

        :param text: Mensaje formateado a enviar.
        :param chat_id: ID del chat destino (opcional, usa default_chat_id por defecto).
        :param parse_mode: Modo de parseo ('HTML' o 'MarkdownV2').
        :param disable_web_page_preview: Si es True, desactiva la vista previa de enlaces.
        :return: Tupla (éxito: bool, detalle: str).
        """
        target_chat_id = chat_id or self.default_chat_id

        if not self.bot_token:
            warning_msg = "Telegram Bot Token no está configurado en las variables de entorno."
            logger.warning("[BaseTelegramService] %s", warning_msg)
            return False, warning_msg

        if not target_chat_id:
            warning_msg = "No se especificó un chat_id ni existe TELEGRAM_ADMIN_CHAT_ID configurado."
            logger.warning("[BaseTelegramService] %s", warning_msg)
            return False, warning_msg

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        payload = {
            "chat_id": target_chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": disable_web_page_preview
        }

        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={'Content-Type': 'application/json'}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                status_code = response.getcode()
                response_data = json.loads(response.read().decode('utf-8'))

                if status_code == 200 and response_data.get('ok'):
                    logger.info("[BaseTelegramService] Mensaje enviado exitosamente a chat_id: %s", target_chat_id)
                    return True, "Mensaje enviado exitosamente"
                else:
                    err_msg = f"Telegram respondió con código {status_code}: {response_data}"
                    logger.error("[BaseTelegramService] %s", err_msg)
                    return False, err_msg

        except urllib.error.HTTPError as e:
            try:
                error_body = json.loads(e.read().decode('utf-8'))
                description = error_body.get('description', str(e))
            except Exception:
                description = str(e)
            err_msg = f"Error HTTP {e.code} al comunicarse con Telegram: {description}"
            logger.error("[BaseTelegramService] %s", err_msg)
            return False, err_msg

        except urllib.error.URLError as e:
            err_msg = f"Error de red o conexión al contactar a Telegram: {e.reason}"
            logger.error("[BaseTelegramService] %s", err_msg)
            return False, err_msg

        except TimeoutError:
            err_msg = f"Timeout ({self.timeout}s) agotado al contactar con la API de Telegram."
            logger.error("[BaseTelegramService] %s", err_msg)
            return False, err_msg

        except Exception as e:
            err_msg = f"Error inesperado al enviar mensaje de Telegram: {str(e)}"
            logger.exception("[BaseTelegramService] %s", err_msg)
            return False, err_msg
