'use strict';

import { initPhoneInputs } from './modules/phone-input-handler.js';

// ==========================================================================
// Main JavaScript - HTMX Integration + Cross-Platform Handlers
// ==========================================================================

// Rule 72: pageshow event для bfcache (Safari/Firefox)
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    console.log('[bfcache] Page restored from back-forward cache');

    // Оновити HTMX контент після відновлення з bfcache
    if (typeof htmx !== 'undefined') {
      htmx.trigger(document.body, 'pageRestored');
    }

    // Перезавантажити динамічний контент якщо потрібно
    const dynamicElements = document.querySelectorAll('[data-refresh-on-restore]');
    dynamicElements.forEach(element => {
      const url = element.getAttribute('data-refresh-url');
      if (url && typeof htmx !== 'undefined') {
        htmx.ajax('GET', url, {target: element, swap: 'innerHTML'});
      }
    });
  }
});

// ==========================================================================
// HTMX Integration
// ==========================================================================

if (typeof htmx !== 'undefined') {
  // Rule 85: CSRF Token для HTMX запитів
  document.body.addEventListener('htmx:configRequest', function (event) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
      event.detail.headers['X-CSRFToken'] = csrfToken.getAttribute('content');
    }
  });

  // Rule 86: Обробка помилок HTMX - responseError
  document.body.addEventListener('htmx:responseError', function (event) {
    console.error('[HTMX] Response error:', event.detail);

    const target = event.detail.target;
    if (target) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'message message--error';
      errorMsg.setAttribute('role', 'alert');
      errorMsg.innerHTML = `
        <div class="message__text">
          Помилка завантаження даних. Спробуйте ще раз.
        </div>
        <button type="button" class="message__close" aria-label="Закрити">×</button>
      `;

      target.insertBefore(errorMsg, target.firstChild);

      // Автоматично приховати через 5 секунд
      setTimeout(() => {
        errorMsg.remove();
      }, 5000);

      // Обробник закриття
      errorMsg.querySelector('.message__close')?.addEventListener('click', function() {
        errorMsg.remove();
      });
    }
  });

  // Rule 86: Обробка мережевих помилок - sendError
  document.body.addEventListener('htmx:sendError', function (event) {
    console.error('[HTMX] Network error:', event.detail);

    const target = event.detail.target;
    if (target) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'message message--error';
      errorMsg.setAttribute('role', 'alert');
      errorMsg.innerHTML = `
        <div class="message__text">
          Помилка з'єднання. Перевірте інтернет-підключення.
        </div>
        <button type="button" class="message__close" aria-label="Закрити">×</button>
      `;

      target.insertBefore(errorMsg, target.firstChild);

      errorMsg.querySelector('.message__close')?.addEventListener('click', function() {
        errorMsg.remove();
      });
    }
  });

  // Rule 87: Обробка після заміни контенту - afterSwap
  document.body.addEventListener('htmx:afterSwap', function (event) {
    const target = event.detail.target;

    // Додати автоматичне очищення помилок при focus на всіх полях
    target.querySelectorAll('.form-group__input').forEach(input => {
      input.addEventListener('focus', function() {
        this.classList.remove('field-error', 'error');
        this.removeAttribute('aria-invalid');
        const formGroup = this.closest('.form-group');
        if (formGroup) {
          const errorSpan = formGroup.querySelector('.form-error');
          if (errorSpan) errorSpan.remove();
        }
      });
    });

    // Реініціалізувати phone inputs після HTMX swap
    if (target.querySelector('input[type="tel"]')) {
      initPhoneInputs(target);
    }

    // Закриття модальних вікон
    if (target.classList.contains('modal')) {
      const closeBtn = target.querySelector('.modal__close');
      const backdrop = target.querySelector('.modal__backdrop');

      const closeModal = () => {
        target.classList.remove('modal--active');
        setTimeout(() => target.remove(), 300);
      };

      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }

      if (backdrop) {
        backdrop.addEventListener('click', closeModal);
      }

      // Rule 117: Trap focus в модальному вікні
      trapFocus(target);

      // Escape для закриття
      document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escapeHandler);
        }
      });
    }

  });

  // Rule 87: Обробка перед відправкою
  document.body.addEventListener('htmx:beforeRequest', function (event) {
    const target = event.detail.target;

    // Показати індикатор завантаження
    if (target.tagName === 'FORM') {
      const submitBtn = target.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Завантаження...';
      }
    }
  });

  // Відновити кнопку після завершення
  document.body.addEventListener('htmx:afterRequest', function (event) {
    const target = event.detail.target;

    if (target.tagName === 'FORM') {
      const submitBtn = target.querySelector('[type="submit"]');
      if (submitBtn && submitBtn.dataset.originalText) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText;
        delete submitBtn.dataset.originalText;
      }
    }
  });
}


// ==========================================================================
// Accessibility Helpers
// ==========================================================================

// Rule 118: Trap focus в модальному вікні
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  // Фокус на перший елемент
  firstFocusable.focus();

  element.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('[SpeakUp] Application initialized');

  // Ініціалізувати phone inputs
  initPhoneInputs();

  // Закриття повідомлень
  document.querySelectorAll('.message__close').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.message').remove();
    });
  });
});

// Rule 84: Sanitize user input (приклад)
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Export для тестування (якщо потрібно)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sanitizeHTML,
    trapFocus
  };
}





