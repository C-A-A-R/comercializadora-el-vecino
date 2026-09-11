/**
 * loguin.js - Authentication portal controller with JWT token management
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const roleButtons = document.querySelectorAll('.login-role-btn');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const passwordIcon = document.getElementById('passwordToggleIcon');
  const btnDemoAdmin = document.getElementById('btnDemoAdmin');
  const btnDemoCliente = document.getElementById('btnDemoCliente');
  const submitBtn = document.getElementById('btnLoginSubmit');
  const sessionStatusBox = document.getElementById('sessionStatusBox');

  let selectedRole = 'admin';

  // Check if already authenticated
  if (window.AuthService && window.AuthService.isAuthenticated()) {
    const user = window.AuthService.getCurrentUser();
    if (sessionStatusBox) {
      sessionStatusBox.style.display = 'block';
      sessionStatusBox.innerHTML = `
        <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-white mb-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-cyan-400 font-bold uppercase">Sesión Activa</div>
              <div class="font-bold text-sm">${user?.name || 'Usuario'} (${user?.role || 'cliente'})</div>
            </div>
            <button id="btnLogoutActive" type="button" class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      `;

      const btnLogout = document.getElementById('btnLogoutActive');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          window.AuthService.logout();
          sessionStatusBox.style.display = 'none';
          if (window.Toast) window.Toast.info('Has cerrado sesión exitosamente.');
        });
      }
    }
  }

  // Role toggle
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.dataset.role;

      if (selectedRole === 'admin') {
        if (!emailInput.value || emailInput.value === 'cliente@elvecino.com') {
          emailInput.value = 'admin@elvecino.com';
          passwordInput.value = 'admin123456';
        }
      } else {
        if (!emailInput.value || emailInput.value === 'admin@elvecino.com') {
          emailInput.value = 'cliente@elvecino.com';
          passwordInput.value = 'cliente123456';
        }
      }
    });
  });

  // Password visibility toggle
  if (btnTogglePassword && passwordInput && passwordIcon) {
    btnTogglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      passwordIcon.textContent = isPassword ? 'visibility_off' : 'visibility';
    });
  }

  // Fast Demo Login Admin
  if (btnDemoAdmin) {
    btnDemoAdmin.addEventListener('click', () => {
      emailInput.value = 'admin@elvecino.com';
      passwordInput.value = 'admin123456';
      roleButtons.forEach(b => b.classList.toggle('active', b.dataset.role === 'admin'));
      selectedRole = 'admin';
      performLogin('admin@elvecino.com', 'admin123456');
    });
  }

  // Fast Demo Login Cliente
  if (btnDemoCliente) {
    btnDemoCliente.addEventListener('click', () => {
      emailInput.value = 'cliente@elvecino.com';
      passwordInput.value = 'cliente123456';
      roleButtons.forEach(b => b.classList.toggle('active', b.dataset.role === 'cliente'));
      selectedRole = 'cliente';
      performLogin('cliente@elvecino.com', 'cliente123456');
    });
  }

  // Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      performLogin(email, password);
    });
  }

  async function performLogin(email, password) {
    if (!email || !password) {
      if (window.Toast) window.Toast.warning('Por favor completa todos los campos.');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          <span>Validando credenciales JWT...</span>
        `;
      }

      const result = await window.AuthService.login(email, password);

      if (window.Toast) {
        window.Toast.success(`¡Bienvenido ${result.user.name}! Token JWT generado.`, 'Acceso Autorizado');
      }

      // Check URL redirect param
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      setTimeout(() => {
        if (redirect === 'admin' || result.user.role === 'admin') {
          window.location.href = './index.html';
        } else {
          window.location.href = './index.html';
        }
      }, 800);

    } catch (error) {
      console.error('[loguin.js] Error durante login:', error);
      if (window.Toast) {
        window.Toast.error(error.message || 'Error de autenticación.', 'Credenciales Inválidas');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined text-[20px]">login</span>
          <span>Ingresar a la Plataforma</span>
        `;
      }
    }
  }
});
