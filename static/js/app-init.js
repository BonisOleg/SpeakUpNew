'use strict';

import { BurgerMenu } from './modules/burger-menu.js';
import { initRunningLine } from './modules/running-line.js';
import { initTrialForm } from './modules/trial-form.js';
import { initHeaderDynamicForm } from './modules/header-dynamic-form.js';
import { initTabSlider } from './shared/tab-slider.js';
import programsListModule from './modules/programs-list.js';
import { BaseAccordion } from './modules/base-accordion.js';
import { initPhoneMask } from './utils/form-helpers.js';

/**
 * Автоматично визначає активне посилання в навігації на основі поточного URL
 */
function setActiveNavigationLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.mobile-nav-container .header__link[data-nav-tab]');

  // Видаляємо активний клас з усіх посилань
  navLinks.forEach(link => {
    link.classList.remove('header__link--active');
  });

  // Нормалізуємо поточний шлях (прибираємо trailing slash, крім кореня)
  const normalizedCurrentPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

  // Знаходимо посилання, яке відповідає поточному шляху
  let activeLink = null;
  let bestMatch = null;

  navLinks.forEach(link => {
    try {
      const linkUrl = new URL(link.href, window.location.origin);
      const linkPath = linkUrl.pathname;
      const normalizedLinkPath = linkPath === '/' ? '/' : linkPath.replace(/\/$/, '');

      // Точна відповідність
      if (normalizedLinkPath === normalizedCurrentPath) {
        activeLink = link;
        return;
      }

      // Для головної сторінки - тільки точна відповідність
      if (normalizedLinkPath === '/') {
        return;
      }

      // Перевіряємо, чи поточний шлях починається з шляху посилання
      if (normalizedCurrentPath.startsWith(normalizedLinkPath + '/')) {
        // Вибираємо найдовший відповідний шлях
        if (!bestMatch || normalizedLinkPath.length > bestMatch.length) {
          bestMatch = { link, path: normalizedLinkPath };
        }
      }
    } catch (e) {
      console.warn('[Navigation] Помилка при обробці посилання:', link.href, e);
    }
  });

  // Встановлюємо активне посилання
  if (activeLink) {
    activeLink.classList.add('header__link--active');
  } else if (bestMatch) {
    bestMatch.link.classList.add('header__link--active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[SpeakUp] Initializing modules...');

  // CSS loader більше не потрібен - всі критичні CSS завантажуються синхронно
  // Не критичні CSS завантажуються через дочірні шаблони (extra_css block)

  // Спочатку встановлюємо активне посилання на основі поточного URL
  setActiveNavigationLink();

  new BurgerMenu();
  initRunningLine();
  initTrialForm();
  initHeaderDynamicForm();

  // Слайдер для нижнього меню навігації
  // Використовуємо селектор, який знаходить тільки нижнє меню (всередині .mobile-nav-container)
  initTabSlider('.mobile-nav-container .header__nav', {
    sliderAttr: 'data-nav-slider',
    tabAttr: 'data-nav-tab',
    activeClass: 'header__link--active',
    containerPadding: 0,
    widthReduction: 5,  // Візуальний відступ для всіх кнопок
    rightOffset: 10     // Додатковий відступ для останньої кнопки
  });

  // Програми - таб-навігація та акордеони (тільки на сторінці programs)
  if (document.querySelector('.programs-list-page')) {
    programsListModule.initProgramsList();
  }

  // Корпоративна сторінка - акордеони та форма
  if (document.querySelector('.corporate-program-page')) {
    // Ініціалізація акордеонів для корпоративної сторінки через BaseAccordion
    const corporateGrids = document.querySelectorAll('.corporate-program-page .programs-grid');
    corporateGrids.forEach(grid => {
      new BaseAccordion(grid, {
        closeOthers: false,
        animationDuration: 300
      });
    });

    // Ініціалізація маски телефону для corporate form
    const corporateForm = document.querySelector('.corporate-consultation__form form');
    if (corporateForm) {
      const phoneInput = corporateForm.querySelector('input[name="phone"]');
      if (phoneInput) {
        initPhoneMask(phoneInput);
      }

      // Нормалізувати телефон перед відправкою
      corporateForm.addEventListener('submit', function() {
        if (phoneInput) {
          // Видалити пробіли, дужки, дефіси
          const phoneValue = phoneInput.value.replace(/\s/g, '').replace(/\(|\)|-/g, '');
          phoneInput.value = phoneValue;
        }
      });
    }
  }

  // FAQ сторінка - ініціалізація акордеонів
  if (document.querySelector('.faq-page')) {
    console.log('[SpeakUp] Initializing FAQ accordion...');
    const accordionContainers = document.querySelectorAll('.faq-accordion[data-accordion-container]');

    if (accordionContainers.length > 0) {
      console.log(`[SpeakUp] Found ${accordionContainers.length} FAQ accordion container(s)`);
      accordionContainers.forEach(container => {
        new BaseAccordion(container, {
          closeOthers: true,
          animationDuration: 300
        });
      });
    } else {
      console.warn('[SpeakUp] No FAQ accordion containers found');
    }
  }
});

