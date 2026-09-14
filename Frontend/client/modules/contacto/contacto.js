/**
 * contacto.js - Contact & engineering advisory controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'contacto');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const form = document.getElementById('contactForm');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');

      const data = {
        name: document.getElementById('contactName')?.value || '',
        phone: document.getElementById('contactPhone')?.value || '',
        email: document.getElementById('contactEmail')?.value || '',
        serviceType: document.getElementById('contactServiceType')?.value || '',
        message: document.getElementById('contactMessage')?.value || ''
      };

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando solicitud...';
        }

        await window.ContactoApi.sendInquiry(data);

        if (window.Toast) {
          window.Toast.success('Solicitud enviada. Un ingeniero de guardia se comunicará contigo vía WhatsApp.', 'Consulta Registrada');
        }

        form.reset();
      } catch (error) {
        console.error('[contacto.js] Error enviando formulario:', error);
        if (window.Toast) {
          window.Toast.error('No se pudo enviar la consulta. Intenta nuevamente o contáctanos por WhatsApp.');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar Solicitud a Bodega Central';
        }
      }
    });
  }
});
