import './style.css';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  EllipseCurve,
  Fog,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineLoop,
  MathUtils,
  Mesh,
  AdditiveBlending,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#space');
const infoCard = document.querySelector('#planet-info');
const legend = document.querySelector('.legend');
const labelLayer = document.querySelector('.label-layer');
const speedSlider = document.querySelector('#time-scale');
const speedOutput = document.querySelector('#time-scale-value');
const tourButton = document.querySelector('#tour-toggle');
const tourStatus = document.querySelector('#tour-status');

const scene = new Scene();
scene.background = new Color(0x030613);
scene.fog = new Fog(0x030613, 95, 260);

const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 700);
const overviewCameraPosition = new Vector3(0, 58, 128);
const overviewTarget = new Vector3(0, 0, 0);
camera.position.copy(overviewCameraPosition);

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 18;
controls.maxDistance = 210;
controls.target.set(0, 0, 0);

scene.add(new AmbientLight(0x6f86bd, 0.95));
scene.add(new HemisphereLight(0xbfd7ff, 0x1e2544, 0.75));
const sunLight = new PointLight(0xfff1b0, 7.2, 420, 1.1);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
const fillLight = new DirectionalLight(0x8fb7ff, 0.75);
fillLight.position.set(-45, 38, 65);
scene.add(fillLight);

const overviewInfo = {
  name: '太阳系总览',
  fact: '不锁定具体行星，可自由观察整体轨道、太阳、八大行星、地球月球和土星环。',
  distance: null,
  radius: null
};

const planetData = [
  { name: '水星', englishName: 'Mercury', radius: 0.9, distance: 10, color: 0xb9a58d, orbitSpeed: 0.020, spinSpeed: 0.018, tilt: 0.03, fact: '最靠近太阳、也是最小的行星；它的一天比一年还长。', orbitalPeriod: 0.24, rotationPeriod: 58.6, diameter: '4,879 km' },
  { name: '金星', englishName: 'Venus', radius: 1.35, distance: 15, color: 0xe7c17b, orbitSpeed: 0.015, spinSpeed: -0.006, tilt: 3.1, fact: '被浓厚二氧化碳大气包裹，是太阳系中最炎热的行星。', orbitalPeriod: 0.62, rotationPeriod: 243, diameter: '12,104 km' },
  { name: '地球', englishName: 'Earth', radius: 1.45, distance: 21, color: 0x3e8fd5, orbitSpeed: 0.012, spinSpeed: 0.030, tilt: 0.41, fact: '我们的家园，拥有液态水、活跃气候和一颗较大的月球。', orbitalPeriod: 1.0, rotationPeriod: 1.0, diameter: '12,742 km' },
  { name: '火星', englishName: 'Mars', radius: 1.1, distance: 28, color: 0xc76542, orbitSpeed: 0.0095, spinSpeed: 0.028, tilt: 0.44, fact: '红色行星，拥有太阳系最高火山：奥林匹斯山。', orbitalPeriod: 1.88, rotationPeriod: 1.03, diameter: '6,779 km' },
  { name: '木星', englishName: 'Jupiter', radius: 3.7, distance: 40, color: 0xd0ad83, orbitSpeed: 0.0052, spinSpeed: 0.055, tilt: 0.05, fact: '太阳系最大行星，著名的大红斑是一场持续很久的巨型风暴。', orbitalPeriod: 11.86, rotationPeriod: 0.41, diameter: '139,820 km' },
  { name: '土星', englishName: 'Saturn', radius: 3.15, distance: 54, color: 0xe5cf94, orbitSpeed: 0.0038, spinSpeed: 0.050, tilt: 0.47, fact: '以明亮冰质行星环闻名，环系尺度巨大、层次丰富。', orbitalPeriod: 29.46, rotationPeriod: 0.45, diameter: '116,460 km' },
  { name: '天王星', englishName: 'Uranus', radius: 2.25, distance: 67, color: 0x86d7df, orbitSpeed: 0.0026, spinSpeed: -0.035, tilt: 1.71, fact: '冰巨星，几乎是"躺着"自转，呈现独特的季节变化。', orbitalPeriod: 84.01, rotationPeriod: 0.72, diameter: '50,724 km' },
  { name: '海王星', englishName: 'Neptune', radius: 2.2, distance: 79, color: 0x3867d6, orbitSpeed: 0.0021, spinSpeed: 0.032, tilt: 0.49, fact: '遥远的蓝色冰巨星，拥有强劲高速的大气风暴。', orbitalPeriod: 164.8, rotationPeriod: 0.67, diameter: '49,244 km' }
];

const moonData = {
  name: '月球',
  englishName: 'Moon',
  radius: 0.46,
  distance: 2.9,
  color: 0xdfe3ea,
  orbitSpeed: 0.065,
  spinSpeed: 0.012,
  type: 'moon',
  fact: '地球唯一的天然卫星，围绕地球运行；在本演示中放大显示，便于从地球视角和总览中辨识。',
  orbitalPeriod: 27.3,
  rotationPeriod: 27.3,
  diameter: '3,474 km'
};

const asteroidBeltData = {
  name: '小行星带',
  englishName: 'Asteroid Belt',
  type: 'asteroidBelt',
  innerDistance: 31,
  outerDistance: 43,
  count: 420,
  fact: '位于火星与木星之间，包含数百万颗小型天体，总质量约为月球质量的 4%。'
};

const kuiperBeltData = {
  name: '柯伊伯带',
  englishName: 'Kuiper Belt',
  type: 'kuiperBelt',
  innerDistance: 82,
  outerDistance: 108,
  count: 320,
  fact: '位于海王星轨道之外的神秘冰冻小天体带，类似于小行星带但更大、更遥远，是短周期彗星的发源地之一。'
};

const clickableObjects = [];
const planetObjects = [];
const labelObjects = [];
let selectedPlanet = null;
let asteroidBelt = null;
let kuiperBelt = null;
const sunMeshes = [];
let timeScale = 0.5;
let pointerDownPosition = null;
let hoveredObject = null;
let lastHoveredObject = null;

const cameraTransition = {
  active: false,
  startedAt: 0,
  duration: 950,
  startPosition: new Vector3(),
  endPosition: new Vector3(),
  startTarget: new Vector3(),
  endTarget: new Vector3()
};

const reusableWorldPosition = new Vector3();
const reusableFollowDelta = new Vector3();
const reusableLabelPosition = new Vector3();
const cinematicTour = {
  active: false,
  shotIndex: 0,
  shotStartedAt: 0,
  shotDuration: 7200,
  holdDuration: 2200,
  captionFadeDuration: 500,
  shots: [
    {
      name: '总览',
      type: 'overview',
      position: overviewCameraPosition.clone(),
      target: overviewTarget.clone(),
      caption: '太阳系八大行星，从炙热的水星到寒冷的冰巨星'
    },
    {
      name: '太阳',
      type: 'object',
      object: null,
      isSun: true,
      offset: new Vector3(10, 6, 12),
      caption: '太阳 — 太阳系的中心，一颗黄矮星，表面温度约 5,500°C'
    },
    {
      name: '水星与金星',
      type: 'dual',
      objects: ['Mercury', 'Venus'],
      offset: new Vector3(8, 9, 20),
      caption: '最靠近太阳的两颗类地行星：水星与金星'
    },
    {
      name: '地球与月球',
      type: 'object',
      object: 'Earth',
      offset: new Vector3(9, 5.8, 11),
      caption: '我们的家园 — 地球，及其唯一的天然卫星月球'
    },
    {
      name: '火星',
      type: 'object',
      object: 'Mars',
      offset: new Vector3(8, 6, 13),
      caption: '红色星球火星，拥有太阳系最高的奥林匹斯山火山'
    },
    {
      name: '木星',
      type: 'object',
      object: 'Jupiter',
      offset: new Vector3(16, 9, 22),
      caption: '太阳系最大行星 — 木星，大红斑是一场持续数百年的巨型风暴'
    },
    {
      name: '土星',
      type: 'object',
      object: 'Saturn',
      offset: new Vector3(15, 8, 19),
      caption: '壮丽的土星环 — 由冰粒和岩石碎片构成，绵延数十万公里'
    },
    {
      name: '天王星与海王星',
      type: 'outer',
      offset: new Vector3(0, 35, 65),
      caption: '冰冷的外太阳系：天王星与海王星，远距太阳数十亿公里'
    }
  ]
};

function formatTimeScale(scale) {
  return scale === 0 ? '暂停 / 0x' : `${scale.toFixed(2).replace(/\.00$/, '')}x`;
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

function easeInOutQuart(progress) {
  return progress < 0.5
    ? 8 * progress * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 4) / 2;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function createLabelTexture(text) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const fontSize = 28;
  const paddingX = 18;
  const paddingY = 9;
  const border = 2;
  const scratch = document.createElement('canvas');
  const scratchCtx = scratch.getContext('2d');
  scratchCtx.font = `800 ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`;
  const textWidth = Math.ceil(scratchCtx.measureText(text).width);
  const width = textWidth + paddingX * 2 + border * 2;
  const height = fontSize + paddingY * 2 + border * 2;

  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = Math.ceil(width * pixelRatio);
  textureCanvas.height = Math.ceil(height * pixelRatio);
  const ctx = textureCanvas.getContext('2d');
  ctx.scale(pixelRatio, pixelRatio);
  ctx.font = scratchCtx.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(9, 15, 34, 0.9)');
  gradient.addColorStop(1, 'rgba(39, 61, 106, 0.68)');
  roundRect(ctx, border, border, width - border * 2, height - border * 2, height / 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 224, 255, 0.55)';
  ctx.lineWidth = border;
  ctx.stroke();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = '#f7fbff';
  ctx.fillText(text, width / 2, height / 2 + 1);

  const texture = new CanvasTexture(textureCanvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, aspect: width / height };
}

function createLabel(mesh, text, radius = 1) {
  const { texture, aspect } = createLabelTexture(text);
  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false
  });
  const sprite = new Sprite(material);
  sprite.renderOrder = 20;
  scene.add(sprite);
  labelObjects.push({ mesh, sprite, material, radius, aspect, currentOpacity: 0, targetOpacity: 0 });
}

function updateLabels() {
  scene.updateMatrixWorld(true);
  camera.updateMatrixWorld();

  const FADE_K = 7; // higher = faster fade
  labelObjects.forEach(({ mesh, sprite, material, radius, aspect, currentOpacity }, idx) => {
    mesh.getWorldPosition(reusableLabelPosition);
    const distance = camera.position.distanceTo(reusableLabelPosition);
    const verticalOffset = radius * 1.55 + MathUtils.clamp(distance * 0.018, 0.4, 2.2);
    sprite.position.copy(reusableLabelPosition);
    sprite.position.y += verticalOffset;

    reusableLabelPosition.copy(sprite.position).project(camera);
    const inFrustum = reusableLabelPosition.z < 1 && reusableLabelPosition.z > -1;
    const tooFar = distance >= 185;
    const isHovered = (hoveredObject === mesh) || (selectedPlanet === mesh);
    const visible = inFrustum && !tooFar && isHovered;

    const entry = labelObjects[idx];
    entry.targetOpacity = visible ? 0.92 : 0;

    // Smooth lerp current toward target each frame
    entry.currentOpacity = MathUtils.damp(entry.currentOpacity, entry.targetOpacity, FADE_K, 1 / 60);
    material.opacity = entry.currentOpacity;

    const labelHeight = MathUtils.clamp(
      Math.tan(MathUtils.degToRad(camera.fov) / 2) * 0.025 * distance,
      1.25,
      2.45
    );
    sprite.scale.set(labelHeight * aspect, labelHeight, 1);
  });
}

function startViewTransition(endPosition, endTarget, duration = 950) {
  cameraTransition.active = true;
  cameraTransition.startedAt = performance.now();
  cameraTransition.duration = duration;
  cameraTransition.startPosition.copy(camera.position);
  cameraTransition.endPosition.copy(endPosition);
  cameraTransition.startTarget.copy(controls.target);
  cameraTransition.endTarget.copy(endTarget);
}

function updateViewTransition(now) {
  if (!cameraTransition.active) return;

  const progress = Math.min((now - cameraTransition.startedAt) / cameraTransition.duration, 1);
  const eased = easeInOutQuart(progress);
  camera.position.lerpVectors(cameraTransition.startPosition, cameraTransition.endPosition, eased);
  controls.target.lerpVectors(cameraTransition.startTarget, cameraTransition.endTarget, eased);

  if (progress >= 1) {
    cameraTransition.active = false;
    camera.position.copy(cameraTransition.endPosition);
    controls.target.copy(cameraTransition.endTarget);
  }
}

function getFocusCameraPosition(target, objectData = {}) {
  const currentOffset = camera.position.clone().sub(controls.target);
  if (currentOffset.lengthSq() < 1) currentOffset.set(12, 7, 18);
  currentOffset.normalize();
  const focusDistance = MathUtils.clamp((objectData.radius ?? 1.5) * 8 + 12, objectData.type === 'moon' ? 12 : 18, 44);
  return target.clone().add(currentOffset.multiplyScalar(focusDistance));
}

function makeStarField() {
  [
    { count: 1450, inner: 175, span: 230, size: 0.78, opacity: 0.82, color: 0xffffff },
    { count: 520, inner: 110, span: 115, size: 1.15, opacity: 0.42, color: 0x8fb7ff },
    { count: 260, inner: 240, span: 165, size: 1.55, opacity: 0.26, color: 0xfff0c0 }
  ].forEach((layer) => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(layer.count * 3);
    for (let i = 0; i < layer.count; i += 1) {
      const radius = layer.inner + Math.random() * layer.span;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(MathUtils.randFloatSpread(2));
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const material = new PointsMaterial({ color: layer.color, size: layer.size, sizeAttenuation: true, transparent: true, opacity: layer.opacity, depthWrite: false });
    scene.add(new Points(geometry, material));
  });
}

function createBelt(data) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(data.count * 3);
  for (let i = 0; i < data.count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = data.innerDistance + Math.random() * (data.outerDistance - data.innerDistance);
    const y = (Math.random() - 0.5) * (data.type === 'kuiperBelt' ? 4.5 : 1.8);
    positions[i * 3] = radius * Math.cos(angle);
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = radius * Math.sin(angle);
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  const isKuiper = data.type === 'kuiperBelt';
  const material = new PointsMaterial({
    color: isKuiper ? 0x90d8f0 : 0xc8b89a,
    size: isKuiper ? 0.48 : 0.35,
    sizeAttenuation: true,
    transparent: true,
    opacity: isKuiper ? 0.58 : 0.72,
    depthWrite: false,
    blending: AdditiveBlending
  });
  const belt = new Points(geometry, material);
  belt.name = data.name;
  belt.userData = data;
  scene.add(belt);
  clickableObjects.push(belt);
  return belt;
}

function createAsteroidBelt() {
  return createBelt(asteroidBeltData);
}

function createKuiperBelt() {
  return createBelt(kuiperBeltData);
}

function createSunSurfaceTexture() {
  const size = 512;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext('2d');

  // Base gradient — deep orange to bright yellow
  const radialGrad = ctx.createRadialGradient(size * 0.5, size * 0.48, 0, size * 0.5, size * 0.5, size * 0.5);
  radialGrad.addColorStop(0, '#fff9e6');
  radialGrad.addColorStop(0.25, '#ffe566');
  radialGrad.addColorStop(0.55, '#ffb020');
  radialGrad.addColorStop(0.78, '#e87820');
  radialGrad.addColorStop(1, '#b84010');
  ctx.fillStyle = radialGrad;
  ctx.fillRect(0, 0, size, size);

  // Granulation cells — sun surface convection pattern
  for (let i = 0; i < 280; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 6 + Math.random() * 22;
    const brightness = 0.55 + Math.random() * 0.45;
    const isDark = Math.random() < 0.3;
    const alpha = 0.08 + Math.random() * 0.14;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (isDark) {
      ctx.fillStyle = `rgba(140, 50, 5, ${alpha})`;
    } else {
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha * brightness})`;
    }
    ctx.fill();
  }

  // Bright plage / faculae regions
  for (let i = 0; i < 18; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 8 + Math.random() * 30;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(255, 255, 200, 0.22)');
    grad.addColorStop(0.5, 'rgba(255, 240, 120, 0.10)');
    grad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Subtle spicule-like dark lanes
  for (let i = 0; i < 60; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const length = 10 + Math.random() * 40;
    const angle = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
    ctx.strokeStyle = `rgba(120, 40, 5, ${0.06 + Math.random() * 0.10})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.stroke();
  }

  const texture = new CanvasTexture(textureCanvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function createSun() {
  // Main sun body with procedural surface texture
  const sunTexture = createSunSurfaceTexture();
  const sun = new Mesh(
    new SphereGeometry(5, 64, 64),
    new MeshBasicMaterial({ map: sunTexture })
  );
  sun.name = '太阳';
  sun.userData = { type: 'sun', name: '太阳' };
  scene.add(sun);
  clickableObjects.push(sun);
  sunMeshes.push(sun);

  // Solar corona — screen-facing radial-gradient Sprite (no sphere-shell edges, no perspective banding)
  // Note: All SphereGeometry-based glow shells were removed; they created flattened elliptical
  // bands when viewed from any angle other than head-on. The Sprite stays screen-facing at
  // all times, producing a clean radial glow without perspective artifacts.
  const coronaTextureCanvas = document.createElement('canvas');
  coronaTextureCanvas.width = 512;
  coronaTextureCanvas.height = 512;
  const coronaCtx = coronaTextureCanvas.getContext('2d');
  const cx = 256, cy = 256, maxR = 256;
  const coronaGrad = coronaCtx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  coronaGrad.addColorStop(0,    'rgba(255, 245, 160, 0.80)');
  coronaGrad.addColorStop(0.15, 'rgba(255, 220,  80, 0.50)');
  coronaGrad.addColorStop(0.40, 'rgba(255, 180,  40, 0.20)');
  coronaGrad.addColorStop(0.70, 'rgba(255, 140,  20, 0.07)');
  coronaGrad.addColorStop(1.0,  'rgba(255, 100,   0, 0.00)');
  coronaCtx.beginPath();
  coronaCtx.arc(cx, cy, maxR, 0, Math.PI * 2);
  coronaCtx.fillStyle = coronaGrad;
  coronaCtx.fill();

  const coronaTexture = new CanvasTexture(coronaTextureCanvas);
  coronaTexture.colorSpace = SRGBColorSpace;
  const coronaSprite = new Sprite(
    new SpriteMaterial({
      map: coronaTexture,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    })
  );
  coronaSprite.scale.set(52, 52, 1);
  coronaSprite.renderOrder = -1;
  scene.add(coronaSprite);
  sunMeshes.push(coronaSprite);

  return sun;
}

function createOrbitRing(distance) {
  const curve = new EllipseCurve(0, 0, distance, distance, 0, Math.PI * 2, false, 0);
  const points = curve.getPoints(180).map((point) => new Vector3(point.x, 0, point.y));
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color: 0x6f86b8, transparent: true, opacity: 0.58 });
  const orbit = new LineLoop(geometry, material);
  scene.add(orbit);
}

function createLocalOrbitRing(distance) {
  const curve = new EllipseCurve(0, 0, distance, distance, 0, Math.PI * 2, false, 0);
  const points = curve.getPoints(96).map((point) => new Vector3(point.x, 0, point.y));
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color: 0xbfc8d8, transparent: true, opacity: 0.52 });
  return new LineLoop(geometry, material);
}

function createPlanetTexture(baseColor) {
  const size = 128;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext('2d');
  const base = new Color(baseColor);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 9) {
    const alpha = 0.1 + Math.random() * 0.14;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, y + Math.sin(y) * 4, size, 2 + Math.random() * 4);
  }
  for (let i = 0; i < 34; i += 1) {
    ctx.fillStyle = `rgba(0,0,0,${0.035 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 7, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new CanvasTexture(textureCanvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function createPlanet(data) {
  createOrbitRing(data.distance);
  const orbitGroup = new Group();
  orbitGroup.rotation.y = Math.random() * Math.PI * 2;
  scene.add(orbitGroup);

  const planet = new Mesh(
    new SphereGeometry(data.radius, 48, 48),
    new MeshStandardMaterial({
      map: createPlanetTexture(data.color),
      roughness: 0.72,
      metalness: 0.02,
      emissive: new Color(data.color).multiplyScalar(0.12),
      emissiveIntensity: 0.18
    })
  );
  planet.position.x = data.distance;
  planet.rotation.z = data.tilt;
  planet.userData = data;
  orbitGroup.add(planet);

  // Labels shown on hover only — no persistent labels
  createLabel(planet, data.name, data.radius);

  if (data.englishName === 'Earth') {
    const atmosphere = new Mesh(
      new SphereGeometry(data.radius * 1.08, 48, 48),
      new MeshBasicMaterial({ color: 0x79c9ff, transparent: true, opacity: 0.17, blending: AdditiveBlending, depthWrite: false })
    );
    planet.add(atmosphere);

    const moonGroup = new Group();
    moonGroup.position.copy(planet.position);
    moonGroup.add(createLocalOrbitRing(moonData.distance));
    const moon = new Mesh(
      new SphereGeometry(moonData.radius, 32, 32),
      new MeshStandardMaterial({
        map: createPlanetTexture(moonData.color),
        roughness: 0.88,
        emissive: 0x566073,
        emissiveIntensity: 0.18
      })
    );
    moon.position.x = moonData.distance;
    moon.userData = moonData;
    moon.name = '月球';
    moonGroup.add(moon);
    orbitGroup.add(moonGroup);
    clickableObjects.push(moon);
    planetObjects.push({ mesh: moon, orbitGroup: moonGroup, orbitSpeed: moonData.orbitSpeed, spinSpeed: moonData.spinSpeed, isMoon: true });
    createLabel(moon, moonData.name, moonData.radius);
  }

  if (data.englishName === 'Saturn') {
    const ring = new Mesh(
      new RingGeometry(data.radius * 1.35, data.radius * 2.15, 96),
      new MeshStandardMaterial({ color: 0xf0daa0, transparent: true, opacity: 0.72, side: DoubleSide, roughness: 0.62, emissive: 0x3b321f, emissiveIntensity: 0.18 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = 0.25;
    planet.add(ring);
  }

  clickableObjects.push(planet);
  planetObjects.push({ mesh: planet, orbitGroup, orbitSpeed: data.orbitSpeed, spinSpeed: data.spinSpeed });
}

function setInfo(data) {
  if (data === overviewInfo) {
    infoCard.innerHTML = `<h2>${data.name}</h2><p>${data.fact}</p><dl><div><dt>视角模式</dt><dd>自由总览</dd></div><div><dt>时间流速</dt><dd>${formatTimeScale(timeScale)}</dd></div></dl><small>比例经过夸张处理，便于同时看到主要轨道。</small>`;
    return;
  }
  if (data.type === 'asteroidBelt') {
    infoCard.innerHTML = `<h2>${data.name} <small>${data.englishName}</small></h2><p>${data.fact}</p><dl><div><dt>小行星数量</dt><dd>~${data.count} 颗（示意）</dd></div><div><dt>轨道范围</dt><dd>${data.innerDistance}–${data.outerDistance} AU</dd></div></dl><small>小行星带位于火星（28 AU）与木星（40 AU）之间，在本演示中经可视化夸张。</small>`;
    return;
  }
  if (data.type === 'kuiperBelt') {
    infoCard.innerHTML = `<h2>${data.name} <small>${data.englishName}</small></h2><p>${data.fact}</p><dl><div><dt>冰冻天体数量</dt><dd>~${data.count} 颗（示意）</dd></div><div><dt>轨道范围</dt><dd>${data.innerDistance}–${data.outerDistance} AU</dd></div></dl><small>柯伊伯带位于海王星轨道之外，距离太阳约 30–50 天文单位，是太阳系最外层的冰冻小天体密集区。</small>`;
    return;
  }
  if (data.type === 'moon') {
    infoCard.innerHTML = `<h2>${data.name} <small>${data.englishName}</small></h2><p>${data.fact}</p><dl><div><dt>绕行对象</dt><dd>地球</dd></div><div><dt>展示轨道半径</dt><dd>${data.distance.toFixed(1)} AU*</dd></div><div><dt>相对半径</dt><dd>${data.radius.toFixed(2)}</dd></div><div><dt>轨道周期</dt><dd>${data.orbitalPeriod} 天</dd></div><div><dt>自转周期</dt><dd>${data.rotationPeriod} 天</dd></div><div><dt>直径</dt><dd>${data.diameter}</dd></div></dl><small>*月球尺寸和轨道同样经过可视化夸张，方便交互拾取。</small>`;
    return;
  }
  if (data.type === 'sun') {
    infoCard.innerHTML = `<h2>${data.name} <small>太阳</small></h2><p>太阳是一颗黄矮星，表面温度约 5,500°C，核心温度高达 1,500 万°C。它占太阳系总质量的 99.86%，以强大的引力束缚着所有行星。</p><dl><div><dt>类型</dt><dd>黄矮星 (G2V)</dd></div><div><dt>直径</dt><dd>~1,392,700 km</dd></div><div><dt>表面温度</dt><dd>~5,500°C</dd></div><div><dt>核心温度</dt><dd>~15,000,000°C</dd></div></dl>`;
    return;
  }
  infoCard.innerHTML = `<h2>${data.name} <small>${data.englishName}</small></h2><p>${data.fact}</p><dl><div><dt>展示距离</dt><dd>${data.distance} AU*</dd></div><div><dt>相对半径</dt><dd>${data.radius.toFixed(2)}</dd></div><div><dt>轨道周期</dt><dd>${data.orbitalPeriod} 地球年</dd></div><div><dt>自转周期</dt><dd>${data.rotationPeriod} 天</dd></div><div><dt>直径</dt><dd>${data.diameter}</dd></div></dl><small>*为便于观察，距离和半径不是严格真实比例。</small>`;
}

function setTourCaption(caption, isVisible) {
  let captionEl = document.querySelector('.tour-caption');
  if (!isVisible) {
    if (captionEl) {
      captionEl.style.opacity = '0';
      setTimeout(() => captionEl?.remove(), 500);
    }
    return;
  }
  if (!captionEl) {
    captionEl = document.createElement('div');
    captionEl.className = 'tour-caption';
    captionEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(captionEl);
  }
  captionEl.textContent = caption;
  captionEl.style.opacity = '1';
}

function setTourInfo(shot) {
  const caption = shot.caption || '';
  setTourCaption(caption, true);
  infoCard.innerHTML = `<h2>电影导览：${shot.name}</h2><p>${shot.note || caption}</p><dl><div><dt>镜头</dt><dd>${cinematicTour.shotIndex + 1}/${cinematicTour.shots.length}</dd></div><div><dt>控制</dt><dd>点击按钮或拖拽画面退出</dd></div></dl><small>导览会依次经过太阳系各站，请欣赏。</small>`;
  tourStatus.textContent = `正在导览：${shot.name}`;
}

function getTourFocus(shot) {
  if (shot.type === 'overview') {
    return { target: shot.target.clone(), position: shot.position.clone() };
  }

  if (shot.type === 'outer') {
    const uranus = clickableObjects.find((mesh) => mesh.userData.englishName === 'Uranus');
    const neptune = clickableObjects.find((mesh) => mesh.userData.englishName === 'Neptune');
    const target = new Vector3();
    if (uranus && neptune) {
      uranus.getWorldPosition(target);
      neptune.getWorldPosition(reusableWorldPosition);
      target.add(reusableWorldPosition).multiplyScalar(0.5);
    }
    return { target, position: target.clone().add(shot.offset) };
  }

  if (shot.type === 'dual') {
    const obj1 = clickableObjects.find((mesh) => mesh.userData.englishName === shot.objects[0]);
    const obj2 = clickableObjects.find((mesh) => mesh.userData.englishName === shot.objects[1]);
    const target = new Vector3();
    if (obj1 && obj2) {
      obj1.getWorldPosition(target);
      obj2.getWorldPosition(reusableWorldPosition);
      target.add(reusableWorldPosition).multiplyScalar(0.5);
    } else if (obj1) {
      obj1.getWorldPosition(target);
    }
    return { target, position: target.clone().add(shot.offset) };
  }

  if (shot.isSun) {
    return { target: new Vector3(0, 0, 0), position: new Vector3(10, 6, 12) };
  }

  const object = clickableObjects.find((mesh) => mesh.userData.englishName === shot.object);
  const target = new Vector3();
  if (object) object.getWorldPosition(target);
  return { target, position: target.clone().add(shot.offset) };
}

function startTourShot(index, duration = 1600) {
  cinematicTour.shotIndex = index % cinematicTour.shots.length;
  cinematicTour.shotStartedAt = performance.now();
  const shot = cinematicTour.shots[cinematicTour.shotIndex];
  const focus = getTourFocus(shot);
  selectedPlanet = null;
  setTourInfo(shot);
  updateLegendSelection(null);
  startViewTransition(focus.position, focus.target, duration);
}

function startTour() {
  cinematicTour.active = true;
  controls.enabled = false;
  tourButton.textContent = '停止电影导览';
  tourButton.setAttribute('aria-pressed', 'true');
  startTourShot(0, 1800);
}

function stopTour(returnToOverview = false) {
  if (!cinematicTour.active) return;
  cinematicTour.active = false;
  controls.enabled = true;
  tourButton.textContent = '开启电影导览';
  tourButton.setAttribute('aria-pressed', 'false');
  tourStatus.textContent = '自由探索模式';
  setTourCaption('', false);
  if (returnToOverview) selectOverview();
}

function updateTour(now) {
  if (!cinematicTour.active) return;
  const elapsed = now - cinematicTour.shotStartedAt;
  const shot = cinematicTour.shots[cinematicTour.shotIndex];
  const focus = getTourFocus(shot);

  // Smooth camera tracking throughout the shot
  controls.target.lerp(focus.target, 0.028);
  camera.position.lerp(focus.position, 0.016);

  // Transition to next shot after full duration + hold
  if (elapsed > cinematicTour.shotDuration + cinematicTour.holdDuration) {
    startTourShot(cinematicTour.shotIndex + 1);
  }
}

function renderLegend() {
  const overviewButton = '<button type="button" data-view="overview" class="selected" title="查看太阳系总览"><span class="overview-dot"></span>总览</button>';
  const planetButtons = planetData.map((planet) => `<button type="button" data-planet="${planet.englishName}" title="聚焦${planet.name}（${planet.englishName}）"><span style="background:#${new Color(planet.color).getHexString()}"></span>${planet.name}</button>`).join('');
  const moonButton = `<button type="button" data-planet="${moonData.englishName}" title="聚焦${moonData.name}（${moonData.englishName}）"><span style="background:#${new Color(moonData.color).getHexString()}"></span>${moonData.name}</button>`;
  const asteroidBeltButton = `<button type="button" data-belt="asteroidBelt" title="聚焦小行星带"><span style="background:#c8b89a"></span>小行星带</button>`;
  const kuiperBeltButton = `<button type="button" data-belt="kuiperBelt" title="聚焦柯伊伯带"><span style="background:#90d8f0"></span>柯伊伯带</button>`;
  legend.innerHTML = overviewButton + planetButtons + moonButton + asteroidBeltButton + kuiperBeltButton;
  legend.addEventListener('click', (event) => {
    const overview = event.target.closest('button[data-view="overview"]');
    if (overview) {
      stopTour(false);
      selectOverview();
      return;
    }
    const beltButton = event.target.closest('button[data-belt]');
    if (beltButton) {
      stopTour(false);
      const belt = beltButton.dataset.belt === 'asteroidBelt' ? asteroidBelt : kuiperBelt;
      if (belt) selectBelt(belt);
      return;
    }
    const button = event.target.closest('button[data-planet]');
    if (!button) return;
    stopTour(false);
    const planet = clickableObjects.find((mesh) => mesh.userData.englishName === button.dataset.planet);
    if (planet) selectPlanet(planet);
  });
}

function updateLegendSelection(selectedName = null) {
  document.querySelectorAll('.legend button').forEach((button) => {
    const isOverview = button.dataset.view === 'overview' && selectedName === null;
    const isPlanet = button.dataset.planet === selectedName;
    const isBelt = button.dataset.belt === selectedName;
    button.classList.toggle('selected', isOverview || isPlanet || isBelt);
  });
}

function selectOverview() {
  stopTour(false);
  selectedPlanet = null;
  setInfo(overviewInfo);
  updateLegendSelection(null);
  startViewTransition(overviewCameraPosition, overviewTarget, 1100);
}

function selectBelt(belt) {
  stopTour(false);
  selectedPlanet = null;
  setInfo(belt.userData);
  const worldPosition = new Vector3();
  belt.getWorldPosition(worldPosition);
  const offset = new Vector3(0, 14, 38);
  startViewTransition(worldPosition.clone().add(offset), worldPosition, 900);
  updateLegendSelection(belt.userData.type);
}

function selectPlanet(planet) {
  stopTour(false);
  selectedPlanet = planet;
  setInfo(planet.userData);
  const worldPosition = new Vector3();
  planet.getWorldPosition(worldPosition);
  startViewTransition(getFocusCameraPosition(worldPosition, planet.userData), worldPosition, 900);
  updateLegendSelection(planet.userData.englishName);
}

const raycaster = new Raycaster();
const pointer = new Vector2();

function updateHover() {
  pointer.x = (pointer.x !== undefined ? pointer.x : 0);
  pointer.y = (pointer.y !== undefined ? pointer.y : 0);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickableObjects, false);
  lastHoveredObject = hoveredObject;
  hoveredObject = hits.length > 0 ? hits[0].object : null;

  // Update cursor style
  if (hoveredObject) {
    canvas.style.cursor = 'pointer';
  } else {
    canvas.style.cursor = 'grab';
  }
}

function handlePointerDown(event) {
  if (cinematicTour.active) stopTour(false);
  pointerDownPosition = { x: event.clientX, y: event.clientY };
}

function handlePointerUp(event) {
  if (!pointerDownPosition) return;
  const moved = Math.hypot(event.clientX - pointerDownPosition.x, event.clientY - pointerDownPosition.y);
  pointerDownPosition = null;
  if (moved > 5) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickableObjects, false)[0];
  if (!hit) {
    selectOverview();
    return;
  }
  if (hit.object.userData.type === 'sun') {
    selectOverview();
    setInfo({ type: 'sun', name: '太阳' });
    return;
  }
  if (hit.object.userData.type === 'asteroidBelt' || hit.object.userData.type === 'kuiperBelt') {
    selectBelt(hit.object);
    return;
  }
  selectPlanet(hit.object);
}

function handlePointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  updateHover();
}

function handleTouchStart(event) {
  if (cinematicTour.active) stopTour(false);
  if (event.touches.length === 1) {
    pointerDownPosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
}

function handleTouchEnd(event) {
  if (!pointerDownPosition) return;
  if (event.changedTouches.length < 1) return;
  const touch = event.changedTouches[0];
  const moved = Math.hypot(touch.clientX - pointerDownPosition.x, touch.clientY - pointerDownPosition.y);
  pointerDownPosition = null;
  if (moved > 8) return;

  pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickableObjects, false)[0];
  if (!hit) {
    selectOverview();
    return;
  }
  if (hit.object.userData.type === 'sun') {
    selectOverview();
    setInfo({ type: 'sun', name: '太阳' });
    return;
  }
  if (hit.object.userData.type === 'asteroidBelt' || hit.object.userData.type === 'kuiperBelt') {
    selectBelt(hit.object);
    return;
  }
  selectPlanet(hit.object);
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateLabels();
}

function setTimeScale(nextScale) {
  timeScale = Number(nextScale.toFixed(2));
  speedSlider.value = String(timeScale);
  speedOutput.value = formatTimeScale(timeScale);
  if (!selectedPlanet) setInfo(overviewInfo);
}

speedSlider.addEventListener('input', () => setTimeScale(Number(speedSlider.value)));
tourButton.addEventListener('click', () => {
  if (cinematicTour.active) {
    stopTour(true);
  } else {
    startTour();
  }
});

makeStarField();
const sun = createSun();
asteroidBelt = createAsteroidBelt();
kuiperBelt = createKuiperBelt();
planetData.forEach(createPlanet);
renderLegend();
setInfo(overviewInfo);

renderer.domElement.addEventListener('pointerdown', handlePointerDown);
renderer.domElement.addEventListener('pointerup', handlePointerUp);
renderer.domElement.addEventListener('pointermove', handlePointerMove);
renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
renderer.domElement.addEventListener('touchend', handleTouchEnd, { passive: true });
controls.addEventListener('change', updateLabels);
window.addEventListener('resize', handleResize);

// Overview button (was preset-overview, inner/outer removed)
document.querySelector('#preset-overview')?.addEventListener('click', () => {
  stopTour(false);
  selectOverview();
});

const clock = new Clock();

function animate() {
  const delta = clock.getDelta();
  const now = performance.now();
  const frameScale = delta * 60 * timeScale;

  // Sun animation — rotation + breathing corona pulse
  const pulseFactor = Math.sin(now * 0.0007);
  sunMeshes.forEach((mesh, i) => {
    if (i === 0) {
      // Sun body slow rotation
      mesh.rotation.y += delta * 0.06 * timeScale;
    } else if (i === 1) {
      // Inner glow breathing pulse
      mesh.scale.setScalar(1 + pulseFactor * 0.045);
      mesh.rotation.y += delta * 0.09 * timeScale;
    } else if (i === 2) {
      mesh.rotation.y -= delta * 0.04 * timeScale;
    } else if (i === 3) {
      mesh.scale.setScalar(1 + pulseFactor * 0.025);
      mesh.rotation.y += delta * 0.025 * timeScale;
    } else if (i === 4) {
      mesh.scale.setScalar(1 + Math.sin(now * 0.0004) * 0.02);
      mesh.rotation.y += delta * 0.015 * timeScale;
    } else {
      // Corona sprite drift — slow rotation
      mesh.rotation.z += delta * (0.015 + (i % 4) * 0.005) * timeScale;
    }
  });

  if (asteroidBelt) {
    asteroidBelt.rotation.y += delta * 0.018 * timeScale;
  }
  if (kuiperBelt) {
    kuiperBelt.rotation.y += delta * 0.006 * timeScale;
  }
  planetObjects.forEach((object) => {
    object.orbitGroup.rotation.y += object.orbitSpeed * (object.isMoon ? 1 : 1.35) * frameScale;
    object.mesh.rotation.y += object.spinSpeed * frameScale;
  });

  updateViewTransition(now);
  updateTour(now);
  updateHover();

  if (selectedPlanet && !cameraTransition.active) {
    selectedPlanet.getWorldPosition(reusableWorldPosition);
    reusableFollowDelta.subVectors(reusableWorldPosition, controls.target);
    camera.position.add(reusableFollowDelta);
    controls.target.copy(reusableWorldPosition);
  } else if (selectedPlanet && cameraTransition.active) {
    selectedPlanet.getWorldPosition(cameraTransition.endTarget);
    cameraTransition.endPosition.copy(getFocusCameraPosition(cameraTransition.endTarget, selectedPlanet.userData));
  }

  controls.update();
  updateLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
