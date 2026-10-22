/* Contact form (FormSubmit, AJAX). Same logic as the Easy Reach site. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const form = $('#quote-form');
  if (form) {
    const btn = $('#form-submit');
    const err = $('#form-error');
    const ok = $('#form-success');
    const fields = $('.form-fields', form);
    const showError = (msg) => { err.textContent = msg; err.classList.remove('hidden'); };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.classList.add('hidden');

      // Honeypot filled in = bot. Pretend success.
      if ($('[name="_honey"]', form).value) { fields.style.display = 'none'; ok.classList.add('show'); return; }

      // Basic validation
      const missing = $$('[required]', form).find((f) => !f.value.trim());
      if (missing) { missing.focus(); showError('Please fill in the fields marked with *'); return; }
      const email = $('[name="email"]', form);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.focus(); showError('That email address doesn’t look right. Could you check it?'); return; }

      btn.setAttribute('aria-busy', 'true');
      btn.disabled = true;
      try {
        // FormSubmit AJAX endpoint (same address as the form action)
        const url = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
        const res = await fetch(url, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === 'false' || data.success === false) throw new Error(data.message || 'Request failed');
        fields.style.display = 'none';
        ok.classList.add('show');
        ok.focus({ preventScroll: true });
        ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        form.reset();
      } catch (_) {
        showError('Sorry, something went wrong sending that. Please try again.');
      } finally {
        btn.removeAttribute('aria-busy');
        btn.disabled = false;
      }
    });
  }
})();
