import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
  makeCabinet,
  type CabinetOptions,
} from "./cabinet";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d232b);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);

camera.position.set(12, 8, 18);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight,
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2),
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(
  camera,
  renderer.domElement,
);

controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(
  0xffffff,
  0.7,
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  3,
);

directionalLight.position.set(8, 12, 8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;

scene.add(directionalLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(35, 12),
  new THREE.MeshStandardMaterial({
    color: 0x59636a,
    roughness: 0.95,
  }),
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

const configurations: CabinetOptions[] = [
  {
    w: 1.2,
    h: 2.2,
    d: 0.65,
    doors: 1,
    vents: false,
  },
  {
    w: 1.6,
    h: 2.4,
    d: 0.7,
    doors: 2,
    vents: true,
  },
  {
    w: 1.9,
    h: 2,
    d: 0.75,
    doors: 3,
    vents: false,
  },
  {
    w: 1.4,
    h: 2.8,
    d: 0.7,
    doors: 2,
    vents: true,
  },
  {
    w: 2.2,
    h: 2.5,
    d: 0.85,
    doors: 4,
    vents: true,
  },
  {
    w: 1,
    h: 1.8,
    d: 0.55,
    doors: 1,
    vents: true,
  },
];

const cabinetRow = new THREE.Group();
cabinetRow.name = "Cabinet Row";

scene.add(cabinetRow);

const spacing = 0.75;

const totalWidth =
  configurations.reduce(
    (sum, options) => sum + options.w,
    0,
  ) +
  spacing * (configurations.length - 1);

let nextPositionX = -totalWidth / 2;

configurations.forEach((options, index) => {
  const cabinet = makeCabinet(options);

  cabinet.position.x =
    nextPositionX + options.w / 2;

  cabinet.position.y = options.h / 2;
  cabinet.name = `Cabinet ${index + 1}`;

  cabinetRow.add(cabinet);

  nextPositionX += options.w + spacing;
});

const title = document.createElement("div");
title.className = "title";
title.textContent = "Parametric Cabinet Generator";

document.body.appendChild(title);

const details = document.createElement("div");
details.className = "details";
details.textContent =
  "6 cabinets generated from different parameters";

document.body.appendChild(details);

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