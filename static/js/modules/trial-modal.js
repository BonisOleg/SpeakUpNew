'use strict';

/**
 * Trial Modal - модальне вікно для запису на пробний урок
 * Обробляє відкриття/закриття модального вікна та доступність
 */
export function initTrialModal() {
  const trigger = document.querySelector('[data-trial-modal-trigger]');
  const mobileTrigger = document.querySelector('.trial-form__trigger--mobile');
  const modal = document.querySelector('.trial-form__modal');

  if (!modal) return;
  if (!trigger && !mobileTrigger) return;

  const closeBtn = modal.querySelector('.modal__close');
  const backdrop = modal.querySelector('.modal__backdrop');

  /**
   * Відкрити модальне вікно
   */
  const openModal = () => {
    modal.classList.add('modal--active');
    // Trap focus для доступності
    const focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      firstFocusable.focus();

      modal.addEventListener('keydown', handleTabKey);

      function handleTabKey(e) {
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
      }
    }
  };

  /**
   * Закрити модальне вікно
   */
  const closeModal = () => {
    modal.classList.remove('modal--active');
    trigger.focus(); // Повернути фокус на кнопку
  };

  /**
   * Обробник для Escape клавіші
   */
  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscapeKey);
    }
  };

  // Обробники подій для десктопної кнопки
  if (trigger) {
    trigger.addEventListener('click', () => {
      openModal();
      document.addEventListener('keydown', handleEscapeKey);
    });
  }

  // Обробники подій для мобільної кнопки
  if (mobileTrigger) {
    mobileTrigger.addEventListener('click', () => {
      openModal();
      document.addEventListener('keydown', handleEscapeKey);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal();
      document.removeEventListener('keydown', handleEscapeKey);
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeModal();
      document.removeEventListener('keydown', handleEscapeKey);
    });
  }
}

export default { initTrialModal };
