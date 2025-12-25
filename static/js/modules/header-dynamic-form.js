'use strict';

/**
 * Динамічна форма в хедері
 * Стани: initial (бігуча стрічка + кнопка) → expanded (форма) → success → initial
 * Таймер бездіяльності: 10 секунд
 */

const STATE = {
  INITIAL: 'initial',
  EXPANDED: 'expanded',
  SUCCESS: 'success'
};

const CONFIG = {
  INACTIVITY_TIMEOUT: 10000, // 10 секунд
  SUCCESS_DISPLAY_TIME: 3000, // 3 секунди
  MIN_DESKTOP_WIDTH: 768, // Працює тільки на десктопі
  API_ENDPOINT: '/leads/api/trial-form/'
};

class HeaderDynamicForm {
  constructor() {
    this.container = document.querySelector('[data-header-dynamic]');
    if (!this.container) return;

    // Працюємо тільки на десктопі
    if (window.innerWidth < CONFIG.MIN_DESKTOP_WIDTH) return;

    this.state = STATE.INITIAL;
    this.inactivityTimer = null;

    this.elements = {
      runningLine: this.container.querySelector('[data-header-running-line]'),
      expandBtn: this.container.querySelector('[data-header-expand]'),
      form: this.container.querySelector('[data-header-dynamic-form]'),
      successMsg: this.container.querySelector('[data-header-success]'),
      nameField: this.container.querySelector('[data-header-field="name"]'),
      phoneField: this.container.querySelector('[data-header-field="phone"]'),
      submitBtn: this.container.querySelector('[data-header-submit]')
    };

    this.init();
  }

  init() {
    // Зберегти оригінальні placeholder'и
    if (this.elements.nameField && !this.elements.nameField.dataset.originalPlaceholder) {
      this.elements.nameField.dataset.originalPlaceholder = this.elements.nameField.placeholder || 'Ім\'я';
    }
    if (this.elements.phoneField && !this.elements.phoneField.dataset.originalPlaceholder) {
      this.elements.phoneField.dataset.originalPlaceholder = this.elements.phoneField.placeholder || '+380';
    }

    this.bindEvents();
    this.setState(STATE.INITIAL);

    // Респонсивність: вимкнути на мобільних
    window.addEventListener('resize', () => {
      if (window.innerWidth < CONFIG.MIN_DESKTOP_WIDTH) {
        this.destroy();
      }
    });
  }

  bindEvents() {
    // Клік на "Детальніше"
    this.elements.expandBtn?.addEventListener('click', () => {
      this.setState(STATE.EXPANDED);
    });

    // Submit форми
    this.elements.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleSubmit();
    });

    // Заборонити стандартну валідацію браузера
    this.elements.form?.addEventListener('invalid', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);

    // Скидання таймера при взаємодії
    [this.elements.nameField, this.elements.phoneField].forEach(field => {
      if (!field) return;
      field.addEventListener('input', () => this.resetInactivityTimer());
      field.addEventListener('focus', () => this.resetInactivityTimer());
    });
  }

  setState(newState) {
    this.state = newState;
    this.clearInactivityTimer();

    // Спочатку приховати всі динамічні елементи
    this.hideAllElements();

    switch (newState) {
      case STATE.INITIAL:
        this.showElements([this.elements.runningLine, this.elements.expandBtn]);
        this.clearForm();
        break;

      case STATE.EXPANDED:
        this.showElements([this.elements.form]);
        this.startInactivityTimer();
        // Фокус на перше поле
        setTimeout(() => this.elements.nameField?.focus(), 100);
        break;

      case STATE.SUCCESS:
        this.showElements([this.elements.runningLine, this.elements.successMsg]);
        setTimeout(() => this.setState(STATE.INITIAL), CONFIG.SUCCESS_DISPLAY_TIME);
        break;
    }
  }

  hideAllElements() {
    Object.values(this.elements).forEach(el => {
      if (el && el.classList.contains('header__dynamic-element')) {
        el.classList.remove('header__dynamic-element--visible');
      }
    });
  }

  showElements(elements) {
    elements.forEach(el => {
      if (el && el.classList.contains('header__dynamic-element')) {
        el.classList.add('header__dynamic-element--visible');
        // Відновити display для flex елементів
        if (el.tagName === 'FORM' || el.classList.contains('header__success')) {
          el.style.display = 'flex';
        } else {
          el.style.display = '';
        }
      }
    });
  }

  async handleSubmit() {
    const name = this.elements.nameField?.value.trim();
    const phone = this.elements.phoneField?.value.trim();

    // Валідація
    if (!this.validate(name, phone)) {
      return;
    }

    // Disable кнопки
    this.elements.submitBtn.disabled = true;
    const originalText = this.elements.submitBtn.textContent;
    this.elements.submitBtn.textContent = 'Відправляємо...';

    try {
      const formData = new FormData(this.elements.form);

      // UTM параметри
      const urlParams = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(param => {
        formData.append(param, urlParams.get(param) || '');
      });

      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Аналітика
        this.trackConversion();

        this.setState(STATE.SUCCESS);
      } else {
        this.showFieldError('phone', 'Помилка відправки');
      }
    } catch (error) {
      console.error('Header form error:', error);
      this.showFieldError('phone', 'Помилка з\'єднання');
    } finally {
      this.elements.submitBtn.disabled = false;
      this.elements.submitBtn.textContent = originalText;
    }
  }

  validate(name, phone) {
    let isValid = true;

    // Очистити попередні помилки
    this.clearFieldErrors();

    if (!name || name.length < 2) {
      this.showFieldError('name', 'Введіть ім\'я');
      isValid = false;
    }

    if (!phone || phone.replace(/\D/g, '').length < 12) {
      this.showFieldError('phone', 'Введіть номер телефону');
      isValid = false;
    }

    return isValid;
  }

  showFieldError(fieldName, message) {
    const field = this.elements[fieldName + 'Field'];
    if (!field) return;

    // Зберегти оригінальний placeholder, якщо ще не збережено
    if (!field.dataset.originalPlaceholder) {
      field.dataset.originalPlaceholder = field.placeholder || '';
    }

    // Приховати стандартні повідомлення про помилки валідації
    field.setCustomValidity('');

    field.classList.add('field-error');
    field.placeholder = message;
    field.value = '';

    // Видалити стандартні повідомлення про помилки під полем
    const formGroup = field.closest('.form-group');
    if (formGroup) {
      const existingError = formGroup.querySelector('.form-error');
      if (existingError) {
        existingError.remove();
      }
    }

    // Прибрати помилку при введенні
    const clearError = () => {
      field.classList.remove('field-error');
      field.placeholder = field.dataset.originalPlaceholder || '';
      field.removeEventListener('input', clearError);
    };

    field.addEventListener('input', clearError, { once: true });
  }

  clearFieldErrors() {
    [this.elements.nameField, this.elements.phoneField].forEach(field => {
      if (field) {
        field.classList.remove('field-error');
        field.setCustomValidity('');

        // Видалити стандартні повідомлення про помилки
        const formGroup = field.closest('.form-group');
        if (formGroup) {
          const existingError = formGroup.querySelector('.form-error');
          if (existingError) {
            existingError.remove();
          }
        }
      }
    });
  }

  clearForm() {
    if (this.elements.nameField) {
      this.elements.nameField.value = '';
      this.elements.nameField.placeholder = this.elements.nameField.dataset.originalPlaceholder || 'Ім\'я';
      this.elements.nameField.setCustomValidity('');
    }
    if (this.elements.phoneField) {
      this.elements.phoneField.value = '';
      this.elements.phoneField.placeholder = this.elements.phoneField.dataset.originalPlaceholder || '+380';
      this.elements.phoneField.setCustomValidity('');
    }
    this.clearFieldErrors();
  }

  startInactivityTimer() {
    this.clearInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      if (this.state === STATE.EXPANDED) {
        this.setState(STATE.INITIAL);
      }
    }, CONFIG.INACTIVITY_TIMEOUT);
  }

  resetInactivityTimer() {
    if (this.state === STATE.EXPANDED) {
      this.startInactivityTimer();
    }
  }

  clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  trackConversion() {
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', { content_name: 'Header Dynamic Form' });
    }

    // Google Ads
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
        'event_callback': () => console.log('Conversion tracked')
      });
    }
  }

  destroy() {
    this.clearInactivityTimer();
    // Повернутись до початкового стану
    this.setState(STATE.INITIAL);
  }
}

// Експорт
export function initHeaderDynamicForm() {
  // Ініціалізувати тільки якщо елемент існує та десктоп
  if (document.querySelector('[data-header-dynamic]') && window.innerWidth >= CONFIG.MIN_DESKTOP_WIDTH) {
    new HeaderDynamicForm();
  }
}

