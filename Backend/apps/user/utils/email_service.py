from django.core.mail import EmailMultiAlternatives
from smtplib import SMTPAuthenticationError
from django.template.loader import render_to_string
from django.conf import settings


class EmailDeliveryError(Exception):
    """Indica que el proveedor SMTP no aceptó o no pudo enviar el correo."""


def send_html_email(subject, to_email, template_name, context, from_email=None, text_content=None):
    """
    Envía un email usando una plantilla HTML y contexto.
    - subject: Asunto del email
    - to_email: Lista o string con el destinatario
    - template_name: Ruta de la plantilla HTML
    - context: Diccionario de contexto para la plantilla
    - from_email: Remitente
    """
    default_from = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'Catálogo El Vecino <contacto@catalogoelvecino.com>'
    from_email = from_email or default_from
    if from_email and '<' not in str(from_email):
        from_email = f"Catálogo El Vecino <{from_email}>"

    html_content = render_to_string(template_name, context)
    if not text_content:
        try:
            text_content = render_to_string(template_name.replace('.html', '.txt'), context)
        except Exception:
            import re
            text_content = re.sub('<[^<]+?>', '', html_content)

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email] if isinstance(to_email, str) else to_email)
    msg.attach_alternative(html_content, "text/html")
    try:
        msg.send()
    except SMTPAuthenticationError as exc:
        raise EmailDeliveryError(
            "El servidor de correo rechazó las credenciales SMTP configuradas."
        ) from exc
    except Exception as exc:
        raise EmailDeliveryError(
            "No fue posible conectar con el servidor de correo."
        ) from exc
