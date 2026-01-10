'use strict';

/**
 * Global Resize Observer - один debounced resize listener для всіх модулів
 * Оптимізація: батчинг callbacks через requestAnimationFrame
 */
const callbacks = new Map();
let resizeTimeout;
let rafId;

function handleResize() {
  rafId = requestAnimationFrame(() => {
    callbacks.forEach((callback, key) => {
      try {
        callback();
      } catch (error) {
        console.error(`[ResizeObserver] Error in callback ${key}:`, error);
      }
    });
  });
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  resizeTimeout = setTimeout(handleResize, 150);
}, { passive: true });

/**
 * Реєструє callback для resize event
 * @param {string} key - Унікальний ключ для callback
 * @param {Function} callback - Функція для виклику при resize
 */
export function onResize(key, callback) {
  if (!key || typeof callback !== 'function') {
    console.warn('[ResizeObserver] Invalid key or callback');
    return;
  }
  callbacks.set(key, callback);
}

/**
 * Видаляє callback з resize listeners
 * @param {string} key - Ключ callback
 */
export function offResize(key) {
  callbacks.delete(key);
}

export default { onResize, offResize };




