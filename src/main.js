import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initHeroScene } from './hero-scene.js';
import { initTrackerLines } from './tracker-lines.js';
import { initExplodedScene } from './exploded-scene.js';
import { initCustomCursor } from './cursor.js';
import { cyberAudio } from './audio.js';

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Custom Crosshair Cursor HUD
  const cursor = initCustomCursor();

  // 2. Initialize Hero 3D Scene
  const heroScene = initHeroScene();

  // 3. Initialize Dynamic SVG Tracker Lines
  let trackerLines = null;
  if (heroScene) {
    trackerLines = initTrackerLines(heroScene);
  }

  // 4. Initialize 3D Exploded View Scene
  const explodedScene = initExplodedScene();

  // 5. Initialize Lenis Smooth Momentum Scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.1,
  });

  // Synchronize Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 6. GSAP ScrollTrigger: Scroll-Driven 3D Layer Separation
  if (explodedScene) {
    const explodedSection = document.getElementById('exploded-section');
    const slider = document.getElementById('explosion-slider');
    const percentDisplay = document.getElementById('explosion-percent-display');

    ScrollTrigger.create({
      trigger: explodedSection,
      start: 'top 80%',
      end: 'center 40%',
      scrub: 1.2,
      onUpdate: (self) => {
        // Only drive via scroll if not manually isolated by button
        const progress = self.progress;
        explodedScene.applySeparation(progress);

        if (slider) {
          slider.value = Math.round(progress * 100);
        }
        if (percentDisplay) {
          percentDisplay.textContent = `${Math.round(progress * 100)}%`;
        }
      },
    });
  }

  // 7. Hero Color Swatches Live 3D Material Switcher
  const swatchButtons = document.querySelectorAll('#hero-color-swatches .swatch-btn');
  swatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      swatchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const color = btn.dataset.color;
      const name = btn.dataset.name;

      if (heroScene) {
        heroScene.setColorway(color, name);
      }
      cyberAudio.playChime();
    });
  });

  // 8. Collections Grid: "3D PREVIEW" Button Integration
  const preview3dButtons = document.querySelectorAll('.preview-3d-btn');
  preview3dButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const color = btn.dataset.color;
      const name = btn.dataset.name;

      // Smooth scroll back to Hero
      lenis.scrollTo('#hero', { offset: -70, duration: 1.4 });

      // Update 3D model color
      if (heroScene) {
        heroScene.setColorway(color, name);
      }

      // Update Hero swatch active class
      swatchButtons.forEach(b => {
        if (b.dataset.color === color) b.classList.add('active');
        else b.classList.remove('active');
      });

      cyberAudio.playChime();
    });
  });

  // 9. Pre-Order / Acquisition Slide-Out HUD Drawer Logic
  const orderDrawer = document.getElementById('order-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerItemBadge = document.getElementById('drawer-item-badge');
  const drawerItemName = document.getElementById('drawer-item-name');
  const drawerItemPrice = document.getElementById('drawer-item-price');
  const receiptSubtotal = document.getElementById('receipt-subtotal');
  const receiptTotal = document.getElementById('receipt-total');
  const checkoutConfirmBtn = document.getElementById('checkout-confirm-btn');

  function openDrawer(productName = 'CYBER PUFFER', price = 840, badge = 'STEALTH ONYX') {
    if (!orderDrawer) return;
    orderDrawer.classList.add('active');
    orderDrawer.setAttribute('aria-hidden', 'false');

    if (drawerItemName) drawerItemName.textContent = productName;
    if (drawerItemPrice) drawerItemPrice.textContent = `$${price} USD`;
    if (drawerItemBadge) drawerItemBadge.textContent = badge;
    if (receiptSubtotal) receiptSubtotal.textContent = `$${price}.00`;
    if (receiptTotal) receiptTotal.textContent = `$${price}.00 USD`;

    cyberAudio.playChime();
  }

  function closeDrawer() {
    if (!orderDrawer) return;
    orderDrawer.classList.remove('active');
    orderDrawer.setAttribute('aria-hidden', 'true');
    cyberAudio.playHoverBlip();
  }

  // Bind Open Drawer Triggers
  document.querySelectorAll('.trigger-order-btn, #header-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const model = btn.dataset.model || 'CYBER PUFFER // 01';
      const price = btn.dataset.price ? parseInt(btn.dataset.price) : 840;
      openDrawer(model, price, model.replace('CYBER PUFFER // ', ''));
    });
  });

  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Size Selector in Drawer
  document.querySelectorAll('.size-selector .size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-selector .size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cyberAudio.playHoverBlip();
    });
  });

  // Checkout Authorization Sequence
  if (checkoutConfirmBtn) {
    checkoutConfirmBtn.addEventListener('click', () => {
      checkoutConfirmBtn.innerHTML = '<span class="btn-text">AUTHORIZING PROTOCOL... [SYNC]</span>';
      checkoutConfirmBtn.style.background = '#10ff60';
      checkoutConfirmBtn.style.color = '#000';
      cyberAudio.playChime();

      setTimeout(() => {
        checkoutConfirmBtn.innerHTML = '<span class="btn-text">✓ PROTOCOL DISPATCH CONFIRMED</span>';
        setTimeout(() => {
          closeDrawer();
          checkoutConfirmBtn.innerHTML = '<span class="btn-scan"></span><span class="btn-text">AUTHORIZE PAYMENT // DISPATCH</span>';
          checkoutConfirmBtn.style.background = '';
          checkoutConfirmBtn.style.color = '';
        }, 1800);
      }, 1200);
    });
  }

  // 10. Cyber Audio Toggle Button
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const active = cyberAudio.toggle();
      const statusText = audioBtn.querySelector('.audio-status-text');
      if (statusText) {
        statusText.textContent = active ? 'AUDIO: ON' : 'AUDIO: OFF';
      }
      if (active) {
        audioBtn.style.borderColor = 'var(--accent-toxic)';
        audioBtn.style.color = 'var(--accent-toxic)';
      } else {
        audioBtn.style.borderColor = '';
        audioBtn.style.color = '';
      }
    });
  }

  // Bind Audio hover ticks to buttons and links
  document.querySelectorAll('a, button, .collection-card, .swatch-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cyberAudio.playHoverBlip();
    });
  });

  // 11. Digital Glitch Letter Shuffle Effect on Hover (only for plain text elements)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#*/';
  document.querySelectorAll('.glitch-hover').forEach(element => {
    element.addEventListener('mouseenter', () => {
      // Guard: do NOT overwrite innerText if element contains child elements (e.g. spans, icons)
      if (element.children.length > 0) return;

      const originalText = element.dataset.text || element.innerText;
      let iteration = 0;
      const interval = setInterval(() => {
        element.innerText = originalText
          .split('')
          .map((letter, index) => {
            if (letter === ' ' || letter === '\n') return letter;
            if (index < iteration) {
              return originalText[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join('');

        if (iteration >= originalText.length) {
          clearInterval(interval);
          element.innerText = originalText;
        }
        iteration += 1 / 2;
      }, 25);
    });
  });

  console.log('%c[AERO-X // 3D CYBERWEAR INITIALIZED]', 'color: #00f0ff; font-weight: bold; background: #000; padding: 4px;');
});
