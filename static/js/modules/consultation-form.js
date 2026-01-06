'use strict';

import { initPhoneMask, normalizePhone } from '../utils/form-helpers.js';

/**
 * Consultation Form - форма консультації з месенджерами
 * Кнопки месенджерів з'являються під чекбоксом при виборі "консультація в переписці"
 */
function initConsultationForm() {
  const formContainer = document.querySelector('.consultation-form');
  const form = formContainer?.querySelector('.consultation-form__form') || formContainer;
  if (!form) return;

  // Ініціалізувати маску телефону
  const phoneInput = form.querySelector('input[type="tel"]');
  if (phoneInput) {
    initPhoneMask(phoneInput);
  }

  const checkbox = form.querySelector('input[name="prefers_messenger"]');
  const messengerButtons = form.querySelector('.consultation-form__messenger-buttons');
  const messengerChoiceInputs = form.querySelectorAll('input[name="messenger_choice"]');

  if (!checkbox || !messengerButtons) return;

  // Обробка checkbox - показуємо/ховаємо кнопки месенджерів
  checkbox.addEventListener('change', function() {
    if (this.checked) {
      formContainer.classList.add('consultation-form--messenger-mode');

      // Показуємо вибір месенджера (якщо є)
      messengerChoiceInputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
          formGroup.classList.add('messenger-field');
        }
      });
    } else {
      formContainer.classList.remove('consultation-form--messenger-mode');

      // Ховаємо вибір месенджера (якщо є)
      messengerChoiceInputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
          formGroup.classList.remove('messenger-field');
        }
      });
    }
  });

  // Обробка кнопок месенджерів
  const messengerButtonsList = messengerButtons.querySelectorAll('.consultation-form__messenger-button');
  messengerButtonsList.forEach(button => {
    button.addEventListener('click', function() {
      const messenger = this.dataset.messenger;
      if (!messenger) return;

      // Встановлюємо вибраний месенджер
      messengerChoiceInputs.forEach(input => {
        if (input.value === messenger) {
          input.checked = true;
        }
      });

      // Формуємо URL для месенджера
      const phone = form.querySelector('input[name="phone"]')?.value || '380931707867';
      let url = '';

      switch (messenger) {
        case 'whatsapp':
          url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
          break;
        case 'instagram':
          url = 'https://www.instagram.com/speakup_ukraine/';
          break;
        case 'telegram':
          url = 'https://t.me/speakup_bot';
          break;
      }

      if (url) {
        // Відкриваємо у новій вкладці/додатку
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // Обробка відправки форми - нормалізувати телефон перед відправкою
  form.addEventListener('submit', function() {
    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
      const normalizedPhone = normalizePhone(phoneInput.value);
      phoneInput.value = normalizedPhone;
    }
  });
}

document.addEventListener('DOMContentLoaded', initConsultationForm);

export default { initConsultationForm };

