import * as THREE from 'three';

/**
 * Creates procedural hexagonal pattern canvas texture for Graphene Lining
 */
function createHexGrapheneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.5;

  const hexRadius = 16;
  const h = hexRadius * Math.sin(Math.PI / 3);

  function drawHexagon(x, y) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + hexRadius * Math.cos(angle);
      const hy = y + hexRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  for (let x = 0; x < 128 + hexRadius; x += hexRadius * 3) {
    for (let y = 0; y < 128 + h * 2; y += h * 2) {
      drawHexagon(x, y);
      drawHexagon(x + hexRadius * 1.5, y + h);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Procedural layer 1: Weather-Resistant Aero-Poly Shell (Outer)
 */
function createOuterShell() {
  const group = new THREE.Group();
  group.name = 'Layer_OuterShell';

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x12151b,
    roughness: 0.15,
    metalness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    sheen: 0.8,
    sheenColor: 0x00f0ff,
    transparent: true,
    opacity: 0.95,
  });

  const baffleYs = [-0.9, -0.4, 0.1, 0.6, 1.1];
  const baffleRadii = [1.14, 1.2, 1.22, 1.16, 1.02];

  baffleYs.forEach((y, i) => {
    const geom = new THREE.CylinderGeometry(baffleRadii[i] * 0.95, baffleRadii[i], 0.44, 28);
    const mesh = new THREE.Mesh(geom, shellMat);
    mesh.position.y = y;
    mesh.scale.set(1, 1, 0.85);
    group.add(mesh);
  });

  // Collar
  const collarGeom = new THREE.CylinderGeometry(0.75, 0.88, 0.5, 24);
  const collar = new THREE.Mesh(collarGeom, shellMat);
  collar.position.set(0, 1.5, 0);
  group.add(collar);

  return group;
}

/**
 * Procedural layer 2: Cryogenic Aerogel Thermal Insulation Matrix (Middle)
 */
function createInsulationCore() {
  const group = new THREE.Group();
  group.name = 'Layer_Insulation';

  // Glowing translucent aerogel volume with particle wireframe
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    emissive: 0x002f3a,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.2,
    transparent: true,
    opacity: 0.75,
    wireframe: false,
  });

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x10ff60,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });

  const baffleYs = [-0.85, -0.38, 0.1, 0.58, 1.05];
  const baffleRadii = [1.02, 1.08, 1.1, 1.05, 0.92];

  baffleYs.forEach((y, i) => {
    const geom = new THREE.CylinderGeometry(baffleRadii[i] * 0.95, baffleRadii[i], 0.42, 24);
    const mesh = new THREE.Mesh(geom, coreMat);
    mesh.position.y = y;
    mesh.scale.set(1, 1, 0.84);
    group.add(mesh);

    // Superimpose subtle wireframe mesh
    const wire = new THREE.Mesh(geom, wireMat);
    wire.position.y = y;
    wire.scale.set(1.01, 1.01, 0.85);
    group.add(wire);
  });

  // Internal glowing aerogel particulate matrix
  const pCount = 200;
  const pGeom = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.9;
    pPos[i] = Math.cos(angle) * r;
    pPos[i + 1] = (Math.random() - 0.5) * 2.2;
    pPos[i + 2] = Math.sin(angle) * r * 0.8;
  }
  pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x10ff60,
    size: 0.04,
    transparent: true,
    opacity: 0.85,
  });
  const particles = new THREE.Points(pGeom, pMat);
  group.add(particles);

  return group;
}

/**
 * Procedural layer 3: Graphene Micro-Honeycomb Comfort Lining (Inner)
 */
function createComfortLining() {
  const group = new THREE.Group();
  group.name = 'Layer_ComfortLining';

  const hexTexture = createHexGrapheneTexture();

  const liningMat = new THREE.MeshStandardMaterial({
    color: 0x181c24,
    map: hexTexture,
    metalness: 0.8,
    roughness: 0.35,
    emissive: 0x001522,
    emissiveIntensity: 0.6,
  });

  const baffleYs = [-0.8, -0.35, 0.1, 0.55, 1.0];
  const baffleRadii = [0.92, 0.96, 0.98, 0.94, 0.84];

  baffleYs.forEach((y, i) => {
    const geom = new THREE.CylinderGeometry(baffleRadii[i] * 0.95, baffleRadii[i], 0.4, 24);
    const mesh = new THREE.Mesh(geom, liningMat);
    mesh.position.y = y;
    mesh.scale.set(1, 1, 0.82);
    group.add(mesh);
  });

  return group;
}

/**
 * Initializes the 3D Exploded View Section Scene with Interactive Drag and Y-Axis Separation
 */
export function initExplodedScene() {
  const container = document.getElementById('exploded-viewport');
  const canvas = document.getElementById('exploded-3d-canvas');
  if (!container || !canvas) return null;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  // Main Exploded Model Root Group
  const modelRoot = new THREE.Group();
  scene.add(modelRoot);

  // Create 3 layers
  const outerShell = createOuterShell();
  const insulation = createInsulationCore();
  const comfortLining = createComfortLining();

  modelRoot.add(outerShell);
  modelRoot.add(insulation);
  modelRoot.add(comfortLining);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  const cyanRim = new THREE.DirectionalLight(0x00f0ff, 3.0);
  cyanRim.position.set(-4, -1, -3);
  scene.add(cyanRim);

  const greenRim = new THREE.DirectionalLight(0x10ff60, 2.5);
  greenRim.position.set(4, 2, -3);
  scene.add(greenRim);

  // Layer separation state (0.0 = fully collapsed, 1.0 = fully exploded)
  let currentSeparation = 1.0;
  let targetSeparation = 1.0;
  const maxOffset = 2.1; // Distance each layer travels on Y

  function applySeparation(val) {
    targetSeparation = Math.max(0, Math.min(1, val));
  }

  // Interactive Orbit / Drag rotation controls
  let isDragging = false;
  let prevPointer = { x: 0, y: 0 };
  let rotSpeedX = 0;
  let rotSpeedY = 0;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - prevPointer.x;
      const deltaY = e.clientY - prevPointer.y;
      rotSpeedY += deltaX * 0.007;
      rotSpeedX += deltaY * 0.006;
      prevPointer = { x: e.clientX, y: e.clientY };
    }
  });

  // Touch Support for mobile dragging
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - prevPointer.x;
      const deltaY = e.touches[0].clientY - prevPointer.y;
      rotSpeedY += deltaX * 0.008;
      rotSpeedX += deltaY * 0.007;
      prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  // Window Resize
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Isolation mode flags
  let activeIsolation = 'all';

  function setIsolation(mode) {
    activeIsolation = mode;
    if (mode === 'all' || mode === 'collapse') {
      outerShell.visible = true;
      insulation.visible = true;
      comfortLining.visible = true;
      if (mode === 'collapse') applySeparation(0.0);
      else applySeparation(1.0);
    } else if (mode === 'shell') {
      outerShell.visible = true;
      insulation.visible = false;
      comfortLining.visible = false;
      applySeparation(0.0);
    } else if (mode === 'insulation') {
      outerShell.visible = false;
      insulation.visible = true;
      comfortLining.visible = false;
      applySeparation(0.0);
    } else if (mode === 'lining') {
      outerShell.visible = false;
      insulation.visible = false;
      comfortLining.visible = true;
      applySeparation(0.0);
    }

    // Highlight corresponding tech card
    document.querySelectorAll('.layer-tech-card').forEach(card => {
      if (mode === 'all' || mode === 'collapse' || card.dataset.layer === mode) {
        card.classList.add('highlighted');
      } else {
        card.classList.remove('highlighted');
      }
    });
  }

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Apply inertia rotation
    modelRoot.rotation.y += rotSpeedY;
    modelRoot.rotation.x += rotSpeedX;
    rotSpeedY *= 0.92;
    rotSpeedX *= 0.92;

    // Slow ambient rotation if idle
    if (!isDragging && Math.abs(rotSpeedY) < 0.001) {
      modelRoot.rotation.y += 0.003;
    }

    // Clamp vertical tilt to prevent upside-down flip
    modelRoot.rotation.x = Math.max(-0.8, Math.min(0.8, modelRoot.rotation.x));

    // Smoothly interpolate Y-axis layer separation
    currentSeparation += (targetSeparation - currentSeparation) * 0.08;

    // Outer Shell floats upward (+Y)
    outerShell.position.y = maxOffset * currentSeparation;
    // Insulation remains at center Y
    insulation.position.y = 0;
    // Comfort Lining floats downward (-Y)
    comfortLining.position.y = -maxOffset * currentSeparation;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  // Connect Slider and Controls UI
  const slider = document.getElementById('explosion-slider');
  const percentDisplay = document.getElementById('explosion-percent-display');

  if (slider) {
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      applySeparation(val);
      if (percentDisplay) {
        percentDisplay.textContent = `${Math.round(val * 100)}%`;
      }
    });
  }

  // Bind Buttons
  const buttons = {
    'btn-explode-all': 'all',
    'btn-isolate-shell': 'shell',
    'btn-isolate-insulation': 'insulation',
    'btn-isolate-lining': 'lining',
    'btn-collapse': 'collapse',
  };

  Object.entries(buttons).forEach(([id, mode]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layer-action-buttons .layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setIsolation(mode);
        if (slider) {
          slider.value = mode === 'collapse' ? 0 : (mode === 'all' ? 100 : 0);
          if (percentDisplay) percentDisplay.textContent = `${slider.value}%`;
        }
      });
    }
  });

  return {
    scene,
    camera,
    renderer,
    modelRoot,
    applySeparation,
    setIsolation,
  };
}
