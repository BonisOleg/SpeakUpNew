'use strict';

import { initPhoneMask, showFieldError, clearFieldError, normalizePhone } from '../utils/form-helpers.js';

export function initTrialForm() {
  const triggerMobile = document.querySelector('.trial-form__trigger--mobile');
  const modal = document.querySelector('.trial-form__modal');
  const formsDesktop = document.querySelectorAll('.trial-form--desktop');
  const formsMobile = document.querySelectorAll('[data-trial-form-mobile]');
  const formsHero = document.querySelectorAll('.trial-form--hero');

  // Відкриття модалу на мобільних:
  triggerMobile?.addEventListener('click', () => {
    modal?.classList.add('modal--active');

    // Закрити бургер-меню якщо відкрите:
    const burgerOverlay = document.querySelector('[data-burger-overlay]');
    if (burgerOverlay?.classList.contains('burger-menu__overlay--active')) {
      document.querySelector('[data-burger-toggle]')?.click();
    }
  });

  // Закриття модалу:
  modal?.querySelector('.modal__close')?.addEventListener('click', () => {
    modal.classList.remove('modal--active');
  });

  modal?.querySelector('.modal__backdrop')?.addEventListener('click', () => {
    modal.classList.remove('modal--active');
  });

  // Обробка submit для всіх форм:
  [...formsDesktop, ...formsMobile, ...formsHero].forEach(form => {
    form?.addEventListener('submit', handleSubmit);
  });

  // Маска телефону (використовуємо shared функцію):
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    initPhoneMask(input);
  });
}

function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('[type="submit"]');
  const nameInput = form.querySelector('input[name="name"]');
  const phoneInput = form.querySelector('input[name="phone"]');

  // Валідація перед відправкою
  let isValid = true;
  const errors = {};

  // Валідація імені
  const name = nameInput?.value.trim();
  if (!name || name.length < 2) {
    isValid = false;
    errors.name = "Ім'я має містити мінімум 2 символи";
    if (nameInput) {
      showFieldError(nameInput, errors.name);
      nameInput.focus();
    }
  } else {
    if (nameInput) clearFieldError(nameInput);
  }

  // Валідація телефону
  const phone = phoneInput?.value.trim();
  if (!phone) {
    isValid = false;
    errors.phone = "Введіть номер телефону";
    if (phoneInput) {
      showFieldError(phoneInput, errors.phone);
      if (!nameInput || (name && name.length >= 2)) {
        phoneInput.focus();
      }
    }
  } else {
    // Перевірка формату телефону (мінімум 9 цифр після +380)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || (phoneDigits.length === 12 && !phoneDigits.startsWith('380'))) {
      isValid = false;
      errors.phone = "Введіть коректний український номер телефону";
      if (phoneInput) {
        showFieldError(phoneInput, errors.phone);
        if (!nameInput || (name && name.length >= 2)) {
          phoneInput.focus();
        }
      }
    } else {
      if (phoneInput) clearFieldError(phoneInput);
    }
  }

  if (!isValid) {
    return;
  }

  // Нормалізувати телефон в input ПЕРЕД створенням FormData
  if (phoneInput) {
    const normalizedPhone = normalizePhone(phoneInput.value);
    phoneInput.value = normalizedPhone;
  }

  const formData = new FormData(form);

  // Додати UTM параметри:
  const urlParams = new URLSearchParams(window.location.search);
  formData.append('utm_source', urlParams.get('utm_source') || '');
  formData.append('utm_medium', urlParams.get('utm_medium') || '');
  formData.append('utm_campaign', urlParams.get('utm_campaign') || '');
  formData.append('utm_content', urlParams.get('utm_content') || '');
  formData.append('utm_term', urlParams.get('utm_term') || '');
  formData.append('fbclid', urlParams.get('fbclid') || '');
  formData.append('gclid', urlParams.get('gclid') || '');

  // CSRF token:
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (!csrfToken) {
    console.error('[TrialForm] CSRF token not found');
    showFormError(form, 'Помилка безпеки. Будь ласка, оновіть сторінку.');
    return;
  }

  // Додати CSRF token в FormData (Django очікує обидва варіанти: header та FormData)
  formData.append('csrfmiddlewaretoken', csrfToken);

  // Отримати URL з data-атрибуту форми або використати за замовчуванням
  const submitUrl = form.dataset.submitUrl || '/leads/api/trial-form/';

  // Діагностичне логування
  console.log('[TrialForm] Starting submission');
  console.log('[TrialForm] URL:', submitUrl);
  console.log('[TrialForm] CSRF token:', csrfToken ? 'present' : 'missing');
  console.log('[TrialForm] Form data:', {
    name: nameInput?.value,
    phone: phoneInput?.value
  });

  // Disabled кнопка:
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Відправляємо...';

  fetch(submitUrl, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken
    },
    body: formData
  })
  .then(response => {
    console.log('[TrialForm] Response status:', response.status, response.statusText);

    // Обробка CSRF помилки (403)
    if (response.status === 403) {
      console.error('[TrialForm] CSRF validation failed');
      throw new Error('CSRF_ERROR');
    }

    if (!response.ok) {
      // Спробувати отримати JSON з помилками
      return response.json().catch(() => {
        // Якщо не вдалося отримати JSON, повернути загальну помилку
        throw new Error(`Помилка сервера (${response.status})`);
      }).then(data => {
        console.error('[TrialForm] Server error:', data);
        throw new Error(data.errors || `Помилка сервера (${response.status})`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('[TrialForm] Response data:', data);
    if (data.success) {
      // Facebook Pixel:
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', { content_name: 'Trial Lesson Form' });
      }

      // Google Ads:
      if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL'
        });
      }

      // Редірект:
      window.location.href = data.redirect_url;
    } else {
      // Відобразити помилки валідації з сервера
      if (data.errors) {
        Object.keys(data.errors).forEach(fieldName => {
          const field = form.querySelector(`[name="${fieldName}"]`);
          if (field) {
            const errorMessage = Array.isArray(data.errors[fieldName])
              ? data.errors[fieldName][0]
              : data.errors[fieldName];
            showFieldError(field, errorMessage);
          }
        });
      } else {
        showFormError(form, 'Помилка відправки форми. Спробуйте ще раз.');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  })
  .catch(error => {
    console.error('[TrialForm] Fetch error:', error);
    console.error('[TrialForm] Error details:', {
      message: error.message,
      stack: error.stack
    });

    // Спеціальна обробка CSRF помилки
    if (error.message === 'CSRF_ERROR') {
      showFormError(form, 'Помилка безпеки. Будь ласка, оновіть сторінку та спробуйте ще раз.');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      showFormError(form, 'Помилка з\'єднання. Перевірте інтернет-з\'єднання та спробуйте ще раз.');
    } else if (error.message.includes('500')) {
      showFormError(form, 'Помилка сервера. Спробуйте пізніше або зв\'яжіться з нами безпосередньо.');
    } else {
      // Спробувати відобразити помилки валідації, якщо вони є
      try {
        const errorObj = JSON.parse(error.message);
        if (errorObj && typeof errorObj === 'object') {
          Object.keys(errorObj).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
              const errorMessage = Array.isArray(errorObj[fieldName])
                ? errorObj[fieldName][0]
                : errorObj[fieldName];
              showFieldError(field, errorMessage);
            }
          });
        } else {
          showFormError(form, error.message || 'Помилка відправки форми. Спробуйте ще раз.');
        }
      } catch {
        showFormError(form, error.message || 'Помилка відправки форми. Спробуйте ще раз.');
      }
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
}

function showFormError(form, message) {
  // Видалити старі загальні помилки
  const oldError = form.querySelector('.form-error-general');
  if (oldError) oldError.remove();

  // Додати нову загальну помилку
  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-error form-error-general';
  errorDiv.textContent = message;
  form.insertBefore(errorDiv, form.firstChild);
}

