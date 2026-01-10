'use strict';

/**
 * Pricing Analytics - трекінг подій прайс-листу
 */
function initPricingAnalytics() {
  // Трекінг відкриття/закриття акордеонів (тільки в .pricing-section)
  document.addEventListener('click', (e) => {
    const header = e.target.closest('.pricing-section [data-accordion-header]');
    if (!header) return;

    const item = header.closest('[data-pricing-item]');
    if (item) {
      const title = item.dataset.pricingTitle;
      const isOpen = item.classList.contains('accordion-item--open');
      trackPricingEvent(isOpen ? 'accordion_close' : 'accordion_open', title);
    }
  });

  // Експорт для інших модулів
  window.trackPricingEvent = trackPricingEvent;
}

function trackPricingEvent(action, label, value) {
  // Google Analytics 4
  if (window.gtag) {
    gtag('event', action, {
      event_category: 'pricing',
      event_label: label,
      value: value || 0
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    fbq('trackCustom', 'PricingInteraction', {
      action: action,
      pricing_item: label
    });
  }

  // Console для dev
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[Pricing Analytics]', action, label, value);
  }
}

document.addEventListener('DOMContentLoaded', initPricingAnalytics);

export { initPricingAnalytics, trackPricingEvent };






