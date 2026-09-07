import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202530);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);

camera.position.set(7, 6, 9);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(
  camera,
  renderer.domElement,
);

controls.enableDamping = true;
controls.target.set(0, 0.75, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(
  0xffffff,
  0.6,
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  2.5,
);

directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const groundGeometry = new THREE.PlaneGeometry(14, 10);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x6f7f72,
  roughness: 0.9,
});

const ground = new THREE.Mesh(
  groundGeometry,
  groundMaterial,
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const geometries: THREE.BufferGeometry[] = [
  new THREE.BoxGeometry(1.3, 1.3, 1.3),
  new THREE.SphereGeometry(0.75, 32, 16),
  new THREE.CylinderGeometry(0.65, 0.65, 1.5, 32),
  new THREE.ConeGeometry(0.75, 1.6, 32),
  new THREE.TorusGeometry(0.6, 0.22, 16, 48),
  new THREE.DodecahedronGeometry(0.8),
];

const names: string[] = [
  "Cube",
  "Sphere",
  "Cylinder",
  "Cone",
  "Torus",
  "Dodecahedron",
];

const colors: number[] = [
  0xe85d75,
  0x44aa88,
  0x4d96ff,
  0xffc857,
  0x9b5de5,
  0xf28482,
];

geometries.forEach((geometry, index) => {
  const material = new THREE.MeshStandardMaterial({
    color: colors[index],
    roughness: 0.45,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);

  const column = index % 3;
  const row = Math.floor(index / 3);

  mesh.position.x = (column - 1) * 3;
  mesh.position.y = 0.85;
  mesh.position.z = (row - 0.5) * 3;

  mesh.name = names[index];
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);
});

const gridHelper = new THREE.GridHelper(
  14,
  14,
  0x444444,
  0x444444,
);

gridHelper.position.y = 0.002;
scene.add(gridHelper);

function animate(): void {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2),
  );
});