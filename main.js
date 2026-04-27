// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// If you have local modules, import them with explicit .js extensions:
// import { initScene } from './core/SceneManager.js';

let renderer, scene, camera, composer;
let activeObjects = []; // track objects added to the scene

function init() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05020a);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 4);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Particles (example)
  initParticles();

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  // Postprocessing / Bloom
  initBloom();

  window.addEventListener('resize', onWindowResize);
  animate();
}

function initParticles() {
  const particles = new THREE.BufferGeometry();
  const count = 600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.06, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(particles, material);
  points.name = 'particleField';
  scene.add(points);
  activeObjects.push(points);
}

function initBloom() {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const params = { strength: 0.9, radius: 0.4, threshold: 0.1 };
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.strength, params.radius, params.threshold);
  composer.addPass(bloomPass);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
}

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) material.forEach(m => m.dispose && m.dispose());
  else material.dispose && material.dispose();
}

function clearScene() {
  // Remove and dispose objects tracked in activeObjects
  activeObjects.forEach(obj => {
    if (!obj) return;
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose && obj.geometry.dispose();
    if (obj.material) disposeMaterial(obj.material);
    if (obj.material && obj.material.map) obj.material.map.dispose && obj.material.map.dispose();
  });
  activeObjects = [];
}

function playDemo() {
  // Clear previous demo objects to avoid accumulation
  clearScene();

  // Triangle: ExtrudeGeometry for a volumetric feel
  const shape = new THREE.Shape();
  shape.moveTo(0, 1);
  shape.lineTo(-0.866, -0.5);
  shape.lineTo(0.866, -0.5);
  shape.closePath();

  const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.computeBoundingBox();
  geometry.center();

  const material = new THREE.MeshStandardMaterial({ color: 0xff5ea5, metalness: 0.2, roughness: 0.3, emissive: 0x220022, emissiveIntensity: 0.4 });
  const tri = new THREE.Mesh(geometry, material);
  tri.position.set(0, 0.5, 0);
  tri.rotation.x = -0.2;

  // Label (simple sprite)
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.font = '48px sans-serif';
  ctx.fillText('180 Degrees', 20, 80);
  const tex = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: tex });
  const label = new THREE.Sprite(spriteMat);
  label.scale.set(2.0, 0.5, 1);
  label.position.set(0, 1.6, 0);

  tri.name = 'demoTriangle';
  label.name = 'demoLabel';

  scene.add(tri, label);
  activeObjects.push(tri, label);
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate particle field slowly
  const particleField = scene.getObjectByName('particleField');
  if (particleField) particleField.rotation.y += 0.0008;

  // Rotate active demo objects
  activeObjects.forEach(o => {
    if (o && o.rotation) o.rotation.y += 0.009;
  });

  // Render via composer so bloom is applied
  if (composer) composer.render();
  else renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  const solveBtn = document.getElementById('solveBtn');
  if (solveBtn) solveBtn.addEventListener('click', playDemo);
});
