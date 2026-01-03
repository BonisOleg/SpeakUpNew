'use strict';

import { observe } from './global-observer.js';

/**
 * Counter Animation - анімація лічильників для досягнень
 * Використовує JavaScript анімацію для надійності та контролю фінального значення
 */

const MAX_CONCURRENT_ANIMATIONS = 3;
let activeAnimations = 0;
const animationQueue = [];

// Fallback для requestIdleCallback
const requestIdleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

/**
 * Форматує число з пробілами для тысяч (без передніх нулів)
 */
function formatNumber(num) {
  // Для 200000: "200 000"
  if (num === 200000) {
    return '200 000';
  }

  // Для 500000: "500 000"
  if (num === 500000) {
    return '500 000';
  }

  if (num >= 100000) {
    // Для чисел >= 100000: 200 000
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (remainder === 0) {
      return `${thousands} 000`;
    }
    // Використовуємо padStart тільки якщо remainder < 100, інакше просто число
    return `${thousands} ${String(remainder).padStart(3, '0')}`;
  } else if (num >= 1000) {
    // Для чисел >= 1000: 5 000
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (remainder === 0) {
      return `${thousands} 000`;
    }
    // Використовуємо padStart тільки якщо remainder < 100, інакше просто число
    return `${thousands} ${String(remainder).padStart(3, '0')}`;
  }
  // Для чисел < 1000 просто повертаємо число без передніх нулів
  return String(num);
}

function animateCounter(element, target, suffix = '', duration = 2000) {
  const start = 0;
  const startTime = performance.now();
  let animationFrameId;
  let isActive = true;

  function update(currentTime) {
    if (!isActive) return;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing: easeOutQuart
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * easeOutQuart);

    element.textContent = formatNumber(current) + suffix;

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(update);
    } else {
      // Фінальне значення гарантовано встановлюється
      element.textContent = formatNumber(target) + suffix;
      activeAnimations--;
      processQueue();

      // Видалити клас animating після завершення анімації
      const card = element.closest('.achievement-card');
      if (card) {
        card.classList.remove('animating');
      }
    }
  }

  activeAnimations++;
  animationFrameId = requestAnimationFrame(update);

  return () => {
    isActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    activeAnimations--;
    processQueue();
  };
}

function processQueue() {
  if (activeAnimations >= MAX_CONCURRENT_ANIMATIONS || animationQueue.length === 0) {
    return;
  }

  const next = animationQueue.shift();
  if (next) {
    requestIdleCallback(() => {
      const { element, target, suffix } = next;
      animateCounter(element, target, suffix);
    });
  }
}

function startAnimation(card, numberElement, targetNumber, suffix) {
  if (card.dataset.animated) return;

  card.dataset.animated = 'true';

  // Завжди використовуємо JS анімацію для надійності
  // Встановлюємо початкове значення 0
  numberElement.textContent = formatNumber(0) + suffix;

  // Додаємо клас для CSS анімації (якщо потрібно для візуальних ефектів)
  card.classList.add('animating');

  if (activeAnimations >= MAX_CONCURRENT_ANIMATIONS) {
    animationQueue.push({ element: numberElement, target: targetNumber, suffix });
  } else {
    requestIdleCallback(() => {
      animateCounter(numberElement, targetNumber, suffix);
    });
  }
}

function initAchievements() {
  const achievementCards = document.querySelectorAll('.achievement-card');

  achievementCards.forEach(card => {
    const numberElement = card.querySelector('.achievement-card__number');
    if (!numberElement) return;

    const targetNumber = parseInt(card.dataset.achievementNumber, 10);
    const suffix = numberElement.dataset.achievementSuffix || '';

    // Перевірка чи елемент вже в viewport (fallback)
    const rect = card.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport && !card.dataset.animated) {
      // Якщо елемент вже видимий, запустити анімацію одразу
      startAnimation(card, numberElement, targetNumber, suffix);
    } else {
      // Спостереження через global-observer для елементів поза viewport
      observe(card, (entry) => {
        if (entry.isIntersecting && !card.dataset.animated) {
          startAnimation(card, numberElement, targetNumber, suffix);
        }
      });
    }
  });
}

// Ініціалізація для модулів з defer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAchievements);
} else {
  // DOM вже готовий (для модулів з defer)
  initAchievements();
}

export default { initAchievements };

