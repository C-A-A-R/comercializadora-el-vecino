/**
 * loguin.js - Authentication portal controller with JWT token management
 */

function initLogin() {
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
          emailInput.value = 'admin';
          passwordInput.value = 'admin';
        }
      } else {
        if (!emailInput.value || emailInput.value === 'admin' || emailInput.value === 'admin@elvecino.com') {
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

  // Fast Demo Login Admin (Django Backend User)
  if (btnDemoAdmin) {
    btnDemoAdmin.addEventListener('click', () => {
      emailInput.value = 'admin';
      passwordInput.value = 'admin';
      roleButtons.forEach(b => b.classList.toggle('active', b.dataset.role === 'admin'));
      selectedRole = 'admin';
      performLogin('admin', 'admin');
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
      if (e) e.preventDefault();
      const identifier = emailInput.value.trim();
      const password = passwordInput.value;
      performLogin(identifier, password);
    });
  }

  async function performLogin(identifier, password) {
    if (!identifier || !password) {
      if (window.Toast) window.Toast.warning('Por favor completa todos los campos.');
      return;
    }

    if (!window.AuthService) {
      console.error('[loguin.js] AuthService no está disponible.');
      if (window.Toast) window.Toast.error('Servicio de autenticación no inicializado.', 'Error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          <span>Validando credenciales en Backend...</span>
        `;
      }

      const result = await window.AuthService.login(identifier, password);

      const displayName = result.user.name || result.user.username || 'Usuario';
      if (window.Toast) {
        window.Toast.success(`¡Bienvenido ${displayName}! Token JWT obtenido.`, 'Acceso Autorizado');
      }

      // Check URL redirect param
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      const isStaffOrAdmin = result.user.role === 'admin' || result.user.role === 'ADMIN' || Boolean(result.user.is_staff) || Boolean(result.user.is_superuser);

      let targetUrl = './index.html';
      if (redirect === 'admin' || isStaffOrAdmin) {
        if (window.location.pathname.includes('/Frontend/')) {
          targetUrl = window.location.pathname.replace(/loguin\.html.*$/, 'admin/index.html');
        } else {
          targetUrl = './admin/index.html';
        }
      } else if (window.location.pathname.includes('/Frontend/')) {
        targetUrl = window.location.pathname.replace(/loguin\.html.*$/, 'index.html');
      }

      console.log('[loguin.js] Redireccionando a:', targetUrl);
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);

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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}
