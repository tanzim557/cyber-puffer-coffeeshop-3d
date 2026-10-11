/**
 * Dynamic SVG Tracker Lines
 * Projects 3D Three.js anchor coordinates onto 2D screen coordinates in real time,
 * drawing animated SVG connecting lines between 3D model points and floating tech callout cards.
 */

export function initTrackerLines(heroScene) {
  const svgOverlay = document.getElementById('tracker-svg');
  const linesGroup = document.getElementById('svg-lines-group');
  const nodesGroup = document.getElementById('svg-nodes-group');
  const container = document.getElementById('hero-viewport');

  if (!svgOverlay || !linesGroup || !nodesGroup || !container || !heroScene) {
    return null;
  }

  // Define mapping of anchors to card DOM elements and fixed viewport docking zones
  const trackMap = [
    {
      anchorKey: 'collar',
      cardId: 'callout-collar',
      // Docking anchor position offset relative to container
      dockRel: { x: 0.18, y: 0.18 },
    },
    {
      anchorKey: 'baffle',
      cardId: 'callout-baffle',
      dockRel: { x: 0.16, y: 0.58 },
    },
    {
      anchorKey: 'chest',
      cardId: 'callout-chest',
      dockRel: { x: 0.82, y: 0.24 },
    },
    {
      anchorKey: 'cuff',
      cardId: 'callout-cuff',
      dockRel: { x: 0.84, y: 0.62 },
    },
  ];

  // Initialize cards DOM references
  const items = trackMap.map(entry => {
    const cardEl = document.getElementById(entry.cardId);
    return {
      ...entry,
      card: cardEl,
      lineEl: null,
      nodePulse: null,
      nodeRing: null,
      cardDot: null,
    };
  });

  // Create SVG line and node elements dynamically
  items.forEach((item, index) => {
    // 1. Connecting line (tech dogleg polyline)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('class', 'tracker-line');
    line.setAttribute('stroke', '#00f0ff');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '4, 3');
    line.setAttribute('fill', 'none');
    linesGroup.appendChild(line);
    item.lineEl = line;

    // 2. Pulse Center Node on 3D anchor
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.setAttribute('class', 'tracker-node-pulse');
    pulse.setAttribute('r', '4');
    nodesGroup.appendChild(pulse);
    item.nodePulse = pulse;

    // 3. Animated Radar Ring on 3D anchor
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('class', 'tracker-node-ring');
    ring.setAttribute('r', '8');
    nodesGroup.appendChild(ring);
    item.nodeRing = ring;

    // 4. Dot at the card junction
    const cardDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cardDot.setAttribute('r', '2.5');
    cardDot.setAttribute('fill', '#10ff60');
    nodesGroup.appendChild(cardDot);
    item.cardDot = cardDot;
  });

  let dashOffset = 0;

  // Real-time Update Loop
  function update() {
    requestAnimationFrame(update);

    const positions = heroScene.getAnchorScreenPositions();
    const containerRect = container.getBoundingClientRect();
    const w = containerRect.width;
    const h = containerRect.height;

    dashOffset -= 0.4; // Continuous line movement animation

    items.forEach(item => {
      const pos = positions[item.anchorKey];
      if (!pos || !item.card) return;

      // Position the floating tech callout card at its docking coordinates
      const cardX = w * item.dockRel.x;
      const cardY = h * item.dockRel.y;

      item.card.style.left = `${cardX}px`;
      item.card.style.top = `${cardY}px`;

      // Check visibility (hide if point is behind 3D model or offscreen)
      const isFacingCamera = pos.visible && pos.rawZ < 1.0;

      if (isFacingCamera) {
        item.card.classList.add('visible');
        item.lineEl.style.opacity = '0.85';
        item.nodePulse.style.opacity = '1';
        item.nodeRing.style.opacity = '0.7';
        item.cardDot.style.opacity = '1';

        // Anchor 3D source coordinates (model point)
        const ax = pos.x;
        const ay = pos.y;

        // Card connection junction
        // If card is to the left of anchor, connect to card's right edge; if to the right, connect to left edge
        const cardRect = item.card.getBoundingClientRect();
        const halfCardW = cardRect.width / 2;
        const cardEdgeX = cardX < ax ? cardX + halfCardW : cardX - halfCardW;
        const cardEdgeY = cardY;

        // Tech Dogleg routing: (ax, ay) -> (midX, ay) -> (cardEdgeX, cardEdgeY)
        const midX = (ax + cardEdgeX) * 0.5;
        const pointsString = `${ax},${ay} ${midX},${ay} ${midX},${cardEdgeY} ${cardEdgeX},${cardEdgeY}`;

        item.lineEl.setAttribute('points', pointsString);
        item.lineEl.style.strokeDashoffset = `${dashOffset}px`;

        // Update Anchor Circles
        item.nodePulse.setAttribute('cx', ax);
        item.nodePulse.setAttribute('cy', ay);
        item.nodeRing.setAttribute('cx', ax);
        item.nodeRing.setAttribute('cy', ay);

        // Update Card Junction Dot
        item.cardDot.setAttribute('cx', cardEdgeX);
        item.cardDot.setAttribute('cy', cardEdgeY);
      } else {
        // Point is facing away (back of the rotating jacket)
        item.card.classList.remove('visible');
        item.lineEl.style.opacity = '0';
        item.nodePulse.style.opacity = '0';
        item.nodeRing.style.opacity = '0';
        item.cardDot.style.opacity = '0';
      }
    });
  }

  requestAnimationFrame(update);

  return {
    items,
  };
}
