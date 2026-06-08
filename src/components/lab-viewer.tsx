"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface LabEquipment {
  name: string;
  type: "beaker" | "flask" | "burner" | "tube" | "cylinder";
  position: [number, number, number];
  color: string;
  liquidColor?: string;
  liquidHeight?: number;
  label?: string;
}

interface ExperimentStep {
  id: string;
  text: string;
  action: string;
}

interface ReactionConfig {
  trigger: string;
  description: string;
  effect: string;
  targetColor?: string;
  bubbles?: boolean;
  smoke?: boolean;
  flame?: boolean;
}

interface ExperimentConfig {
  title: string;
  description: string;
  backgroundColor?: string;
  equipment: LabEquipment[];
  reactions?: ReactionConfig[];
  steps?: ExperimentStep[];
}

interface LabData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  config: string | null;
}

function createTileTexture(): THREE.CanvasTexture {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const tileSize = 64;
  for (let y = 0; y < size; y += tileSize) {
    for (let x = 0; x < size; x += tileSize) {
      const shade = 210 + Math.random() * 30;
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, tileSize - 2, tileSize - 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createBeaker(wallColor: string, radius = 0.2, height = 0.4, thickness = 0.015): THREE.Group {
  const g = new THREE.Group();
  const pts: THREE.Vector2[] = [];
  const r = radius;
  const h = height;
  const t = thickness;
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(r, 0));
  pts.push(new THREE.Vector2(r, 0.02));
  pts.push(new THREE.Vector2(r, h - 0.02));
  pts.push(new THREE.Vector2(r + 0.015, h - 0.005));
  pts.push(new THREE.Vector2(r + 0.015, h + 0.005));
  pts.push(new THREE.Vector2(r - t + 0.015, h + 0.005));
  pts.push(new THREE.Vector2(r - t, h - 0.005));
  pts.push(new THREE.Vector2(r - t, 0.02));
  pts.push(new THREE.Vector2(0, 0.02));
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: wallColor,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const geo = new THREE.LatheGeometry(pts, 24);
  const mesh = new THREE.Mesh(geo, glassMat);
  mesh.castShadow = true;
  g.add(mesh);

  // Measurement marks
  const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
  for (let i = 1; i <= 3; i++) {
    const my = (h * i) / 4;
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.003, 0.001), markMat);
    mark.position.set(r + 0.001, my, 0);
    g.add(mark);
  }

  return g;
}

function createFlask(wallColor: string): THREE.Group {
  const g = new THREE.Group();
  const pts: THREE.Vector2[] = [];
  // Bottom
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(0.22, 0));
  pts.push(new THREE.Vector2(0.22, 0.02));
  // Body (conical)
  pts.push(new THREE.Vector2(0.22, 0.15));
  pts.push(new THREE.Vector2(0.10, 0.30));
  // Neck
  pts.push(new THREE.Vector2(0.07, 0.30));
  pts.push(new THREE.Vector2(0.07, 0.40));
  // Lip
  pts.push(new THREE.Vector2(0.085, 0.40));
  pts.push(new THREE.Vector2(0.085, 0.425));
  pts.push(new THREE.Vector2(0.055, 0.425));
  pts.push(new THREE.Vector2(0.055, 0.40));
  // Inner neck
  pts.push(new THREE.Vector2(0.055, 0.30));
  pts.push(new THREE.Vector2(0.085, 0.30));
  pts.push(new THREE.Vector2(0.085, 0.15));
  // Inner body
  pts.push(new THREE.Vector2(0.205, 0.02));
  pts.push(new THREE.Vector2(0, 0.02));

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: wallColor,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), glassMat);
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}

function createGraduatedCylinder(wallColor: string): THREE.Group {
  const g = new THREE.Group();
  const pts: THREE.Vector2[] = [];
  const r = 0.18;
  const h = 0.35;
  const t = 0.015;
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(r, 0));
  pts.push(new THREE.Vector2(r, 0.02));
  pts.push(new THREE.Vector2(r, h - 0.02));
  pts.push(new THREE.Vector2(r + 0.01, h));
  pts.push(new THREE.Vector2(r - t + 0.01, h));
  pts.push(new THREE.Vector2(r - t, h - 0.02));
  pts.push(new THREE.Vector2(r - t, 0.02));
  pts.push(new THREE.Vector2(0, 0.02));

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: wallColor,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), glassMat);
  mesh.castShadow = true;
  g.add(mesh);

  // Measurement lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
  for (let i = 1; i <= 4; i++) {
    const my = (h * i) / 5;
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.002, 0.001), lineMat);
    l.position.set(r + 0.001, my, 0);
    g.add(l);
  }
  return g;
}

function createTestTube(wallColor: string): THREE.Group {
  const g = new THREE.Group();
  const pts: THREE.Vector2[] = [];
  const r = 0.05;
  const h = 0.35;
  const t = 0.008;
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(r, 0));
  pts.push(new THREE.Vector2(r, 0.01));
  pts.push(new THREE.Vector2(r, h - 0.02));
  pts.push(new THREE.Vector2(r + 0.008, h));
  pts.push(new THREE.Vector2(r - t + 0.008, h));
  pts.push(new THREE.Vector2(r - t, h - 0.02));
  pts.push(new THREE.Vector2(r - t, 0.01));
  pts.push(new THREE.Vector2(0, 0.01));

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: wallColor,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), glassMat);
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}

function createBurnerDetailed(): THREE.Group {
  const g = new THREE.Group();
  const metalMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.3 });
  const darkMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, metalness: 0.5, roughness: 0.4 });

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.04, 6), metalMat);
  base.position.y = 0.02;
  base.castShadow = true;
  g.add(base);

  // Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.18, 12), metalMat);
  barrel.position.y = 0.12;
  barrel.castShadow = true;
  g.add(barrel);

  // Air hole ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.008, 8, 16), darkMat);
  ring.position.y = 0.08;
  ring.rotation.x = Math.PI / 2;
  g.add(ring);

  // Gas inlet tube
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.12, 6), metalMat);
  tube.rotation.z = Math.PI / 2.5;
  tube.position.set(-0.10, 0.03, 0);
  g.add(tube);

  // Nozzle
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.02, 12), darkMat);
  nozzle.position.y = 0.2;
  g.add(nozzle);

  // Top rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.006, 8, 16), metalMat);
  rim.position.y = 0.205;
  rim.rotation.x = Math.PI / 2;
  g.add(rim);

  return g;
}

function createFlameGroup(): THREE.Group {
  const g = new THREE.Group();

  // Outer orange flame
  const outer = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.18, 8),
    new THREE.MeshBasicMaterial({
      color: 0xff8833,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  outer.position.y = 0.09;
  g.add(outer);

  // Middle yellow
  const middle = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.14, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  middle.position.y = 0.07;
  g.add(middle);

  // Inner blue cone
  const inner = new THREE.Mesh(
    new THREE.ConeGeometry(0.015, 0.08, 8),
    new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  inner.position.y = 0.04;
  g.add(inner);

  // Heat glow at base
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.position.y = 0.01;
  g.add(glow);

  return g;
}

function createLiquidBody(
  type: LabEquipment["type"],
  color: string,
  height: number,
  innerRadius: number,
  pos: [number, number, number],
): THREE.Mesh {
  let geo: THREE.BufferGeometry;
  const placedHeight = height;

  switch (type) {
    case "beaker":
      geo = new THREE.CylinderGeometry(innerRadius * 0.97, innerRadius * 0.97, placedHeight, 20);
      break;
    case "flask": {
      const pts: THREE.Vector2[] = [];
      const ih = placedHeight;
      pts.push(new THREE.Vector2(0, 0));
      pts.push(new THREE.Vector2(0.205, 0));
      pts.push(new THREE.Vector2(0.205, Math.min(ih, 0.15)));
      if (ih > 0.30) {
        pts.push(new THREE.Vector2(0.085, 0.30));
        pts.push(new THREE.Vector2(0.085, ih));
      } else {
        const midR = 0.205 - (0.205 - 0.085) * ((ih - 0.15) / 0.15);
        pts.push(new THREE.Vector2(midR, ih));
      }
      for (let i = pts.length - 1; i >= 0; i--) {
        pts.push(new THREE.Vector2(pts[i].x * 0.97, pts[i].y));
      }
      geo = new THREE.LatheGeometry(pts, 20);
      break;
    }
    case "cylinder":
      geo = new THREE.CylinderGeometry(innerRadius * 0.97, innerRadius * 0.97, placedHeight, 20);
      break;
    case "tube":
      geo = new THREE.CylinderGeometry(0.04, 0.04, placedHeight, 12);
      break;
    default:
      geo = new THREE.CylinderGeometry(0.12, 0.12, placedHeight, 16);
  }

  const mat = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.7,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 0.4,
    envMapIntensity: 0.5,
  });
  const mesh = new THREE.Mesh(geo, mat);

  const eqH = type === "beaker" ? 0.4 : type === "flask" ? 0.425 : type === "cylinder" ? 0.35 : 0.35;
  mesh.position.set(pos[0], pos[1] - eqH / 2 + placedHeight / 2 + 0.02, pos[2]);
  return mesh;
}

function createBubble(): THREE.Mesh {
  const r = 0.012 + Math.random() * 0.02;
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, 8, 8),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.2,
      roughness: 0,
      metalness: 0,
      envMapIntensity: 0.6,
    }),
  );
  return m;
}

function createSteamParticle(): THREE.Mesh {
  const r = 0.02 + Math.random() * 0.03;
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, 6, 6),
    new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  return m;
}

export function LabViewer({
  experiment,
  className,
}: {
  experiment: LabData;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ExperimentConfig | null>(null);
  const [reacting, setReacting] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const cfg = experiment.config;
    if (!cfg) return;
    try {
      setTimeout(() => setConfig(JSON.parse(cfg)), 0);
    } catch {
      // ignore
    }
  }, [experiment]);

  useEffect(() => {
    if (!containerRef.current || !config) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e0d8);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 15);
    camera.position.set(3.2, 2.2, 4.5);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.2, 0);
    controls.minDistance = 1.2;
    controls.maxDistance = 7;
    controls.maxPolarAngle = Math.PI / 2.05;

    // ── Environment ──

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshPhysicalMaterial({ map: createTileTexture(), roughness: 0.4, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall
    const wallMat = new THREE.MeshPhysicalMaterial({ color: 0xf0ebe3, roughness: 0.7 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.5), wallMat);
    wall.position.set(0, 1.75, -1.8);
    scene.add(wall);

    // Baseboard
    const bb = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.08, 0.05),
      new THREE.MeshPhysicalMaterial({ color: 0x5a4a3a, roughness: 0.6 }),
    );
    bb.position.set(0, 0.04, -1.77);
    scene.add(bb);

    // Left wall
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.5), wallMat);
    lw.position.set(-1.8, 1.75, 0);
    lw.rotation.y = Math.PI / 2;
    scene.add(lw);

    // Right wall
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.5), wallMat);
    rw.position.set(1.8, 1.75, 0);
    rw.rotation.y = -Math.PI / 2;
    scene.add(rw);

    // Ceiling
    const ceilMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f0e8, roughness: 0.6 });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), ceilMat);
    ceil.position.set(0, 3.5, 0);
    ceil.rotation.x = Math.PI / 2;
    scene.add(ceil);

    // ── Upper cabinets on back wall ──
    const cabMat = new THREE.MeshPhysicalMaterial({ color: 0xf8f4ee, roughness: 0.3 });
    const doorMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.05 });
    const handleMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.2 });
    for (let cx = -1.5; cx <= 1.5; cx += 1.1) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.25), cabMat);
      cab.position.set(cx, 2.6, -1.65);
      cab.castShadow = true;
      scene.add(cab);

      const door = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.6, 0.03), doorMat);
      door.position.set(cx - 0.2, 2.6, -1.52);
      scene.add(door);

      const door2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.6, 0.03), doorMat);
      door2.position.set(cx + 0.2, 2.6, -1.52);
      scene.add(door2);

      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), handleMat);
      h.position.set(cx - 0.2, 2.6, -1.49);
      scene.add(h);
      const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), handleMat);
      h2.position.set(cx + 0.2, 2.6, -1.49);
      scene.add(h2);
    }

    // Counter top below cabinets
    const counterMat = new THREE.MeshPhysicalMaterial({ color: 0x6a5a4a, roughness: 0.4 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(8, 0.04, 0.35), counterMat);
    counter.position.set(0, 1.82, -1.62);
    scene.add(counter);

    // ── Fluorescent light fixture ──
    const fixtureMat = new THREE.MeshPhysicalMaterial({ color: 0xdddddd, metalness: 0.3, roughness: 0.3 });
    const fixture = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.2), fixtureMat);
    fixture.position.set(0, 3.48, -0.8);
    scene.add(fixture);

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffee,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const glowPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.12), glowMat);
    glowPanel.position.set(0, 3.46, -0.8);
    scene.add(glowPanel);

    // Light from fixture
    const fixLight = new THREE.PointLight(0xffffee, 1.5, 5);
    fixLight.position.set(0, 3.4, -0.8);
    scene.add(fixLight);
    const fixLight2 = new THREE.PointLight(0xffffee, 0.8, 4);
    fixLight2.position.set(-0.5, 3.4, -0.8);
    scene.add(fixLight2);
    const fixLight3 = new THREE.PointLight(0xffffee, 0.8, 4);
    fixLight3.position.set(0.5, 3.4, -0.8);
    scene.add(fixLight3);

    // ── Window on left wall ──
    const windowFrameMat = new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.2, roughness: 0.3 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.8), windowFrameMat);
    frame.position.set(-1.78, 1.8, 1.0);
    scene.add(frame);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88bbee,
      transparent: true,
      opacity: 0.3,
      roughness: 0,
      metalness: 0,
      envMapIntensity: 0.1,
    });
    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), glassMat);
    windowGlass.position.set(-1.77, 1.8, 1.0);
    windowGlass.rotation.y = Math.PI / 2;
    scene.add(windowGlass);

    // Window cross bars
    const barMat = new THREE.MeshPhysicalMaterial({ color: 0xbbbbbb, metalness: 0.2, roughness: 0.3 });
    const hbar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.7), barMat);
    hbar.position.set(-1.78, 1.8, 1.0);
    scene.add(hbar);
    const vbar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 0.02), barMat);
    vbar.position.set(-1.78, 1.8, 1.0);
    scene.add(vbar);

    // Window light
    const windowLight = new THREE.DirectionalLight(0xaaccff, 0.6);
    windowLight.position.set(-2, 1.5, 1);
    scene.add(windowLight);

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0x8899aa, 0.4);
    scene.add(ambient);

    const main = new THREE.DirectionalLight(0xffeedd, 1.2);
    main.position.set(2, 4, 3);
    main.castShadow = true;
    main.shadow.mapSize.width = 1024;
    main.shadow.mapSize.height = 1024;
    main.shadow.camera.near = 0.5;
    main.shadow.camera.far = 10;
    main.shadow.camera.left = -4;
    main.shadow.camera.right = 4;
    main.shadow.camera.top = 4;
    main.shadow.camera.bottom = -4;
    scene.add(main);

    const fill = new THREE.DirectionalLight(0x99bbff, 0.3);
    fill.position.set(-1, 2, -2);
    scene.add(fill);

    // ── Lab Bench ──
    const benchTopMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2a,
      roughness: 0.15,
      metalness: 0.1,
    });
    const benchTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 1.4), benchTopMat);
    benchTop.position.set(0, 0.08, 0);
    benchTop.receiveShadow = true;
    benchTop.castShadow = true;
    scene.add(benchTop);

    // Bench edge trim
    const edgeMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, metalness: 0.3, roughness: 0.2 });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.02, 1.44), edgeMat);
    edge.position.set(0, 0.11, 0);
    scene.add(edge);

    // Bench front panel
    const frontMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f0e8, roughness: 0.3 });
    const front = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.6, 0.02), frontMat);
    front.position.set(0, -0.2, 0.71);
    scene.add(front);

    // Bench legs
    const legMat2 = new THREE.MeshPhysicalMaterial({ color: 0x666666, metalness: 0.5, roughness: 0.3 });
    for (const lx of [-1.35, 1.35]) {
      for (const lz of [-0.6, 0.6]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 0.04), legMat2);
        leg.position.set(lx, -0.27, lz);
        scene.add(leg);
      }
    }

    // Cross brace
    const brace = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.02, 0.02), legMat2);
    brace.position.set(0, -0.08, 0.6);
    scene.add(brace);
    const brace2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.02, 0.02), legMat2);
    brace2.position.set(0, -0.08, -0.6);
    scene.add(brace2);

    // ── Equipment ──
    const labelGroup = new THREE.Group();
    const liquidMeshes: THREE.Mesh[] = [];
    const flameGroupObjs: THREE.Group[] = [];
    let isReacted = false;

    for (const eq of config.equipment) {
      if (eq.type === "burner") {
        const burner = createBurnerDetailed();
        burner.position.set(eq.position[0], eq.position[1], eq.position[2]);
        scene.add(burner);

        const flame = createFlameGroup();
        flame.position.set(eq.position[0], eq.position[1] + 0.2, eq.position[2]);
        scene.add(flame);
        flameGroupObjs.push(flame);
      } else {
        let vessel: THREE.Group;
        let innerR = 0.17;
        switch (eq.type) {
          case "beaker":
            vessel = createBeaker(eq.color);
            break;
          case "flask":
            vessel = createFlask(eq.color);
            innerR = 0.10;
            break;
          case "cylinder":
            vessel = createGraduatedCylinder(eq.color);
            innerR = 0.15;
            break;
          case "tube":
            vessel = createTestTube(eq.color);
            innerR = 0.04;
            break;
          default:
            vessel = createBeaker(eq.color);
        }
        vessel.position.set(eq.position[0], eq.position[1], eq.position[2]);
        scene.add(vessel);

        // Liquid
        if (eq.liquidColor && eq.liquidHeight) {
          const liquid = createLiquidBody(eq.type, eq.liquidColor, eq.liquidHeight, innerR, eq.position);
          scene.add(liquid);
          liquidMeshes.push(liquid);
        }

        // Label
        if (eq.label) {
          const canvas = document.createElement("canvas");
          canvas.width = 128;
          canvas.height = 32;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.roundRect(0, 0, 128, 32, 4);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 16px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(eq.label, 64, 16);
          const tex = new THREE.CanvasTexture(canvas);
          tex.needsUpdate = true;
          const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, sizeAttenuation: true });
          const sprite = new THREE.Sprite(mat);
          const eqH = eq.type === "beaker" ? 0.4 : eq.type === "flask" ? 0.425 : eq.type === "cylinder" ? 0.35 : 0.35;
          sprite.position.set(eq.position[0], eq.position[1] + eqH + 0.2, eq.position[2]);
          sprite.scale.set(0.3, 0.075, 1);
          labelGroup.add(sprite);
        }
      }
    }
    scene.add(labelGroup);

    // ── Accessories on bench ──
    // Test tube rack
    const rackMat = new THREE.MeshPhysicalMaterial({ color: 0xc9b89a, roughness: 0.6 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.15), rackMat);
    rack.position.set(-1.0, 0.08, -0.4);
    scene.add(rack);
    // Tubes in rack
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x8888cc,
      transparent: true,
      opacity: 0.4,
      roughness: 0.05,
      clearcoat: 0.2,
    });
    for (let i = 0; i < 3; i++) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.017, 0.12, 8), tubeMat);
      tube.position.set(-1.0 + (i - 1) * 0.04, 0.14, -0.4);
      scene.add(tube);
    }

    // Dropper bottle
    const bottleMat = new THREE.MeshPhysicalMaterial({ color: 0xcc8844, roughness: 0.3 });
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.08, 8), bottleMat);
    bottle.position.set(1.1, 0.08, -0.45);
    bottle.castShadow = true;
    scene.add(bottle);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.028, 0.025, 8),
      new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.3, roughness: 0.3 }),
    );
    cap.position.set(1.1, 0.125, -0.45);
    scene.add(cap);

    // Stir rod
    const rodMat = new THREE.MeshPhysicalMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.6, roughness: 0.1 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 6), rodMat);
    rod.position.set(-0.2, 0.08, -0.55);
    rod.rotation.z = 0.2;
    scene.add(rod);

    // ── Reaction state ──
    const clock = new THREE.Clock();
    const time = { value: 0 };
    const bubbles: { mesh: THREE.Mesh; vy: number; vx: number; vz: number; life: number }[] = [];
    const steamParticles: { mesh: THREE.Mesh; vy: number; life: number }[] = [];

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time.value += delta;

      controls.update();

      // Animate flames
      for (const fg of flameGroupObjs) {
        fg.children.forEach((child, i) => {
          const s = 1 + Math.sin(time.value * 12 + i * 2 + fg.position.x * 3) * 0.12;
          child.scale.setScalar(s);
          if (child.type === "Mesh") {
            const m = child as THREE.Mesh;
            if (m.material && "opacity" in m.material) {
              const mat = m.material as THREE.MeshBasicMaterial;
              mat.opacity = (0.3 + Math.sin(time.value * 10 + i * 1.5) * 0.15) * (1 - i * 0.15);
            }
          }
        });
      }

      // Animate flames when reacted
      if (isReacted) {
        for (const fg of flameGroupObjs) {
          const bright = 1 + Math.sin(time.value * 8) * 0.2;
          fg.scale.setScalar(bright);
        }
      }

      // Update bubble particles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.mesh.position.x += b.vx * delta;
        b.mesh.position.y += b.vy * delta;
        b.mesh.position.z += b.vz * delta;
        b.mesh.scale.setScalar(1 + Math.sin(time.value * 5 + i) * 0.1);
        b.life += delta;
        const mat = b.mesh.material as THREE.MeshPhysicalMaterial;
        mat.opacity = Math.max(0, 0.4 - b.life * 0.6);
        if (b.life > 0.8 || b.mesh.position.y > 0.8) {
          scene.remove(b.mesh);
          b.mesh.geometry.dispose();
          (b.mesh.material as THREE.MeshPhysicalMaterial).dispose();
          bubbles.splice(i, 1);
        }
      }

      // Update steam particles
      for (let i = steamParticles.length - 1; i >= 0; i--) {
        const s = steamParticles[i];
        s.mesh.position.y += s.vy * delta;
        s.mesh.scale.setScalar(1 + delta * 0.3);
        s.life += delta;
        const mat = s.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.2 - s.life * 0.2);
        if (s.life > 1.2) {
          scene.remove(s.mesh);
          s.mesh.geometry.dispose();
          if (s.mesh.material && !Array.isArray(s.mesh.material)) {
            (s.mesh.material as THREE.Material).dispose();
          }
          steamParticles.splice(i, 1);
        }
      }

      // Liquid surface wobble
      for (const lm of liquidMeshes) {
        if (!isReacted) {
          const s = 1 + Math.sin(time.value * 2 + lm.position.x * 5) * 0.005;
          lm.scale.x = s;
          lm.scale.z = s;
        }
      }

      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    (window as unknown as Record<string, unknown>).__triggerReaction = () => {
      if (isReacted) return;
      isReacted = true;

      const reaction = config.reactions?.[0];
      if (!reaction) return;

      if (reaction.effect === "colorChange" && reaction.targetColor) {
        const target = new THREE.Color(reaction.targetColor);
        let step = 0;
        const interval = setInterval(() => {
          step++;
          for (const lm of liquidMeshes) {
            const mat = lm.material as THREE.MeshPhysicalMaterial;
            mat.color.lerp(target, 0.05);
          }
          if (step >= 30) {
            clearInterval(interval);
            setReacted(true);
          }
        }, 50);
      }

      if (reaction.bubbles) {
        let spawned = 0;
        const spawnInterval = setInterval(() => {
          if (spawned > 35) { clearInterval(spawnInterval); return; }
          for (let i = 0; i < 3; i++) {
            const b = createBubble();
            const eq = config.equipment.find((e) => e.liquidColor);
            if (!eq) continue;
            b.position.set(
              eq.position[0] + (Math.random() - 0.5) * 0.15,
              eq.position[1] + 0.05,
              eq.position[2] + (Math.random() - 0.5) * 0.15,
            );
            scene.add(b);
            bubbles.push({
              mesh: b,
              vy: 0.2 + Math.random() * 0.4,
              vx: (Math.random() - 0.5) * 0.05,
              vz: (Math.random() - 0.5) * 0.05,
              life: 0,
            });
          }
          spawned++;
        }, 120);
      }

      if (reaction.smoke) {
        let spawned = 0;
        const spawnInterval = setInterval(() => {
          if (spawned > 20) { clearInterval(spawnInterval); return; }
          const sp = createSteamParticle();
          const eq = config.equipment.find((e) => e.liquidColor);
          if (!eq) return;
          sp.position.set(
            eq.position[0] + (Math.random() - 0.5) * 0.1,
            eq.position[1] + 0.15,
            eq.position[2] + (Math.random() - 0.5) * 0.1,
          );
          scene.add(sp);
          steamParticles.push({ mesh: sp, vy: 0.15 + Math.random() * 0.2, life: 0 });
          spawned++;
        }, 200);
      }

      if (reaction.flame) {
        for (const fg of flameGroupObjs) {
          fg.children.forEach((child) => {
            if (child.type === "Mesh") {
              const m = child as THREE.Mesh;
              if (m.material && "color" in m.material) {
                const mat = m.material as THREE.MeshBasicMaterial;
                const original = mat.color.getHex();
                const interval = setInterval(() => {
                  mat.color.setHex(original);
                  clearInterval(interval);
                }, 3000);
              }
            }
          });
        }
      }
    };

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      for (const b of bubbles) {
        scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        if (b.mesh.material && !Array.isArray(b.mesh.material)) {
          (b.mesh.material as THREE.Material).dispose();
        }
      }
      bubbles.length = 0;
      for (const s of steamParticles) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        if (s.mesh.material && !Array.isArray(s.mesh.material)) {
          s.mesh.material.dispose();
        }
      }
      steamParticles.length = 0;
      delete (window as unknown as Record<string, unknown>).__triggerReaction;
    };
  }, [config]);

  const handleReact = () => {
    setReacting(true);
    (window as unknown as { __triggerReaction?: () => void }).__triggerReaction?.();
    setTimeout(() => setReacting(false), 500);
  };

  const handleNext = () => {
    if (!config?.steps) return;
    if (step < config.steps.length - 1) {
      setStep((s) => s + 1);
    }
  };

  if (!config) {
    return (
      <div className={`rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 ${className ?? "aspect-video"}`}>
        Loading experiment...
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: "60vh", background: "#e8e0d8" }}>
      {/* Top info bar */}
      <div className="absolute top-0 inset-x-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        <div>
          <h2 className="text-white font-bold text-sm drop-shadow-lg">{config.title}</h2>
          <p className="text-zinc-200 text-xs mt-0.5 drop-shadow-md">{config.description}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-zinc-100 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
          {experiment.category}
        </span>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 inset-x-0 z-20 px-4 flex items-center justify-center gap-3">
        {!reacted ? (
          <button
            onClick={handleReact}
            disabled={reacting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {reacting ? "Reacting..." : "Start Reaction"}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-medium backdrop-blur-sm">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Reaction complete
          </div>
        )}

        {config.steps && config.steps.length > 0 && (
          <button
            onClick={handleNext}
            disabled={step >= config.steps.length - 1}
            className="px-4 py-2.5 rounded-xl border border-white/20 text-zinc-100 text-sm hover:bg-white/10 transition-colors disabled:opacity-30 backdrop-blur-sm"
          >
            Step {step + 1}/{config.steps.length}
          </button>
        )}
      </div>

      {/* Step description */}
      {config.steps && config.steps[step] && (
        <div className="absolute top-20 left-4 right-4 z-20 max-w-md mx-auto">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-xs text-zinc-400 mb-1">Step {step + 1}</p>
            <p className="text-sm text-white">{config.steps[step].text}</p>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full" style={{ minHeight: "60vh" }} />
    </div>
  );
}
