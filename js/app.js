/* ============================================================
   WAYRA PERÚ — Interacciones del portal de acceso
   JavaScript puro · sin librerías · sin build
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const LIMA_TZ = 'America/Lima';

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Toasts ---------- */
  const toastHost = $('#toasts');
  function toast(message, kind) {
    if (!toastHost) return;
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast--' + kind : '');
    el.innerHTML = '<span class="toast__dot"></span><span></span>';
    el.lastElementChild.textContent = message;
    toastHost.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 600);
    }, 4200);
  }

  /* ---------- Reloj de Lima ---------- */
  const clockEl = $('#clock');
  const timeFmt = new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  const dateFmt = new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  function tickClock() {
    if (!clockEl) return;
    clockEl.textContent = timeFmt.format(new Date());
    clockEl.setAttribute('datetime', new Date().toISOString());
  }
  tickClock();
  setInterval(tickClock, 15000);

  /* ============================================================
     CARRUSEL DE PAISAJES
     ============================================================ */
  const slides = $$('.slide');
  const places = $$('.place');
  let slideIndex = 0;
  let slideTimer = null;

  function goToSlide(i) {
    if (!slides.length) return;
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === slideIndex));
    places.forEach((p, idx) => {
      const active = idx === slideIndex;
      p.classList.toggle('is-active', active);
      p.setAttribute('aria-selected', String(active));
    });
  }

  function restartAutoplay() {
    clearInterval(slideTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    slideTimer = setInterval(() => goToSlide(slideIndex + 1), 7000);
  }

  places.forEach((p, idx) => {
    p.addEventListener('click', () => { goToSlide(idx); restartAutoplay(); });
  });
  restartAutoplay();

  // Flechas del teclado sobre el selector de paisajes
  $('.places')?.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    goToSlide(slideIndex + (e.key === 'ArrowRight' ? 1 : -1));
    places[slideIndex]?.focus();
    restartAutoplay();
  });

  /* ============================================================
     PESTAÑAS
     ============================================================ */
  const tabs = $('#panel-login') ? $$('.tab') : [];
  const tabBar = $('.tabs');
  const panels = {
    login: $('#panel-login'),
    register: $('#panel-register'),
    twofa: $('#panel-2fa'),
    success: $('#panel-success')
  };

  function showTab(which) {
    const loginActive = which === 'login';
    tabs.forEach((t) => {
      const active = t.id === 'tab-' + (loginActive ? 'login' : 'register');
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    if (tabBar) tabBar.dataset.active = loginActive ? '0' : '1';
    panels.register.hidden = loginActive;
    panels.login.hidden = !loginActive;
    panels.register.classList.toggle('is-active', !loginActive);
    panels.login.classList.toggle('is-active', loginActive);
    const shown = loginActive ? panels.login : panels.register;
    const firstInput = $('input:not([type="checkbox"]), select', shown);
    if (firstInput) setTimeout(() => firstInput.focus({ preventScroll: true }), 120);
  }

  tabs.forEach((t) => {
    t.addEventListener('click', () => showTab(t.id === 'tab-login' ? 'login' : 'register'));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = t.id === 'tab-login' ? 'register' : 'login';
      showTab(next);
      $('#tab-' + next)?.focus();
    });
  });

  function showOnlyPanel(key) {
    Object.entries(panels).forEach(([name, el]) => {
      if (!el) return;
      const active = name === key;
      el.classList.toggle('is-active', active);
      if (active) { el.hidden = false; } else { el.hidden = true; }
    });
    const tabBarEl = $('.tabs');
    if (tabBarEl) tabBarEl.style.display = key === 'login' || key === 'register' ? '' : 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ============================================================
     MOSTRAR / OCULTAR CONTRASEÑA
     ============================================================ */
  $$('[data-toggle-pass]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePass);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
      input.focus({ preventScroll: true });
    });
  });

  /* ============================================================
     HELPERS DE VALIDACIÓN
     ============================================================ */
  const reEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  const reDNI = /^\d{8}$/;

  function fieldOf(input) { return input.closest('.field'); }

  function setError(input, message) {
    const field = fieldOf(input);
    if (!field) return;
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    input.setAttribute('aria-invalid', 'true');
    const err = $('.error', field);
    if (err) {
      err.textContent = message;
      err.hidden = false;
    }
  }

  function clearError(input) {
    const field = fieldOf(input);
    if (!field) return;
    field.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    const err = $('.error', field);
    if (err) { err.hidden = true; err.textContent = ''; }
  }

  function markValid(input) {
    const field = fieldOf(input);
    if (!field) return;
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    const err = $('.error', field);
    if (err) err.hidden = true;
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /* ============================================================
     BLOQ MAYÚS + VALIDACIÓN EN VIVO
     ============================================================ */
  const passInputs = [$('#login-pass'), $('#reg-pass')].filter(Boolean);
  const capsWarning = $('#caps-warning');

  passInputs.forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (typeof e.getModifierState !== 'function') return;
      const caps = e.getModifierState('CapsLock');
      if (capsWarning) capsWarning.hidden = !caps;
    });
    input.addEventListener('keyup', (e) => {
      if (typeof e.getModifierState !== 'function') return;
      if (capsWarning) capsWarning.hidden = !e.getModifierState('CapsLock');
    });
    input.addEventListener('blur', () => { if (capsWarning) capsWarning.hidden = true; });
  });

  $('#login-user')?.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 2) clearError(e.target);
  });
  $('#login-pass')?.addEventListener('input', (e) => {
    if (e.target.value.length) clearError(e.target);
  });
  $('#reg-email')?.addEventListener('input', (e) => {
    if (reEmail.test(e.target.value.trim())) markValid(e.target); else clearError(e.target);
  });

  /* ============================================================
     FORTALEZA DE CONTRASEÑA
     ============================================================ */
  const strengthEl = $('#strength');
  const strengthLabel = $('#strength-label');
  const STRENGTH_TEXT = ['', 'Muy débil · añade más caracteres', 'Débil · combina mayúsculas y números', 'Buena · añade un símbolo', 'Excelente · contraseña robusta'];

  function scorePassword(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^\w\s]/.test(pw)) score++;
    if (/^(1234|abcd|qwerty|password|peru)/i.test(pw)) score = Math.min(score, 1);
    return Math.min(score, 4);
  }

  $('#reg-pass')?.addEventListener('input', (e) => {
    const level = scorePassword(e.target.value);
    if (strengthEl) strengthEl.dataset.level = String(level);
    if (strengthLabel) {
      strengthLabel.textContent = level
        ? STRENGTH_TEXT[level]
        : 'Usa mayúsculas, números y símbolos.';
      strengthLabel.style.color = level >= 3 ? 'var(--jade)' : level ? 'var(--text-mute)' : '';
    }
    clearError(e.target);
  });

  /* ============================================================
     DNI: solo dígitos + formato de celular
     ============================================================ */
  const regDocType = $('#reg-doctype');
  const regDoc = $('#reg-doc');

  function syncDocInput() {
    if (!regDoc || !regDocType) return;
    if (regDocType.value === 'dni') {
      regDoc.maxLength = 8;
      regDoc.inputMode = 'numeric';
      regDoc.placeholder = '8 dígitos';
    } else if (regDocType.value === 'ce') {
      regDoc.maxLength = 12;
      regDoc.inputMode = 'text';
      regDoc.placeholder = 'N.º de carné';
    } else {
      regDoc.maxLength = 12;
      regDoc.inputMode = 'text';
      regDoc.placeholder = 'N.º de pasaporte';
    }
    regDoc.value = '';
    clearError(regDoc);
  }
  regDocType?.addEventListener('change', syncDocInput);
  regDoc?.addEventListener('input', (e) => {
    const el = e.target;
    if (regDocType?.value === 'dni') {
      el.value = el.value.replace(/\D/g, '').slice(0, 8);
    } else {
      el.value = el.value.replace(/[^\w-]/g, '').slice(0, 12).toUpperCase();
    }
    clearError(el);
  });

  const regCel = $('#reg-cel');
  regCel?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
    clearError(e.target);
  });

  /* ============================================================
     LOGIN
     ============================================================ */
  const formLogin = $('#form-login');
  const btnLogin = $('#btn-login');
  let currentUser = null;

  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = $('#login-user');
    const passInput = $('#login-pass');
    const userVal = userInput.value.trim();
    const passVal = passInput.value;

    let ok = true;
    clearError(userInput); clearError(passInput);

    if (!userVal) {
      setError(userInput, 'Ingresa tu correo electrónico o tu DNI.');
      ok = false;
    } else if (!reEmail.test(userVal) && !reDNI.test(userVal)) {
      setError(userInput, 'Usa un correo válido o un DNI de 8 dígitos.');
      ok = false;
    }

    if (!passVal) {
      setError(passInput, 'Ingresa tu contraseña.');
      ok = false;
    } else if (passVal.length < 8) {
      setError(passInput, 'La contraseña debe tener al menos 8 caracteres.');
      ok = false;
    }

    if (!ok) {
      shake($('.auth__inner'));
      const firstBad = $('.field.is-invalid input');
      firstBad?.focus();
      return;
    }

    btnLogin.classList.add('is-loading');
    btnLogin.disabled = true;
    btnLogin.querySelector('.btn__label').textContent = 'Verificando identidad…';

    await wait(1150);

    // Credenciales de demostración
    const isDemo = (reDNI.test(userVal) ? userVal === '71234567' : userVal.toLowerCase() === 'demo@wayra.pe') && passVal === 'Peru2026!';

    btnLogin.classList.remove('is-loading');
    btnLogin.disabled = false;
    btnLogin.querySelector('.btn__label').textContent = 'Ingresar de forma segura';

    if (!isDemo) {
      setError(passInput, 'Credenciales no reconocidas. Usa la cuenta de demostración.');
      shake($('#panel-login'));
      toast('No pudimos validar tus credenciales.', 'err');
      return;
    }

    currentUser = {
      name: 'María Fernanda',
      full: 'María Fernanda Quispe Rojas',
      email: 'demo@wayra.pe',
      doc: '71234567'
    };
    startTwoFactor(userVal.includes('@') ? maskEmail(userVal) : '+51 9•• ••• 57');
  });

  function maskEmail(email) {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const head = name.slice(0, 2);
    return head + '•'.repeat(Math.max(3, name.length - 2)) + '@' + domain;
  }

  $('#fill-demo')?.addEventListener('click', () => {
    const u = $('#login-user');
    const p = $('#login-pass');
    u.value = '71234567';
    p.value = 'Peru2026!';
    clearError(u); clearError(p);
    markValid(u);
    toast('Credenciales de demostración cargadas.', 'info');
    p.focus();
  });

  /* ============================================================
     REGISTRO
     ============================================================ */
  const formRegister = $('#form-register');
  const btnRegister = $('#btn-register');

  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const map = {
      nombres: $('#reg-nombres'),
      apellidos: $('#reg-apellidos'),
      documento: $('#reg-doc'),
      email: $('#reg-email'),
      celular: $('#reg-cel'),
      region: $('#reg-region'),
      pass2: $('#reg-pass')
    };
    Object.values(map).forEach(clearError);
    const terms = $('#reg-terms');
    const errTerms = $('#err-terms');
    if (errTerms) errTerms.hidden = true;

    let ok = true;
    const fail = (el, msg) => { setError(el, msg); ok = false; };

    if (map.nombres.value.trim().length < 2) fail(map.nombres, 'Ingresa tus nombres completos.');
    if (map.apellidos.value.trim().length < 2) fail(map.apellidos, 'Ingresa tus apellidos completos.');

    const dtype = regDocType.value;
    const docVal = map.documento.value.trim();
    if (dtype === 'dni') {
      if (!reDNI.test(docVal)) fail(map.documento, 'El DNI debe tener exactamente 8 dígitos.');
    } else if (docVal.length < 6) {
      fail(map.documento, 'Ingresa un número de documento válido.');
    }

    if (!reEmail.test(map.email.value.trim())) fail(map.email, 'Ingresa un correo electrónico válido.');

    if (!/^9\d{8}$/.test(map.celular.value.trim())) {
      fail(map.celular, 'El celular debe tener 9 dígitos y empezar con 9.');
    }

    if (!map.region.value) fail(map.region, 'Selecciona tu región de residencia.');

    if (map.pass2.value.length < 8) {
      fail(map.pass2, 'La contraseña debe tener al menos 8 caracteres.');
    } else if (scorePassword(map.pass2.value) < 2) {
      fail(map.pass2, 'Contraseña muy débil: añade mayúsculas y números.');
    }

    if (!terms.checked) {
      ok = false;
      if (errTerms) {
        errTerms.textContent = 'Debes aceptar los términos y la Ley N.º 29733 para continuar.';
        errTerms.hidden = false;
      }
      shake($('.check--terms'));
    }

    if (!ok) {
      shake($('#panel-register'));
      $('.field.is-invalid input, .field.is-invalid select')?.focus();
      toast('Revisa los campos marcados.', 'err');
      return;
    }

    btnRegister.classList.add('is-loading');
    btnRegister.disabled = true;
    btnRegister.querySelector('.btn__label').textContent = 'Creando identidad digital…';
    await wait(1500);

    currentUser = {
      name: map.nombres.value.trim().split(/\s+/)[0],
      full: `${map.nombres.value.trim()} ${map.apellidos.value.trim()}`,
      email: map.email.value.trim(),
      doc: map.documento.value.trim()
    };

    btnRegister.classList.remove('is-loading');
    btnRegister.disabled = false;
    btnRegister.querySelector('.btn__label').textContent = 'Crear mi cuenta';

    toast('Cuenta creada. Enviamos tu código de verificación.', 'info');
    startTwoFactor(maskEmail(currentUser.email));
  });

  /* ============================================================
     VERIFICACIÓN 2FA
     ============================================================ */
  const otpInputs = $$('#otp input');
  const otpTarget = $('#otp-target');
  const btnOtp = $('#btn-otp');
  const errOtp = $('#err-otp');
  const resendBtn = $('#resend-otp');
  let resendTimer = null;
  let resendLeft = 30;

  function startTwoFactor(target) {
    if (otpTarget) otpTarget.textContent = target || '•••••';
    otpInputs.forEach((i) => { i.value = ''; i.classList.remove('is-filled'); });
    if (errOtp) errOtp.hidden = true;
    showOnlyPanel('twofa');
    setTimeout(() => otpInputs[0]?.focus({ preventScroll: true }), 220);
    startResendCountdown();
    toast('Código enviado. Revisa tu dispositivo de confianza.', 'info');
  }

  function paintCooldown() {
    if (!resendBtn) return;
    resendBtn.disabled = true;
    resendBtn.innerHTML = 'Reenviar código en <span>' + Math.max(resendLeft, 0) + 's</span>';
    resendBtn.dataset.cooling = '1';
  }

  function startResendCountdown() {
    clearInterval(resendTimer);
    resendLeft = 30;
    paintCooldown();
    resendTimer = setInterval(() => {
      resendLeft -= 1;
      if (resendLeft <= 0) {
        clearInterval(resendTimer);
        if (!resendBtn) return;
        resendBtn.disabled = false;
        resendBtn.innerHTML = 'Reenviar código';
        delete resendBtn.dataset.cooling;
        return;
      }
      paintCooldown();
    }, 1000);
  }

  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      input.classList.toggle('is-filled', Boolean(input.value));
      if (errOtp) errOtp.hidden = true;
      if (input.value && idx < otpInputs.length - 1) otpInputs[idx + 1].focus();
      if (otpInputs.every((i) => i.value)) $('#form-2fa').requestSubmit();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        otpInputs[idx - 1].focus();
        otpInputs[idx - 1].value = '';
        otpInputs[idx - 1].classList.remove('is-filled');
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' && idx > 0) { otpInputs[idx - 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && idx < otpInputs.length - 1) { otpInputs[idx + 1].focus(); e.preventDefault(); }
      if (e.key === 'Enter') { e.preventDefault(); $('#form-2fa').requestSubmit(); }
    });

    input.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      if (!text) return;
      e.preventDefault();
      text.split('').forEach((ch, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = ch;
          otpInputs[i].classList.add('is-filled');
        }
      });
      const nextEmpty = otpInputs.find((i) => !i.value);
      (nextEmpty || otpInputs[otpInputs.length - 1]).focus();
      if (otpInputs.every((i) => i.value)) $('#form-2fa').requestSubmit();
    });
  });

  $('#form-2fa')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = otpInputs.map((i) => i.value).join('');
    if (code.length !== 6) {
      if (errOtp) {
        errOtp.textContent = 'Completa los 6 dígitos del código.';
        errOtp.hidden = false;
      }
      shake($('#otp'));
      otpInputs.find((i) => !i.value)?.focus();
      return;
    }

    btnOtp.classList.add('is-loading');
    btnOtp.disabled = true;
    btnOtp.querySelector('.btn__label').textContent = 'Validando código…';
    await wait(1100);

    btnOtp.classList.remove('is-loading');
    btnOtp.disabled = false;
    btnOtp.querySelector('.btn__label').textContent = 'Verificar y entrar';

    clearInterval(resendTimer);
    finishLogin();
  });

  resendBtn?.addEventListener('click', () => {
    if (resendBtn.disabled) return;
    otpInputs.forEach((i) => { i.value = ''; i.classList.remove('is-filled'); });
    if (errOtp) errOtp.hidden = true;
    startResendCountdown();
    otpInputs[0]?.focus({ preventScroll: true });
    toast('Nuevo código enviado a tu dispositivo.', 'info');
  });

  $('#back-login')?.addEventListener('click', () => {
    clearInterval(resendTimer);
    showOnlyPanel('login');
    showTab('login');
  });

  /* ============================================================
     ÉXITO
     ============================================================ */
  function deviceName() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone · Safari';
    if (/Android/.test(ua)) return 'Android · Chrome';
    if (/Mac OS X/.test(ua)) return 'Mac · Safari';
    if (/Windows/.test(ua)) return 'Windows · Navegador';
    if (/Linux/.test(ua)) return 'Linux · Navegador';
    return 'Este dispositivo';
  }

  function finishLogin() {
    const nameEl = $('#success-name');
    const timeEl = $('#session-time');
    const deviceEl = $('#session-device');
    const titleEl = $('#success-title');

    if (nameEl && currentUser) nameEl.textContent = currentUser.name;
    if (timeEl) timeEl.textContent = dateFmt.format(new Date()) + ' PET';
    if (deviceEl) deviceEl.textContent = deviceName();
    if (titleEl) titleEl.textContent = 'Acceso verificado';

    showOnlyPanel('success');
    const inner = $('.auth__inner');
    inner?.classList.remove('is-success-glow');
    void inner?.offsetWidth;
    toast('Sesión iniciada correctamente. Bienvenido.', 'ok');
  }

  $('#logout')?.addEventListener('click', () => {
    [panels.twofa, panels.success, panels.register].forEach((p) => p && (p.hidden = true));
    showOnlyPanel('login');
    showTab('login');
    const u = $('#login-user');
    const p = $('#login-pass');
    if (u) { u.value = ''; clearError(u); }
    if (p) { p.value = ''; clearError(p); }
    currentUser = null;
    toast('Cerraste sesión de forma segura.', 'info');
  });

  /* ============================================================
     MODAL: RECUPERAR CONTRASEÑA
     ============================================================ */
  const modal = $('#modal-recover');
  const recoverForm = $('#form-recover');
  const recoverOk = $('#recover-ok');
  let lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    if (recoverForm) recoverForm.hidden = false;
    if (recoverOk) recoverOk.hidden = true;
    const input = $('#recover-user');
    if (input) {
      input.value = $('#login-user')?.value.trim() || '';
      clearError(input);
      setTimeout(() => input.focus({ preventScroll: true }), 120);
    }
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    lastFocused?.focus({ preventScroll: true });
  }

  $('#open-recover')?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal || modal.hidden) return;
    const focusables = $$('button, input, a[href]', modal).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  recoverForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('#recover-user');
    const val = input.value.trim();
    clearError(input);

    if (!val || (!reEmail.test(val) && !/^\d{8}$/.test(val))) {
      setError(input, 'Ingresa un correo válido o tu DNI de 8 dígitos.');
      shake(recoverForm);
      return;
    }

    const btn = recoverForm.querySelector('[type="submit"]');
    btn.classList.add('is-loading');
    btn.disabled = true;
    await wait(1100);
    btn.classList.remove('is-loading');
    btn.disabled = false;

    $('#recover-dest').textContent = reEmail.test(val) ? val : '•••' + val.slice(-3) + ' (DNI)';
    recoverForm.hidden = true;
    recoverOk.hidden = false;
  });

  /* ============================================================
     OTRAS ACCIONES
     ============================================================ */
  $$('[data-sso]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toast('En este demo ' + btn.dataset.sso + ' aún no está habilitado. Usa la cuenta de demostración.', 'info');
    });
  });

  /* ============================================================
     MODO DEMO: cualquier clic en enlaces vacíos
     ============================================================ */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (!a) return;
    e.preventDefault();
  });
})();
