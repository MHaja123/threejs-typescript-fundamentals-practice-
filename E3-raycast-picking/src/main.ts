import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

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

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
  new THREE.Vector2(
    window.innerWidth,
    window.innerHeight,
  ),
  scene,
  camera,
);

outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 0.5;
outlinePass.edgeThickness = 2;
outlinePass.visibleEdgeColor.set(0xffff00);
outlinePass.hiddenEdgeColor.set(0xff8800);

composer.addPass(outlinePass);

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

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 10),
  new THREE.MeshStandardMaterial({
    color: 0x6f7f72,
    roughness: 0.9,
  }),
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

const objectNames: string[] = [
  "Red Cube",
  "Green Sphere",
  "Blue Cylinder",
  "Yellow Cone",
  "Purple Torus",
  "Pink Dodecahedron",
];

const colors: number[] = [
  0xe85d75,
  0x44aa88,
  0x4d96ff,
  0xffc857,
  0x9b5de5,
  0xf28482,
];

const selectableObjects: THREE.Object3D[] = [];

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

  mesh.name = objectNames[index];
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  selectableObjects.push(mesh);
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

const selectionLabel = document.createElement("div");
selectionLabel.className = "selection-label";
selectionLabel.textContent = "Selected: None";
document.body.appendChild(selectionLabel);

const instruction = document.createElement("div");
instruction.className = "instruction";
instruction.textContent =
  "Click an object to select it • Drag to orbit • Scroll to zoom";

document.body.appendChild(instruction);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let pointerDownX = 0;
let pointerDownY = 0;

renderer.domElement.addEventListener(
  "pointerdown",
  (event: PointerEvent) => {
    pointerDownX = event.clientX;
    pointerDownY = event.clientY;
  },
);

renderer.domElement.addEventListener(
  "pointerup",
  (event: PointerEvent) => {
    const movementX = event.clientX - pointerDownX;
    const movementY = event.clientY - pointerDownY;
    const movementDistance = Math.hypot(
      movementX,
      movementY,
    );

    if (movementDistance > 5) {
      return;
    }

    const canvasBounds =
      renderer.domElement.getBoundingClientRect();

    pointer.x =
      ((event.clientX - canvasBounds.left) /
        canvasBounds.width) *
        2 -
      1;

    pointer.y =
      -(
        (event.clientY - canvasBounds.top) /
        canvasBounds.height
      ) *
        2 +
      1;

    raycaster.setFromCamera(pointer, camera);

    const intersections = raycaster.intersectObjects(
      selectableObjects,
      false,
    );

    if (intersections.length > 0) {
      const selectedObject = intersections[0].object;

      outlinePass.selectedObjects = [selectedObject];

      selectionLabel.textContent =
        `Selected: ${selectedObject.name}`;

      console.log(`Selected: ${selectedObject.name}`);
    } else {
      outlinePass.selectedObjects = [];
      selectionLabel.textContent = "Selected: None";

      console.log("Selection cleared");
    }
  },
);

function animate(): void {
  requestAnimationFrame(animate);

  controls.update();
  composer.render();
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

  composer.setSize(
    window.innerWidth,
    window.innerHeight,
  );

  outlinePass.setSize(
    window.innerWidth,
    window.innerHeight,
  );
});