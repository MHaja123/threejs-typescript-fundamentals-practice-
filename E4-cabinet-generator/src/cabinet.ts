import * as THREE from "three";

export interface CabinetOptions {
  w: number;
  h: number;
  d: number;
  doors: number;
  vents: boolean;
}

function createPart(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    width,
    height,
    depth,
  );

  const mesh = new THREE.Mesh(geometry, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

export function makeCabinet({
  w,
  h,
  d,
  doors,
  vents,
}: CabinetOptions): THREE.Group {
  if (w <= 0 || h <= 0 || d <= 0) {
    throw new Error(
      "Cabinet dimensions must be greater than zero.",
    );
  }

  if (!Number.isInteger(doors) || doors < 1) {
    throw new Error(
      "Doors must be a positive integer.",
    );
  }

  const cabinet = new THREE.Group();

  cabinet.name = `${doors}-door cabinet`;
  cabinet.userData.options = {
    w,
    h,
    d,
    doors,
    vents,
  };

  const frameMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x52606d,
      roughness: 0.55,
      metalness: 0.3,
    });

  const doorMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x8fa3b8,
      roughness: 0.45,
      metalness: 0.25,
    });

  const darkMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x1c232b,
      roughness: 0.65,
      metalness: 0.45,
    });

  const smallestDimension = Math.min(w, h, d);
  const panelThickness = smallestDimension * 0.06;
  const backThickness = panelThickness * 0.6;
  const doorThickness = panelThickness * 0.7;
  const gap = Math.min(w, h) * 0.015;

  const leftPanel = createPart(
    panelThickness,
    h,
    d,
    frameMaterial,
  );

  leftPanel.position.x =
    -w / 2 + panelThickness / 2;

  cabinet.add(leftPanel);

  const rightPanel = createPart(
    panelThickness,
    h,
    d,
    frameMaterial,
  );

  rightPanel.position.x =
    w / 2 - panelThickness / 2;

  cabinet.add(rightPanel);

  const topPanel = createPart(
    w - panelThickness * 2,
    panelThickness,
    d,
    frameMaterial,
  );

  topPanel.position.y =
    h / 2 - panelThickness / 2;

  cabinet.add(topPanel);

  const bottomPanel = createPart(
    w - panelThickness * 2,
    panelThickness,
    d,
    frameMaterial,
  );

  bottomPanel.position.y =
    -h / 2 + panelThickness / 2;

  cabinet.add(bottomPanel);

  const backPanel = createPart(
    w - panelThickness * 2,
    h - panelThickness * 2,
    backThickness,
    frameMaterial,
  );

  backPanel.position.z =
    -d / 2 + backThickness / 2;

  cabinet.add(backPanel);

  const availableDoorWidth =
    w - panelThickness * 2 - gap * (doors + 1);

  const doorWidth = availableDoorWidth / doors;

  const doorHeight =
    h - panelThickness * 2 - gap * 2;

  for (let index = 0; index < doors; index += 1) {
    const door = createPart(
      doorWidth,
      doorHeight,
      doorThickness,
      doorMaterial,
    );

    door.position.x =
      -w / 2 +
      panelThickness +
      gap +
      doorWidth / 2 +
      index * (doorWidth + gap);

    door.position.z =
      d / 2 + doorThickness / 2;

    door.name = `Door ${index + 1}`;

    cabinet.add(door);

    const handleWidth = Math.max(
      doorWidth * 0.06,
      0.025,
    );

    const handleHeight = Math.max(
      doorHeight * 0.22,
      0.15,
    );

    const handle = createPart(
      handleWidth,
      handleHeight,
      doorThickness * 0.7,
      darkMaterial,
    );

    const handleDirection =
      index < doors / 2 ? 1 : -1;

    handle.position.x =
      door.position.x +
      handleDirection * doorWidth * 0.35;

    handle.position.z =
      d / 2 + doorThickness * 1.2;

    handle.name = `Handle ${index + 1}`;

    cabinet.add(handle);
  }

  if (vents) {
    const ventCount = 5;
    const ventWidth = w * 0.35;
    const ventHeight = Math.max(h * 0.012, 0.018);
    const ventSpacing = h * 0.045;

    for (
      let index = 0;
      index < ventCount;
      index += 1
    ) {
      const vent = createPart(
        ventWidth,
        ventHeight,
        doorThickness * 0.45,
        darkMaterial,
      );

      vent.position.y =
        h * 0.28 - index * ventSpacing;

      vent.position.z =
        d / 2 + doorThickness * 1.15;

      vent.name = `Vent ${index + 1}`;

      cabinet.add(vent);
    }
  }

  return cabinet;
}