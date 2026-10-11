import * as THREE from 'three';

/**
 * Creates a procedural normal bump map texture for puffy quilted fabric
 */
function createQuiltedNormalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Base neutral normal map color (RGB 128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  // Draw soft horizontal pillow ripples for puffer baffles
  for (let y = 0; y < 256; y += 32) {
    const grad = ctx.createLinearGradient(0, y, 0, y + 32);
    grad.addColorStop(0, 'rgb(100, 160, 255)');
    grad.addColorStop(0.5, 'rgb(128, 128, 255)');
    grad.addColorStop(1, 'rgb(160, 95, 255)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 256, 32);
  }

  // Micro fine grid for ripstop nylon
  ctx.strokeStyle = 'rgba(140, 140, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 256; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 6);
  return texture;
}

/**
 * Procedurally sculpts the futuristic glossy puffer jacket
 */
export function createPufferJacketMesh(customColor = '#0d0e12') {
  const jacketGroup = new THREE.Group();
  jacketGroup.name = 'PufferJacket';

  const normalMap = createQuiltedNormalTexture();

  // High-End PBR Material with Glossy Clearcoat & Iridescent Sheen
  const jacketMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(customColor),
    roughness: 0.18,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    sheen: 0.6,
    sheenColor: new THREE.Color('#3a4a58'),
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.4, 0.8),
    reflectivity: 0.9,
  });

  // Dark metallic material for hardware (zippers, buckles, neck rings)
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x111317,
    metalness: 0.95,
    roughness: 0.2,
  });

  // Cyber glowing accent material (chest badge, status leds)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.9,
  });

  // 1. Torso Baffles: Stack of 5 rounded puffy horizontal chambers
  const baffleYPositions = [-1.1, -0.6, -0.1, 0.4, 0.9];
  const baffleRadii = [1.08, 1.15, 1.18, 1.12, 0.98];

  baffleYPositions.forEach((y, i) => {
    const r = baffleRadii[i];
    // Squashed capsule / torus geometry for plump puffy quilted look
    const geom = new THREE.CylinderGeometry(r * 0.95, r, 0.46, 32, 4);
    // Round the edges slightly by scaling vertices
    const pos = geom.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const vy = pos.getY(v);
      const factor = 1 + (0.08 * (1 - Math.abs(vy / 0.23)));
      pos.setX(v, pos.getX(v) * factor);
      pos.setZ(v, pos.getZ(v) * factor * 0.82); // Torso is oval (flatter front-to-back)
    }
    geom.computeVertexNormals();

    const baffleMesh = new THREE.Mesh(geom, jacketMaterial);
    baffleMesh.position.y = y;
    baffleMesh.castShadow = true;
    baffleMesh.receiveShadow = true;
    jacketGroup.add(baffleMesh);
  });

  // 2. High-Neck Padded Collar
  const collarGeom = new THREE.CylinderGeometry(0.72, 0.86, 0.65, 32, 4);
  const collarMesh = new THREE.Mesh(collarGeom, jacketMaterial);
  collarMesh.position.set(0, 1.4, -0.05);
  collarMesh.scale.set(1, 1, 0.85);
  jacketGroup.add(collarMesh);

  // Collar Cyber Gasket Ring
  const collarRingGeom = new THREE.TorusGeometry(0.74, 0.05, 16, 32);
  const collarRing = new THREE.Mesh(collarRingGeom, metalMaterial);
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.set(0, 1.55, -0.05);
  jacketGroup.add(collarRing);

  // 3. Futuristic Hood (folded / structured back)
  const hoodGeom = new THREE.SphereGeometry(0.92, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
  const hoodMesh = new THREE.Mesh(hoodGeom, jacketMaterial);
  hoodMesh.position.set(0, 1.35, -0.35);
  hoodMesh.rotation.x = -Math.PI * 0.25;
  jacketGroup.add(hoodMesh);

  // 4. Quilted Left & Right Sleeves
  const createSleeve = (isLeft) => {
    const sleeveGroup = new THREE.Group();
    const sign = isLeft ? 1 : -1;

    // 4 baffle segments per sleeve curving down
    const segs = [
      { x: 1.25, y: 0.85, z: 0, r: 0.46, rotZ: -0.45 },
      { x: 1.6,  y: 0.45, z: 0.08, r: 0.42, rotZ: -0.65 },
      { x: 1.85, y: 0.0,  z: 0.16, r: 0.38, rotZ: -0.85 },
      { x: 2.05, y: -0.45, z: 0.24, r: 0.34, rotZ: -1.05 },
    ];

    segs.forEach(s => {
      const segGeom = new THREE.CylinderGeometry(s.r * 0.9, s.r, 0.44, 24, 2);
      const segMesh = new THREE.Mesh(segGeom, jacketMaterial);
      segMesh.position.set(s.x * sign, s.y, s.z);
      segMesh.rotation.z = s.rotZ * sign;
      sleeveGroup.add(segMesh);
    });

    // Metallic Magnetic Cuff Seal
    const cuffGeom = new THREE.CylinderGeometry(0.3, 0.32, 0.2, 24);
    const cuffMesh = new THREE.Mesh(cuffGeom, metalMaterial);
    cuffMesh.position.set(2.18 * sign, -0.72, 0.3);
    cuffMesh.rotation.z = -1.15 * sign;
    sleeveGroup.add(cuffMesh);

    // Glowing Cuff status ring
    const ringGeom = new THREE.TorusGeometry(0.31, 0.02, 12, 24);
    const ringMesh = new THREE.Mesh(ringGeom, glowMaterial);
    ringMesh.position.copy(cuffMesh.position);
    ringMesh.rotation.copy(cuffMesh.rotation);
    sleeveGroup.add(ringMesh);

    return sleeveGroup;
  };

  jacketGroup.add(createSleeve(true));  // Left Sleeve
  jacketGroup.add(createSleeve(false)); // Right Sleeve

  // 5. Heavy-Duty Center Waterproof Zipper
  const zipperGeom = new THREE.BoxGeometry(0.06, 2.45, 0.08);
  const zipperMesh = new THREE.Mesh(zipperGeom, metalMaterial);
  zipperMesh.position.set(0, -0.1, 0.98);
  jacketGroup.add(zipperMesh);

  // Zipper Slider Pull Tag
  const pullTagGeom = new THREE.BoxGeometry(0.08, 0.25, 0.04);
  const pullTag = new THREE.Mesh(pullTagGeom, metalMaterial);
  pullTag.position.set(0, 0.35, 1.05);
  jacketGroup.add(pullTag);

  // 6. Cybernetic Chest Insignia / HUD Badge
  const badgeGeom = new THREE.BoxGeometry(0.28, 0.18, 0.05);
  const badgeBase = new THREE.Mesh(badgeGeom, metalMaterial);
  badgeBase.position.set(0.48, 0.52, 0.96);
  badgeBase.rotation.y = 0.22;
  jacketGroup.add(badgeBase);

  const ledGeom = new THREE.BoxGeometry(0.22, 0.05, 0.06);
  const ledMesh = new THREE.Mesh(ledGeom, glowMaterial);
  ledMesh.position.set(0.48, 0.52, 0.97);
  ledMesh.rotation.y = 0.22;
  jacketGroup.add(ledMesh);

  // 7. Tactical Back-Harness Straps
  const strapGeom = new THREE.BoxGeometry(0.12, 2.1, 0.04);
  const strapL = new THREE.Mesh(strapGeom, metalMaterial);
  strapL.position.set(-0.45, 0.05, -0.92);
  strapL.rotation.y = -0.15;
  jacketGroup.add(strapL);

  const strapR = new THREE.Mesh(strapGeom, metalMaterial);
  strapR.position.set(0.45, 0.05, -0.92);
  strapR.rotation.y = 0.15;
  jacketGroup.add(strapR);

  // Set internal reference for color switching
  jacketGroup.userData.jacketMaterial = jacketMaterial;
  jacketGroup.userData.glowMaterial = glowMaterial;

  return jacketGroup;
}

/**
 * Initializes the Hero Three.js Scene with 360 continuous auto-rotation & cursor parallax
 */
export function initHeroScene() {
  const container = document.getElementById('hero-viewport');
  const canvas = document.getElementById('hero-3d-canvas');
  if (!container || !canvas) return null;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.2, 5.8);

  // WebGL Renderer with High-End Color & Tone Mapping
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create Jacket 3D Model
  const jacketGroup = createPufferJacketMesh('#0d0e12');
  jacketGroup.position.set(0, -0.15, 0);
  scene.add(jacketGroup);

  // Floating Cyber Particles
  const particleCount = 120;
  const particleGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 8;
    positions[i + 1] = (Math.random() - 0.5) * 6;
    positions[i + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.025,
    transparent: true,
    opacity: 0.6,
  });
  const particleSystem = new THREE.Points(particleGeom, particleMat);
  scene.add(particleSystem);

  // Lighting Rig
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Front Key Light
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(2, 4, 4);
  scene.add(keyLight);

  // Cyan Rim Light (Left)
  const cyanRim = new THREE.DirectionalLight(0x00f0ff, 3.2);
  cyanRim.position.set(-4, 2, -3);
  scene.add(cyanRim);

  // Magenta / White Accent Rim (Right)
  const accentRim = new THREE.DirectionalLight(0xffffff, 2.0);
  accentRim.position.set(4, 2, -3);
  scene.add(accentRim);

  // Subtle Ground Glow
  const floorLight = new THREE.PointLight(0x00f0ff, 1.2, 5);
  floorLight.position.set(0, -2.5, 1);
  scene.add(floorLight);

  // Dynamic 3D Anchor Points (for Screen-Space SVG Tracking Lines)
  // Attached to jacketGroup so they follow rotation and tilt!
  const anchors = {
    collar: new THREE.Object3D(),
    baffle: new THREE.Object3D(),
    cuff: new THREE.Object3D(),
    chest: new THREE.Object3D(),
  };

  anchors.collar.position.set(0, 1.45, 0.7);
  anchors.baffle.position.set(-0.95, -0.1, 0.7);
  anchors.cuff.position.set(2.1, -0.65, 0.3);
  anchors.chest.position.set(0.48, 0.52, 0.96);

  Object.values(anchors).forEach(a => jacketGroup.add(a));

  // Mouse Parallax & Interaction Variables
  let mouseX = 0;
  let mouseY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let manualRotY = 0;
  let autoRotate = true;

  // Window Resize Handling
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Mouse Parallax Listener
  window.addEventListener('mousemove', (e) => {
    // Normalized [-1, 1] coords
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetTiltX = mouseY * 0.18;
    targetTiltY = mouseX * 0.28;
  });

  // Canvas Drag Interaction (User can rotate manually)
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      manualRotY += deltaX * 0.008;
      jacketGroup.rotation.x += deltaY * 0.005;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  });

  // Animation Loop with continuous 360° rotation and parallax inertia
  let lastTime = performance.now();
  let frames = 0;
  let fpsTimer = performance.now();
  const fpsElement = document.getElementById('hud-fps');

  function animate(now) {
    requestAnimationFrame(animate);

    // Continuous 360° auto-rotation on Y-axis at very slow, smooth speed
    if (autoRotate && !isDragging) {
      jacketGroup.rotation.y += 0.0055;
    }
    jacketGroup.rotation.y += manualRotY;
    manualRotY *= 0.92; // Damping

    // Smooth inertia tilt following mouse parallax
    jacketGroup.rotation.x += (targetTiltX - jacketGroup.rotation.x) * 0.05;
    jacketGroup.rotation.z += (-targetTiltY * 0.3 - jacketGroup.rotation.z) * 0.05;

    // Slow particle drift
    particleSystem.rotation.y += 0.001;

    renderer.render(scene, camera);

    // Calculate FPS
    frames++;
    if (now - fpsTimer >= 1000) {
      if (fpsElement) {
        fpsElement.textContent = `RENDER: ${frames} FPS`;
      }
      frames = 0;
      fpsTimer = now;
    }
  }
  requestAnimationFrame(animate);

  // Method to project 3D anchor points to 2D screen coordinates
  function getAnchorScreenPositions() {
    const rect = canvas.getBoundingClientRect();
    const result = {};

    for (const [key, obj] of Object.entries(anchors)) {
      const worldPos = new THREE.Vector3();
      obj.getWorldPosition(worldPos);

      // Project into NDC [-1, 1]
      const screenVec = worldPos.clone().project(camera);

      // Check if point is in front of camera
      const isVisible = screenVec.z < 1;

      // Convert NDC to pixel coords relative to container
      const x = ((screenVec.x + 1) / 2) * rect.width;
      const y = ((-screenVec.y + 1) / 2) * rect.height;

      result[key] = {
        x: x,
        y: y,
        rawZ: screenVec.z,
        visible: isVisible && x >= 0 && x <= rect.width && y >= 0 && y <= rect.height,
        worldPos: worldPos
      };
    }

    return result;
  }

  // Method to switch jacket colorway dynamically
  function setColorway(colorHex, name) {
    if (jacketGroup.userData.jacketMaterial) {
      jacketGroup.userData.jacketMaterial.color.set(colorHex);
      if (colorHex === '#0d0e12') {
        jacketGroup.userData.jacketMaterial.sheenColor.set('#3a4a58');
      } else {
        jacketGroup.userData.jacketMaterial.sheenColor.set(colorHex);
      }
    }
    const colorLabel = document.getElementById('active-colorway-label');
    if (colorLabel) {
      colorLabel.textContent = `COLORWAY: ${name.toUpperCase()}`;
    }
  }

  return {
    scene,
    camera,
    renderer,
    jacketGroup,
    getAnchorScreenPositions,
    setColorway,
    setAutoRotate: (val) => { autoRotate = val; }
  };
}
