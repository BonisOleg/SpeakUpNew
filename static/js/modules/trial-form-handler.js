'use strict';

import { GTMEvents } from './gtm-events.js';

/**
 * Trial Form Handler - обробляє trial форми (header-desktop, header-mobile, hero)
 * НЕ торкається HTMX форм (consultation, testimonial)
 */
export class TrialFormHandler {
  constructor(form) {
    this.form = form;
    this.location = form.dataset.formLocation || 'unknown';
    this.isSubmitting = false;
    this.init();
  }

  init() {
    // Track form start при першому фокусі на будь-якому полі
    let tracked = false;
    this.form.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        if (!tracked) {
          GTMEvents.formStart('trial', this.location);
          tracked = true;
        }
      }, { once: true });
    });

    // Слухати custom event від phone handler
    this.form.addEventListener('phone:error-cleared', (e) => {
      console.log('[TrialFormHandler] Phone error cleared by PhoneInputHandler');
      // Нічого не робити — PhoneInputHandler вже все зробив
    });

    // Submit handler
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Захист від подвійної відправки
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;

    const submitBtn = this.form.querySelector('[type="submit"]');
    if (!submitBtn) {
      this.isSubmitting = false;
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Відправляється...';

    // GTM event
    GTMEvents.formSubmit('trial', this.location);

    try {
      // Нормалізувати номер телефону перед submit
      const phoneInput = this.form.querySelector('input[type="tel"]');
      if (phoneInput) {
        // Використати data-rawValue якщо є, інакше нормалізувати
        const rawValue = phoneInput.dataset.rawValue;
        if (rawValue) {
          phoneInput.value = rawValue;
        } else {
          // Нормалізувати вручну
          const value = phoneInput.value;
          const digits = value.replace(/\D/g, '').substring(2); // Видалити +38
          if (digits.length === 10 && digits[0] === '0') {
            phoneInput.value = '+380' + digits.substring(1);
          } else {
            phoneInput.value = '+38';
          }
        }
      }

      const formData = new FormData(this.form);
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');

      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken.value
        }
      });

      const data = await response.json();

      if (data.success) {
        GTMEvents.formSuccess('trial', this.location, data.lead_id || null);

        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else {
          this.showSuccess();
        }
      } else {
        GTMEvents.formError('trial', this.location, 'validation');
        this.showErrors(data.errors || {});
      }
    } catch (error) {
      console.error('[TrialFormHandler] Error:', error);
      GTMEvents.formError('trial', this.location, 'network');
      this.showErrors({'__all__': ['Помилка з\'єднання. Спробуйте ще раз.']});
    } finally {
      this.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  showSuccess() {
    // Для header форм - показати success message
    if (this.location === 'header-desktop' || this.location === 'header-mobile') {
      const successElement = document.querySelector('[data-header-success]');
      // Знайти батьківський div з data-header-dynamic-form
      const formContainer = this.form.closest('[data-header-dynamic-form]') ||
                           document.querySelector('[data-header-dynamic-form]');

      if (successElement && formContainer) {
        formContainer.classList.remove('header__dynamic-element--visible');
        successElement.classList.add('header__dynamic-element--visible');

        // Через 3 секунди повернути форму
        setTimeout(() => {
          successElement.classList.remove('header__dynamic-element--visible');
          formContainer.classList.add('header__dynamic-element--visible');
          this.form.reset();
        }, 3000);
      } else {
        // Fallback - просто показати повідомлення
        const message = document.createElement('div');
        message.className = 'message message--success';
        message.setAttribute('role', 'alert');
        message.innerHTML = `
          <div class="message__text">Дякуємо! Ми зв'яжемось з вами найближчим часом.</div>
          <button type="button" class="message__close" aria-label="Закрити">×</button>
        `;

        this.form.parentNode.insertBefore(message, this.form);
        this.form.reset();

        setTimeout(() => {
          message.remove();
        }, 5000);

        message.querySelector('.message__close')?.addEventListener('click', () => {
          message.remove();
        });
      }
    } else {
      // Для hero форми - просто показати повідомлення
      const message = document.createElement('div');
      message.className = 'message message--success';
      message.setAttribute('role', 'alert');
      message.innerHTML = `
        <div class="message__text">Дякуємо! Ми зв'яжемось з вами найближчим часом.</div>
        <button type="button" class="message__close" aria-label="Закрити">×</button>
      `;

      this.form.parentNode.insertBefore(message, this.form);
      this.form.reset();

      // Автоматично приховати через 5 секунд
      setTimeout(() => {
        message.remove();
      }, 5000);

      // Обробник закриття
      message.querySelector('.message__close')?.addEventListener('click', () => {
        message.remove();
      });
    }
  }

  showErrors(errors) {
    // Очистити попередні помилки
    this.form.querySelectorAll('.form-error').forEach(el => el.remove());
    this.form.querySelectorAll('.form-group__input').forEach(input => {
      input.classList.remove('field-error');
    });

    // Показати нові помилки
    Object.keys(errors).forEach(field => {
      const fieldName = field === '__all__' ? null : field;
      const errorMessages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];

      if (fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        if (input) {
          input.classList.add('field-error');
          const formGroup = input.closest('.form-group');
          if (formGroup) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'form-error';
            errorSpan.textContent = errorMessages[0];
            formGroup.appendChild(errorSpan);
          }
        }
      } else {
        // Загальні помилки
        const errorSpan = document.createElement('div');
        errorSpan.className = 'message message--error';
        errorSpan.setAttribute('role', 'alert');
        errorSpan.innerHTML = `
          <div class="message__text">${errorMessages[0]}</div>
          <button type="button" class="message__close" aria-label="Закрити">×</button>
        `;

        this.form.parentNode.insertBefore(errorSpan, this.form);

        errorSpan.querySelector('.message__close')?.addEventListener('click', () => {
          errorSpan.remove();
        });
      }
    });
  }
}

// Auto-init для всіх trial форм
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-form-type="trial"]').forEach(form => {
    new TrialFormHandler(form);
  });
});

