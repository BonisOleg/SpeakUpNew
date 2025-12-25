'use strict';

import { BurgerMenu } from './modules/burger-menu.js';
import { initRunningLine } from './modules/running-line.js';
import { initTrialForm } from './modules/trial-form.js';
import { ParallaxBackground } from './modules/parallax-background.js';
import { initHeaderDynamicForm } from './modules/header-dynamic-form.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[SpeakUp] Initializing modules...');

  new BurgerMenu();
  initRunningLine();
  initTrialForm();
  initHeaderDynamicForm();

  // Паралакс ефект (тільки на головній сторінці)
  if (document.querySelector('[data-parallax-layer]')) {
    new ParallaxBackground([
      { selector: '[data-parallax-layer="background"]', speed: 0.1 },
      { selector: '[data-parallax-layer="speaky"]', speed: 0.3 },
      { selector: '[data-parallax-layer="content"]', speed: 0.5 }
    ]);
  }
});

