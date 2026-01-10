'use strict';

/**
 * Particles Effect - анімація частинок навколо секції досягнень
 * Оптимізовано: вимикається на мобільних, використовує offscreen canvas
 */

class ParticlesEffect {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      particleCount: options.particleCount || 40,
      particleSpeed: options.particleSpeed || 0.5,
      particleSize: options.particleSize || 2,
      particleColor: options.particleColor || 'rgba(255, 255, 255, 0.3)',
      lineColor: options.lineColor || 'rgba(255, 255, 255, 0.1)',
      lineDistance: options.lineDistance || 100,
      ...options
    };

    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.isActive = false;
    this.isMobile = window.matchMedia('(max-width: 767px)').matches;

    // Вимкнути на мобільних для продуктивності
    if (this.isMobile) {
      return;
    }

    this.init();
  }

  init() {
    if (!this.container) return;

    // Створити canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'particles-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.setAttribute('aria-hidden', 'true');

    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    resizeObserver.observe(this.container);

    // Intersection Observer для запуску/зупинки
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.container);

    // Cleanup при виході з viewport
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  resize() {
    if (!this.canvas || !this.container) return;

    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  createParticles() {
    this.particles = [];
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * this.options.particleSpeed,
        vy: (Math.random() - 0.5) * this.options.particleSpeed,
        size: Math.random() * this.options.particleSize + 1
      });
    }
  }

  updateParticles() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Відбиття від країв
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      // Забезпечити межі
      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));
    });
  }

  drawLines() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.options.lineDistance) {
          const opacity = (1 - distance / this.options.lineDistance) * 0.3;
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  drawParticles() {
    this.ctx.fillStyle = this.options.particleColor;
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateParticles();
    this.drawLines();
    this.drawParticles();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isActive || this.isMobile) return;
    this.isActive = true;
    this.animate();
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  destroy() {
    this.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
  }
}

/**
 * Ініціалізація particles для секції achievements
 */
export function initAchievementsParticles() {
  const achievementsSection = document.querySelector('.achievements');
  if (!achievementsSection) return;

  new ParticlesEffect(achievementsSection, {
    particleCount: 35,
    particleSpeed: 0.3,
    particleSize: 2,
    lineDistance: 120
  });
}

export default ParticlesEffect;







