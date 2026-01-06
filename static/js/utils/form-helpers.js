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
 *
 * @param {HTMLInputElement} input - input елемент з type="tel"
 */
export function initPhoneMask(input) {
  if (!input || input.type !== 'tel') return;

  // Перевірити, чи маска вже ініціалізована (щоб уникнути подвійної ініціалізації)
  if (input.dataset.phoneMaskInitialized === 'true') return;
  input.dataset.phoneMaskInitialized = 'true';

  input.addEventListener('input', (e) => {
    // Отримати тільки цифри з введеного значення
    let value = e.target.value.replace(/\D/g, '');

    // Видаліти префікс країни, якщо користувач ввів його
    // Перевіряємо в порядку від найдовшого до найкоротшого префіксу
    // Важливо: перевіряємо спочатку найдовший префікс (380), потім коротші (80, 0)
    if (value.length >= 3 && value.startsWith('380')) {
      // Якщо починається з 380, видаляємо префікс (залишається номер без 380)
      value = value.substring(3);
    } else if (value.length >= 2 && value.startsWith('80')) {
      // Якщо починається з 80 (але не 380), видаляємо префікс
      value = value.substring(2);
    } else if (value.length >= 1 && value.startsWith('0')) {
      // Якщо починається з 0 (але не 80 або 380), видаляємо префікс
      value = value.substring(1);
    }

    // Обмежити до 9 цифр (український номер після +380)
    // Це гарантує, що користувач не зможе ввести більше 9 цифр після префіксу
    if (value.length > 9) {
      value = value.substring(0, 9);
    }

    // Побудувати маску: +380 XX XXX XX XX
    const parts = [];
    if (value.length > 0) parts.push(value.substring(0, 2));
    if (value.length > 2) parts.push(value.substring(2, 5));
    if (value.length > 5) parts.push(value.substring(5, 7));
    if (value.length > 7) parts.push(value.substring(7, 9));

    // Встановити значення з форматуванням
    // Завжди додаємо +380 на початку
    e.target.value = `+380 ${  parts.join(' ')}`;
  });
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

