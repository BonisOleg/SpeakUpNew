'use strict';

/**
 * Base Carousel Module - базовий модуль для всіх каруселей
 * Використовує CSS scroll-snap для плавної прокрутки
 * Підтримує touch swipe, keyboard navigation, lazy loading
 */
export class BaseCarousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      console.warn('[BaseCarousel] Container not found');
      return;
    }

    this.options = {
      itemsPerView: options.itemsPerView || 1,
      gap: options.gap || 16,
      prevButton: options.prevButton || null,
      nextButton: options.nextButton || null,
      lazyLoad: options.lazyLoad !== false,
      keyboardNav: options.keyboardNav !== false,
      ...options
    };

    this.items = Array.from(this.container.querySelectorAll('.carousel-item'));
    this.currentIndex = 0;
    this.isScrolling = false;

    this.init();
  }

  init() {
    // Додаємо scroll-snap класи
    this.container.classList.add('carousel-container');
    this.items.forEach(item => item.classList.add('carousel-item'));

    // Touch swipe detection (passive)
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

    // Keyboard navigation
    if (this.options.keyboardNav) {
      this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.container.setAttribute('tabindex', '0');
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Carousel');
    }

    // Prev/Next buttons
    if (this.options.prevButton) {
      const prevBtn = typeof this.options.prevButton === 'string'
        ? document.querySelector(this.options.prevButton)
        : this.options.prevButton;
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prev());
      }
    }

    if (this.options.nextButton) {
      const nextBtn = typeof this.options.nextButton === 'string'
        ? document.querySelector(this.options.nextButton)
        : this.options.nextButton;
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.next());
      }
    }

    // Lazy load images
    if (this.options.lazyLoad) {
      this.setupLazyLoading();
    }

    // Scroll event для оновлення currentIndex
    this.container.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    // Визначаємо напрямок (horizontal vs vertical)
    if (!this.touchStartX || !this.touchStartY) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = Math.abs(touchX - this.touchStartX);
    const diffY = Math.abs(touchY - this.touchStartY);

    // Якщо вертикальний скрол переважає - не блокуємо
    if (diffY > diffX) {
      return;
    }
  }

  handleTouchEnd(e) {
    if (!this.touchStartX) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = this.touchStartX - touchEndX;
    const threshold = 50; // Мінімальна відстань для swipe

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        this.next();
      } else {
        this.prev();
      }
    }

    this.touchStartX = null;
    this.touchStartY = null;
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    }
  }

  handleScroll() {
    if (this.isScrolling) return;

    // Оновлюємо currentIndex на основі scroll позиції з більш точною логікою
    const scrollLeft = this.container.scrollLeft;
    const itemWidth = this.items[0]?.offsetWidth || 0;
    const gap = this.options.gap;
    const tolerance = 2; // Tolerance для subpixel рендерингу (±2px)

    // Розраховуємо новий індекс з більшою точністю
    const itemStride = itemWidth + gap;
    let newIndex = Math.round(scrollLeft / itemStride);

    // Переконуємось що новий індекс в межах
    newIndex = Math.max(0, Math.min(newIndex, this.items.length - 1));

    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.updateButtons();
    }
  }

  prev() {
    if (this.isScrolling || !this.canScrollLeft()) return;

    this.currentIndex--;
    this.scrollToIndex(this.currentIndex);
  }

  next() {
    if (this.isScrolling || !this.canScrollRight()) return;

    this.currentIndex++;
    this.scrollToIndex(this.currentIndex);
  }

  canScrollLeft() {
    // Перевіряємо чи можна прокрутити вліво на основі реальної позиції scroll
    const tolerance = 2; // Tolerance для subpixel рендерингу
    return this.container.scrollLeft > tolerance;
  }

  canScrollRight() {
    // Перевіряємо чи можна прокрутити вправо на основі реальної позиції scroll
    const tolerance = 2; // Tolerance для subpixel рендерингу
    const maxScroll = this.container.scrollWidth - this.container.clientWidth;
    return this.container.scrollLeft < (maxScroll - tolerance);
  }

  scrollToIndex(index) {
    if (index < 0 || index >= this.items.length) return;

    this.isScrolling = true;
    const item = this.items[index];
    const itemWidth = item.offsetWidth;
    const gap = this.options.gap;
    const scrollPosition = index * (itemWidth + gap);

    this.container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    // Скидаємо прапорець після завершення скролу
    setTimeout(() => {
      this.isScrolling = false;
    }, 500);
  }

  updateButtons() {
    // Оновлюємо стан кнопок prev/next на основі реальної можливості прокрутки
    if (this.options.prevButton) {
      const prevBtn = typeof this.options.prevButton === 'string'
        ? document.querySelector(this.options.prevButton)
        : this.options.prevButton;
      if (prevBtn) {
        const canScroll = this.canScrollLeft();
        prevBtn.disabled = !canScroll;
        prevBtn.setAttribute('aria-disabled', !canScroll);
      }
    }

    if (this.options.nextButton) {
      const nextBtn = typeof this.options.nextButton === 'string'
        ? document.querySelector(this.options.nextButton)
        : this.options.nextButton;
      if (nextBtn) {
        const canScroll = this.canScrollRight();
        nextBtn.disabled = !canScroll;
        nextBtn.setAttribute('aria-disabled', !canScroll);
      }
    }
  }

  setupLazyLoading() {
    // Використовуємо Intersection Observer для lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      root: this.container,
      rootMargin: '50px'
    });

    this.items.forEach(item => {
      const images = item.querySelectorAll('img[data-src]');
      images.forEach(img => imageObserver.observe(img));
    });
  }

  destroy() {
    // Cleanup listeners
    this.container.removeEventListener('scroll', this.handleScroll);
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
    if (this.options.keyboardNav) {
      this.container.removeEventListener('keydown', this.handleKeyDown);
    }
  }
}

export default BaseCarousel;








