'use strict';

/**
 * Динамічна форма в хедері
 * Стани: initial (бігуча стрічка + кнопка на десктопі / тільки бігуча стрічка на мобільних) → expanded (форма) → success → initial
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

    // Працюємо на всіх пристроях (мобільних та десктопі)
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

    // Визначаємо, чи це мобільний пристрій
    this.isMobile = window.innerWidth <= 767;

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

    // Респонсивність: оновлюємо стан при зміні розміру
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 767;
      // Якщо змінився тип пристрою, оновити стан
      if (wasMobile !== this.isMobile && this.state === STATE.INITIAL) {
        this.setState(STATE.INITIAL);
      }
    });
  }

  bindEvents() {
    const handleExpand = () => {
      this.setState(STATE.EXPANDED);
    };

    // На десктопі - клік по кнопці "Детальніше"
    if (this.elements.expandBtn) {
      this.elements.expandBtn.addEventListener('click', handleExpand);
    }

    // На мобільних - клік по бігучій стрічці
    if (this.elements.runningLine) {
      // Завжди додаємо обробник, але перевіряємо isMobile всередині
      this.elements.runningLine.addEventListener('click', () => {
        if (this.isMobile) {
          handleExpand();
        }
      });
      // Touch для мобільних
      this.elements.runningLine.addEventListener('touchend', (e) => {
        if (this.isMobile) {
          e.preventDefault();
          handleExpand();
        }
      }, { passive: false });
    }

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
        // На десктопі показуємо бігучу стрічку + кнопку, на мобільних - тільки бігучу стрічку
        if (this.isMobile) {
          this.showElements([this.elements.runningLine]);
        } else {
          this.showElements([this.elements.runningLine, this.elements.expandBtn]);
        }
        this.clearForm();
        break;

      case STATE.EXPANDED:
        this.showElements([this.elements.form]);
        this.startInactivityTimer();
        // Додаткова перевірка для мобільних - переконатися, що форма видима
        if (this.elements.form) {
          this.elements.form.style.display = 'flex';
          this.elements.form.style.visibility = 'visible';
          this.elements.form.style.opacity = '1';
        }
        // Фокус на перше поле
        setTimeout(() => this.elements.nameField?.focus(), 100);
        break;

      case STATE.SUCCESS:
        // Показуємо бігучу стрічку та повідомлення успіху
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
          // Додатково для мобільних - переконатися, що форма видима
          el.style.visibility = 'visible';
          el.style.opacity = '1';
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

      // Нормалізувати телефон: видалити пробіли та залишити тільки +380XXXXXXXXX
      if (this.elements.phoneField) {
        const phoneValue = this.elements.phoneField.value.replace(/\s/g, ''); // Видалити всі пробіли
        formData.set('phone', phoneValue);
      }

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

    // Перевірка телефону: після видалення нецифрових символів має бути 12 цифр (+380XXXXXXXXX = 13 символів, але 12 цифр)
    const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
    if (!phone || phoneDigits.length < 12) {
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
  // Ініціалізувати якщо елемент існує (працює на всіх пристроях)
  if (document.querySelector('[data-header-dynamic]')) {
    new HeaderDynamicForm();
  }
}

