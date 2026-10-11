/**
 * Custom Cyber Crosshair Cursor with Real-Time HUD Coordinates
 */

export function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const coordsLabel = document.getElementById('cursor-coords');
  const stateLabel = document.getElementById('cursor-state');

  if (!cursor || !coordsLabel || !stateLabel) return null;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isHovering = false;
  let isCanvasActive = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Handle cursor leaving & entering window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // Hover detection for links, buttons, swatches, cards
  const interactiveSelector = 'a, button, input, .collection-card, .layer-tech-card, .swatch-btn, .size-btn, .close-btn';

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      isHovering = true;
      cursor.classList.add('hovering');
      stateLabel.textContent = 'STATUS: TARGET_LOCK';
    }

    const canvasTarget = e.target.closest('canvas');
    if (canvasTarget) {
      isCanvasActive = true;
      cursor.classList.add('hovering');
      stateLabel.textContent = 'STATUS: 3D_INTERACT';
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelector);
    const canvasTarget = e.target.closest('canvas');
    if (target || canvasTarget) {
      isHovering = false;
      isCanvasActive = false;
      cursor.classList.remove('hovering');
      stateLabel.textContent = 'STATUS: SCAN';
    }
  });

  // Smooth Render Loop
  function render() {
    // Lerp cursor position for buttery feel
    currentX += (mouseX - currentX) * 0.45;
    currentY += (mouseY - currentY) * 0.45;

    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    // Detect if inside top navigation header to avoid obscuring header elements
    if (mouseY < 75) {
      cursor.classList.add('in-header');
    } else {
      cursor.classList.remove('in-header');
    }

    // Update coordinates formatted with zero padding
    const px = Math.round(mouseX).toString().padStart(4, '0');
    const py = Math.round(mouseY).toString().padStart(4, '0');
    coordsLabel.textContent = `X: ${px} | Y: ${py}`;

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  return {
    setHovering: (val) => {
      isHovering = val;
      if (val) cursor.classList.add('hovering');
      else cursor.classList.remove('hovering');
    }
  };
}
