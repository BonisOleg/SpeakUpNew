/**
 * Form Helpers - Централізовані утиліти для роботи з формами
 * Використовується у trial-form.js, header-dynamic-form.js та інших модулях
 *
 * Уникає дублювання коду та забезпечує консистентність
 */

/**
 * Ініціалізація маски телефону (єдина реалізація)
 * Приймає вхідне число та форматує його як український номер
 * Формат: +380 XX XXX XX XX
 * Обмежує введення до 9 цифр після префіксу +380
 * Зберігає позицію курсора при форматуванні
 *
 * @param {HTMLInputElement} input - input елемент з type="tel"
 */
export function initPhoneMask(input) {
  if (!input || input.type !== 'tel') return;

  // Перевірити, чи маска вже ініціалізована (щоб уникнути подвійної ініціалізації)
  if (input.dataset.phoneMaskInitialized === 'true') return;
  input.dataset.phoneMaskInitialized = 'true';

  /**
   * Витягти тільки цифри з номера та нормалізувати префікс
   * @param {string} value - вхідне значення
   * @returns {string} - тільки цифри номера (без префіксу 380/80/0)
   */
  function extractDigits(value) {
    // Видалити всі нецифрові символи
    let digits = value.replace(/\D/g, '');

    // Видалити префікс країни, якщо користувач ввів його
    // Перевіряємо в порядку від найдовшого до найкоротшого префіксу
    if (digits.length >= 3 && digits.startsWith('380')) {
      digits = digits.substring(3);
    } else if (digits.length >= 2 && digits.startsWith('80')) {
      digits = digits.substring(2);
    } else if (digits.length >= 1 && digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    // Обмежити до 9 цифр
    if (digits.length > 9) {
      digits = digits.substring(0, 9);
    }

    return digits;
  }

  /**
   * Відформатувати номер у формат +380 XX XXX XX XX
   * @param {string} digits - тільки цифри (до 9 символів)
   * @returns {string} - відформатований номер
   */
  function formatPhone(digits) {
    if (!digits || digits.length === 0) {
      return '+380 ';
    }

    const parts = [];
    if (digits.length > 0) parts.push(digits.substring(0, 2));
    if (digits.length > 2) parts.push(digits.substring(2, 5));
    if (digits.length > 5) parts.push(digits.substring(5, 7));
    if (digits.length > 7) parts.push(digits.substring(7, 9));

    return `+380 ${parts.join(' ')}`;
  }

  /**
   * Обчислити нову позицію курсора після форматування
   * @param {number} oldCursorPos - стара позиція курсора
   * @param {string} oldValue - старе значення
   * @param {string} newValue - нове значення
   * @returns {number} - нова позиція курсора
   */
  function calculateNewCursorPosition(oldCursorPos, oldValue, newValue) {
    // Якщо поле порожнє або містить тільки префікс, курсор в кінці
    if (!oldValue || oldValue.trim() === '+380' || oldValue === '+380 ') {
      return newValue.length;
    }

    // Підрахувати кількість цифр до позиції курсора в старому значенні
    const digitsBeforeCursor = oldValue.substring(0, oldCursorPos).replace(/\D/g, '').length;

    // Якщо немає цифр до курсора, курсор після префіксу
    if (digitsBeforeCursor === 0) {
      return 5; // Після "+380 "
    }

    // Знайти позицію в новому значенні, де закінчуються ці цифри
    let newPos = 5; // Початок після "+380 "
    let digitCount = 0;

    for (let i = 5; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        digitCount++;
        if (digitCount === digitsBeforeCursor) {
          // Знайдено позицію після останньої цифри до курсора
          newPos = i + 1;
          break;
        }
      }
    }

    // Якщо всі цифри введені або курсор був в кінці, курсор в кінці
    if (digitCount >= 9 || oldCursorPos >= oldValue.length) {
      return newValue.length;
    }

    return newPos;
  }

  /**
   * Обробити введення та відформатувати номер
   * @param {Event} e - подія input
   */
  function handleInput(e) {
    const input = e.target;
    const oldValue = input.value;
    const oldCursorPos = input.selectionStart || 0;

    // Витягти цифри
    const digits = extractDigits(oldValue);

    // Відформатувати
    const newValue = formatPhone(digits);

    // Оновити значення тільки якщо воно змінилося
    if (oldValue !== newValue) {
      input.value = newValue;

      // Відновити позицію курсора
      const newCursorPos = calculateNewCursorPosition(oldCursorPos, oldValue, newValue);

      // Використати requestAnimationFrame для надійного встановлення курсора
      requestAnimationFrame(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
      });
    }
  }

  /**
   * Обробити натискання клавіші (для Backspace/Delete)
   * @param {KeyboardEvent} e - подія keydown
   */
  function handleKeyDown(e) {
    const input = e.target;
    const cursorPos = input.selectionStart || 0;
    const value = input.value;

    // Дозволити стандартну обробку для спеціальних клавіш
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Tab', 'Escape'
    ];

    if (allowedKeys.includes(e.key)) {
      // Для Backspace/Delete на позиції після пробілу - перемістити курсор
      if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos > 0) {
        // Якщо курсор на пробілі або після пробілу, перемістити його
        if (value[cursorPos - 1] === ' ' && e.key === 'Backspace') {
          e.preventDefault();
          const newPos = cursorPos - 1;
          input.setSelectionRange(newPos, newPos);
          // Запустити обробку input для форматування
          setTimeout(() => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, 0);
        } else if (value[cursorPos] === ' ' && e.key === 'Delete') {
          e.preventDefault();
          const newPos = cursorPos + 1;
          input.setSelectionRange(newPos, newPos);
          // Запустити обробку input для форматування
          setTimeout(() => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, 0);
        }
      }
      return;
    }

    // Блокувати введення нецифрових символів (крім Ctrl/Cmd комбінацій)
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      const isDigit = /^\d$/.test(e.key);
      const isAllowedSpecial = ['+', '(', ')', '-', ' '].includes(e.key);

      if (!isDigit && !isAllowedSpecial) {
        e.preventDefault();
      }
    }
  }

  /**
   * Обробити вставку з буфера обміну
   * @param {ClipboardEvent} e - подія paste
   */
  function handlePaste(e) {
    e.preventDefault();

    const input = e.target;
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const cursorPos = input.selectionStart || 0;
    const value = input.value;

    // Вставити текст на позицію курсора
    const newValue = value.substring(0, cursorPos) + pastedText + value.substring(input.selectionEnd || cursorPos);

    // Витягти цифри та відформатувати
    const digits = extractDigits(newValue);
    const formatted = formatPhone(digits);

    input.value = formatted;

    // Встановити курсор в кінці
    requestAnimationFrame(() => {
      const newPos = formatted.length;
      input.setSelectionRange(newPos, newPos);
    });
  }

  // Додати обробники подій
  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeyDown);
  input.addEventListener('paste', handlePaste);

  // Ініціалізувати значення якщо поле вже має значення
  if (input.value) {
    const digits = extractDigits(input.value);
    const formatted = formatPhone(digits);
    if (input.value !== formatted) {
      input.value = formatted;
    }
  } else {
    // Встановити початкове значення "+380 " для порожнього поля
    input.value = '+380 ';
  }
}

/**
 * Валідація поля форми
 * Перевіряє обов'язковість, мінімальну довжину та custom pattern
 *
 * @param {HTMLInputElement} field - поле для валідації
 * @param {Object} rules - правила валідації
 * @param {boolean} rules.required - поле обов'язкове?
 * @param {number} rules.minLength - мінімальна довжина
 * @param {RegExp} rules.pattern - regex pattern для перевірки
 * @param {string} rules.message - повідомлення помилки для pattern
 * @returns {Array<string>} масив помилок (пусто якщо валідна)
 */
export function validateField(field, rules = {}) {
  const value = field.value.trim();
  const errors = [];

  // Перевірка обов'язковості
  if (rules.required && !value) {
    errors.push('Це поле обов\'язкове');
  }

  // Перевірка мінімальної довжини
  if (rules.minLength && value.length < rules.minLength && value.length > 0) {
    errors.push(`Мінімум ${rules.minLength} символів`);
  }

  // Перевірка pattern
  if (rules.pattern && value && !rules.pattern.test(value)) {
    errors.push(rules.message || 'Невірний формат');
  }

  return errors;
}

/**
 * Показати помилку поля з анімацією
 * Додає клас помилки, виводить повідомлення та запускає shake анімацію
 *
 * @param {HTMLInputElement} field - поле з помилкою
 * @param {string} message - текст помилки
 */
export function showFieldError(field, message) {
  const formGroup = field.closest('.form-group');
  if (!formGroup) return;

  // Видалити стару помилку
  const oldError = formGroup.querySelector('.form-error');
  if (oldError) oldError.remove();

  // Додати нову помилку
  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-error';
  errorDiv.textContent = message;
  formGroup.appendChild(errorDiv);

  // Запустити shake анімацію
  field.classList.add('field-error');
  setTimeout(() => field.classList.remove('field-error'), 400);
}

/**
 * Очистити помилки поля
 * Видаляє повідомлення помилки та класи помилки
 *
 * @param {HTMLInputElement} field - поле для очищення
 */
export function clearFieldError(field) {
  const formGroup = field.closest('.form-group');
  if (!formGroup) return;

  const error = formGroup.querySelector('.form-error');
  if (error) error.remove();

  field.classList.remove('field-error');
}

/**
 * Отримати значення форми як об'єкт
 * Удобно для відправки через AJAX
 *
 * @param {HTMLFormElement} form - форма
 * @returns {Object} об'єкт з полями форми
 */
export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      // Якщо ключ вже є, зробити масив
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }

  return data;
}

/**
 * Перевірити всю форму
 * Перевіряє всі поля з data-validate атрибутом
 *
 * @param {HTMLFormElement} form - форма
 * @param {Object} validationRules - об'єкт з правилами: { fieldName: { required: true, ... } }
 * @returns {boolean} чи форма валідна
 */
export function validateForm(form, validationRules = {}) {
  let isValid = true;
  const fields = form.querySelectorAll('[data-validate]');

  fields.forEach(field => {
    const fieldName = field.name;
    const rules = validationRules[fieldName] || {};
    const errors = validateField(field, rules);

    if (errors.length > 0) {
      showFieldError(field, errors[0]);
      isValid = false;
    } else {
      clearFieldError(field);
    }
  });

  return isValid;
}

/**
 * Відключити форму під час відправки
 * Також можна показати loader
 *
 * @param {HTMLFormElement} form - форма
 * @param {boolean} disabled - вимкнути чи ввімкнути
 */
export function toggleFormState(form, disabled = true) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;

  if (disabled) {
    button.disabled = true;
    button.classList.add('is-loading');
    button.dataset.originalText = button.textContent;
    button.textContent = 'Відправляю...';
  } else {
    button.disabled = false;
    button.classList.remove('is-loading');
    button.textContent = button.dataset.originalText || 'Відправити';
  }
}

/**
 * Reset форми та очистити всі помилки
 *
 * @param {HTMLFormElement} form - форма
 */
export function resetFormWithErrors(form) {
  form.reset();

  // Видалити всі помилки
  const errors = form.querySelectorAll('.form-error');
  errors.forEach(error => error.remove());

  // Видалити класи помилок
  const errorFields = form.querySelectorAll('.field-error');
  errorFields.forEach(field => field.classList.remove('field-error'));

  // Ввімкнути кнопку
  toggleFormState(form, false);
}

/**
 * Нормалізувати номер телефону до формату +380XXXXXXXXX
 * Видаляє всі пробіли, дужки, дефіси та інші символи
 *
 * @param {string} phoneValue - номер телефону для нормалізації
 * @returns {string} нормалізований номер телефону
 */
export function normalizePhone(phoneValue) {
  if (!phoneValue) return '';

  // Видалити всі пробіли, дужки, дефіси та інші нецифрові символи (крім +)
  let normalized = phoneValue.replace(/\s/g, '').replace(/[()-]/g, '');

  // Якщо є + на початку, залишити його
  const hasPlus = normalized.startsWith('+');
  if (hasPlus) {
    normalized = `+${normalized.substring(1).replace(/\D/g, '')}`;
  } else {
    normalized = normalized.replace(/\D/g, '');
  }

  return normalized;
}

