'use strict';

/**
 * PhoneInputHandler - простий handler для phone inputs
 * - +38 завжди видно і неможливо видалити
 * - Приймає тільки цифри
 * - Обмеження до 10 цифр (0 + 9)
 */

class PhoneInputHandler {
  constructor(input) {
    this.input = input;
    this.prefix = '+38';
    this.maxDigits = 10; // 0 + 9 цифр
    this.init();
  }

  init() {
    // НЕ встановлювати +38 автоматично - тільки при введенні
    // Events
    this.input.addEventListener('focus', this.handleFocus.bind(this));
    this.input.addEventListener('click', this.handleClick.bind(this));
    this.input.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('paste', this.handlePaste.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
  }

  handleFocus(e) {
    // Очистити помилки
    this.clearErrors();

    // Якщо поле порожнє або не починається з +38, встановити +38
    if (!this.input.value || !this.input.value.startsWith('+38')) {
      this.input.value = this.prefix;
    }

    // Перемістити курсор після +38
    this.setCursorPosition();
  }

  handleBlur(e) {
    // При втраті фокусу якщо є значення, переконатися що +38 на місці
    if (this.input.value && this.input.value.length > 0 && !this.input.value.startsWith('+38')) {
      // Якщо є цифри, додати +38
      const digits = this.input.value.replace(/\D/g, '');
      if (digits.length > 0) {
        this.input.value = this.prefix + digits.substring(digits.startsWith('38') ? 2 : 0, this.maxDigits + 1);
      }
    }
  }

  clearErrors() {
    // Очистити клас помилки з input
    this.input.classList.remove('field-error', 'error');
    this.input.removeAttribute('aria-invalid');

    // Видалити error span
    const formGroup = this.input.closest('.form-group');
    if (formGroup) {
      const errorSpan = formGroup.querySelector('.form-error');
      if (errorSpan) {
        errorSpan.remove();
      }
    }

    // Dispatch custom event
    this.input.dispatchEvent(new CustomEvent('phone:error-cleared', {
      bubbles: true,
      detail: { input: this.input }
    }));
  }

  handleClick(e) {
    // Якщо клік на префікс — перемістити курсор
    this.setCursorPosition();
  }

  handleBeforeInput(e) {
    // Перехопити події перед введенням
    const pos = this.input.selectionStart;
    const endPos = this.input.selectionEnd;
    const value = this.input.value;

    // Якщо поле порожнє, дозволити введення
    if (!value || value.length === 0) {
      return;
    }

    // Заборонити видалення +38 (якщо воно є)
    if (value.startsWith('+38')) {
      if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
        if (pos <= 3 || (pos < 3 && endPos > 3)) {
          e.preventDefault();
          return;
        }
      }

      // Заборонити вставку/введення на позиції перед +38
      if (pos < 3) {
        e.preventDefault();
        this.setCursorPosition();
        return;
      }
    }
  }

  handleKeydown(e) {
    const pos = this.input.selectionStart;
    const endPos = this.input.selectionEnd;
    const value = this.input.value;

    // Якщо поле порожнє, дозволити все
    if (!value || value.length === 0) {
      return;
    }

    // Заборонити видалення +38 (якщо воно є)
    if (value.startsWith('+38')) {
      if (e.key === 'Backspace') {
        if (pos <= 3 || (pos <= 3 && endPos > 3)) {
          e.preventDefault();
          this.setCursorPosition();
          return;
        }
      }

      if (e.key === 'Delete') {
        if (pos < 3 || (pos < 3 && endPos > 3)) {
          e.preventDefault();
          this.setCursorPosition();
          return;
        }
      }

      // Arrow Left — не дозволити вийти за межи префіксу
      if (e.key === 'ArrowLeft' && pos <= 3) {
        e.preventDefault();
        this.setCursorPosition();
        return;
      }

      // Home — переміщує на початок після +38
      if (e.key === 'Home') {
        e.preventDefault();
        this.setCursorPosition();
        return;
      }
    }
  }

  handleInput(e) {
    // Очистити помилки при введенні
    this.clearErrors();

    let value = this.input.value;

    // Якщо поле порожнє, дозволити введення
    if (!value || value.length === 0) {
      return;
    }

    // Видалити все крім цифр та +
    let cleaned = value.replace(/[^\d+]/g, '');

    // Якщо користувач почав вводити цифри без +38, додати +38
    if (!cleaned.startsWith('+38')) {
      // Якщо є тільки цифри, додати +38
      if (cleaned.length > 0 && /^\d+$/.test(cleaned)) {
        cleaned = this.prefix + cleaned;
      } else {
        // Якщо є щось інше, встановити +38
        cleaned = this.prefix;
      }
    }

    // Якщо довжина менше 3 символів (+38), встановити мінімум +38
    if (cleaned.length < 3) {
      cleaned = this.prefix;
    }

    // Витягти цифри після +38
    let digits = cleaned.substring(3);

    // ВАЖЛИВА ПЕРЕВІРКА: перша цифра має бути 0
    if (digits.length > 0 && digits[0] !== '0') {
      // Якщо перша цифра не 0, замінити на 0
      digits = '0' + digits.substring(1);
    }

    // ОБМЕЖИТИ ДО 10 ЦИФР (0 + 9)
    if (digits.length > this.maxDigits) {
      digits = digits.substring(0, this.maxDigits);
    }

    // Зібрати фінальне значення: +38 + цифри
    const finalValue = this.prefix + digits;

    // Оновити значення (БЕЗ форматування)
    this.input.value = finalValue;

    // Курсор в кінець
    this.input.setSelectionRange(finalValue.length, finalValue.length);
  }

  handlePaste(e) {
    e.preventDefault();

    // Очистити помилки при paste
    this.clearErrors();

    const pastedText = e.clipboardData.getData('text');
    // Видалити все крім цифр
    const digits = pastedText.replace(/\D/g, '');

    let normalized = this.prefix;

    // Нормалізувати вставлений текст
    // ПРІОРИТЕТ: формат 0XXXXXXXXX (10 цифр)
    if (digits.startsWith('0') && digits.length >= 10) {
      // 0XXXXXXXXX -> +380XXXXXXXXX (видаляємо 0, додаємо +380)
      normalized = '+380' + digits.substring(1, 10);
    } else if (digits.startsWith('380') && digits.length >= 12) {
      // 380XXXXXXXXX -> +380XXXXXXXXX
      normalized = '+380' + digits.substring(3, 12);
    } else if (digits.startsWith('38') && digits.length >= 11) {
      // 38XXXXXXXXX -> +380XXXXXXXXX
      normalized = '+380' + digits.substring(2, 11);
    } else if (digits.length > 0) {
      // Часткове введення
      const cleanDigits = digits.substring(digits.startsWith('38') ? 2 : 0);
      if (cleanDigits.length > 0) {
        // Переконатися що перша цифра = 0
        const firstDigit = cleanDigits[0] === '0' ? cleanDigits : '0' + cleanDigits;
        normalized = this.prefix + firstDigit.substring(0, this.maxDigits);
      }
    }

    this.input.value = normalized;
    this.input.setSelectionRange(normalized.length, normalized.length);

    // Trigger input event
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  setCursorPosition() {
    // Курсор після префіксу (якщо +38 є)
    if (this.input.value && this.input.value.startsWith('+38')) {
      const pos = Math.max(this.prefix.length, this.input.selectionStart || this.prefix.length);
      this.input.setSelectionRange(pos, pos);
    }
  }
}

// Factory для ініціалізації всіх phone inputs
export function initPhoneInputs(root = document) {
  const inputs = root.querySelectorAll('input[type="tel"]');

  inputs.forEach(input => {
    // Уникнути подвійної ініціалізації
    if (input.dataset.phoneHandlerInit === 'true') {
      return;
    }

    new PhoneInputHandler(input);
    input.dataset.phoneHandlerInit = 'true';

    console.log('[PhoneInputHandler] Initialized for:', input.name || input.id || 'unnamed');
  });
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initPhoneInputs());
} else {
  initPhoneInputs();
}

export default PhoneInputHandler;
