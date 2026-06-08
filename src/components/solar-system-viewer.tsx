"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ── Procedural texture generators ──

function createCraterTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const base = 140 + Math.random() * 40;
      const crater = Math.random() < 0.03 ? base - 60 + Math.random() * 30 : 0;
      const v = Math.max(80, Math.min(200, base + crater));
      data[i] = v; data[i + 1] = v * 0.95; data[i + 2] = v * 0.9; data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createVenusTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const swirl = Math.sin(x * 0.02 + y * 0.03) * 20 + Math.sin(x * 0.01 + y * 0.05) * 15;
      const r = 190 + swirl + Math.random() * 10;
      const g = 170 + swirl * 0.6 + Math.random() * 10;
      const b = 120 + swirl * 0.3 + Math.random() * 10;
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function createEarthTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;

  const land = [
    { x: 0.5, y: 0.3, w: 0.15, h: 0.12 }, // North America
    { x: 0.45, y: 0.4, w: 0.05, h: 0.2 },  // South America
    { x: 0.6, y: 0.25, w: 0.2, h: 0.1 },   // Europe
    { x: 0.65, y: 0.35, w: 0.15, h: 0.2 },  // Africa
    { x: 0.8, y: 0.3, w: 0.18, h: 0.1 },    // Asia
    { x: 0.75, y: 0.45, w: 0.08, h: 0.06 },  // Australia
    { x: 0.3, y: 0.25, w: 0.12, h: 0.08 },   // Europe/UK
  ];

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const nx = x / c.width;
      const ny = y / c.height;

      let isLand = false;
      for (const l of land) {
        const dx = (nx - l.x) / l.w;
        const dy = (ny - l.y) / l.h;
        if (dx * dx + dy * dy < 1 + Math.random() * 0.3) { isLand = true; break; }
      }

      const snow = isLand && ny < 0.15 + Math.random() * 0.02 ? 1 : 0;
      const cloud = Math.random() < 0.08 ? 1 : 0;

      if (snow) {
        data[i] = 240; data[i + 1] = 245; data[i + 2] = 250;
      } else if (isLand) {
        const green = 80 + Math.random() * 80;
        data[i] = 40 + Math.random() * 40;
        data[i + 1] = green;
        data[i + 2] = 20 + Math.random() * 30;
      } else {
        const depth = Math.random() * 30;
        data[i] = 20 + depth;
        data[i + 1] = 60 + depth;
        data[i + 2] = 140 + depth;
      }

      if (cloud) {
        data[i] = data[i] * 0.5 + 180;
        data[i + 1] = data[i + 1] * 0.5 + 185;
        data[i + 2] = data[i + 2] * 0.5 + 190;
      }

      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function createMarsTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const noise = Math.sin(x * 0.02 + y * 0.01) * 30 + Math.sin(x * 0.05 + y * 0.03) * 15;
      const dark = Math.random() < 0.05 ? -30 : 0;
      const r = 180 + noise + dark + Math.random() * 15;
      const g = 80 + noise * 0.4 + dark * 0.5 + Math.random() * 10;
      const b = 30 + noise * 0.2 + Math.random() * 10;
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function createJupiterTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;

  const bands = [
    { y: 0.0, h: 0.06, r: 200, g: 180, b: 150 },
    { y: 0.06, h: 0.08, r: 160, g: 130, b: 90 },
    { y: 0.14, h: 0.06, r: 210, g: 190, b: 160 },
    { y: 0.20, h: 0.04, r: 140, g: 100, b: 70 },
    { y: 0.24, h: 0.08, r: 220, g: 200, b: 170 },
    { y: 0.32, h: 0.05, r: 180, g: 150, b: 110 },
    { y: 0.37, h: 0.08, r: 230, g: 210, b: 180 }, // Great Red Spot band
    { y: 0.45, h: 0.05, r: 160, g: 130, b: 100 },
    { y: 0.50, h: 0.08, r: 215, g: 195, b: 165 },
    { y: 0.58, h: 0.04, r: 150, g: 120, b: 85 },
    { y: 0.62, h: 0.08, r: 225, g: 205, b: 175 },
    { y: 0.70, h: 0.05, r: 170, g: 140, b: 105 },
    { y: 0.75, h: 0.08, r: 210, g: 190, b: 160 },
    { y: 0.83, h: 0.06, r: 155, g: 125, b: 90 },
    { y: 0.89, h: 0.06, r: 200, g: 180, b: 150 },
    { y: 0.95, h: 0.05, r: 170, g: 145, b: 110 },
  ];

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const ny = y / c.height;
      const nx = x / c.width;

      let r = 180, g = 160, b = 130;
      for (const band of bands) {
        if (ny >= band.y && ny < band.y + band.h) {
          const turbulence = Math.sin(x * 0.01 + y * 0.003) * 15 + Math.sin(x * 0.02) * 8;
          r = band.r + turbulence + Math.random() * 5;
          g = band.g + turbulence * 0.7 + Math.random() * 5;
          b = band.b + turbulence * 0.3 + Math.random() * 5;
          break;
        }
      }

      // Great Red Spot
      const gx = 0.65, gy = 0.40;
      const dist = Math.sqrt((nx - gx) ** 2 + ((ny - gy) * 3) ** 2);
      if (dist < 0.06) {
        const intensity = 1 - dist / 0.06;
        r = r * (1 - intensity * 0.5) + 180 * intensity * 0.5;
        g = g * (1 - intensity * 0.5) + 80 * intensity * 0.5;
        b = b * (1 - intensity * 0.5) + 50 * intensity * 0.5;
      }

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function createSaturnTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const ny = y / c.height;
      const band = Math.sin(ny * 30) * 15 + Math.sin(ny * 60) * 8;
      const r = 210 + band + Math.random() * 8;
      const g = 190 + band * 0.6 + Math.random() * 8;
      const b = 150 + band * 0.3 + Math.random() * 8;
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function createUranusTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 128;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const ripple = Math.sin(x * 0.02 + y * 0.01) * 8;
      data[i] = 120 + ripple + Math.random() * 5;
      data[i + 1] = 195 + ripple * 0.5 + Math.random() * 5;
      data[i + 2] = 220 + ripple * 0.3 + Math.random() * 5;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function createNeptuneTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 128;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const storm = Math.sin(x * 0.01 + y * 0.02) * 15 + Math.sin(x * 0.03) * 8;
      const r = 30 + storm * 0.3 + Math.random() * 5;
      const g = 60 + storm * 0.5 + Math.random() * 5;
      const b = 170 + storm + Math.random() * 10;
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function createSunTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const ctx = c.getContext("2d")!;
  const imageData = ctx.createImageData(c.width, c.height);
  const data = imageData.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const cell = Math.sin(x * 0.05 + y * 0.03) * 30
        + Math.sin(x * 0.02 + y * 0.07) * 20
        + Math.sin(x * 0.01) * 15;
      const r = 255;
      const g = 180 + cell + Math.random() * 20;
      const b = 40 + cell * 0.3 + Math.random() * 15;
      data[i] = r;
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(c);
}

// ── Planet data ──

interface PlanetData {
  name: string;
  radius: number;
  orbitRadius: number;
  speed: number;
  tilt?: number;
  hasRing?: boolean;
  ringColor?: string;
  ringSize?: number;
  texFn: () => THREE.CanvasTexture;
  rotationSpeed: number;
  color: string;
  facts: string;
  diameter: string;
  orbitPeriod: string;
}

const planets: PlanetData[] = [
  { name: "Mercury", radius: 0.15, orbitRadius: 1.8, speed: 0.04, texFn: createCraterTexture, rotationSpeed: 0.005, color: "#b0a8a0", facts: "Smallest planet in the Solar System, only 4,879 km across", diameter: "4,879 km", orbitPeriod: "88 days" },
  { name: "Venus", radius: 0.25, orbitRadius: 2.6, speed: 0.015, texFn: createVenusTexture, rotationSpeed: 0.003, color: "#e8cda0", facts: "Hottest planet — surface reaches 465°C, rotates backwards", diameter: "12,104 km", orbitPeriod: "225 days" },
  { name: "Earth", radius: 0.28, orbitRadius: 3.4, speed: 0.01, texFn: createEarthTexture, rotationSpeed: 0.02, color: "#4b8bbe", facts: "Our home — the only known planet with liquid water and life", diameter: "12,742 km", orbitPeriod: "365.25 days" },
  { name: "Mars", radius: 0.2, orbitRadius: 4.2, speed: 0.008, texFn: createMarsTexture, rotationSpeed: 0.019, color: "#c1440e", facts: "The Red Planet — home to Olympus Mons, the largest volcano", diameter: "6,779 km", orbitPeriod: "687 days" },
  { name: "Jupiter", radius: 0.6, orbitRadius: 5.6, speed: 0.005, texFn: createJupiterTexture, rotationSpeed: 0.04, color: "#d4a574", facts: "Largest planet — its Great Red Spot storm is larger than Earth", diameter: "139,820 km", orbitPeriod: "11.86 years" },
  { name: "Saturn", radius: 0.5, orbitRadius: 7.0, speed: 0.003, texFn: createSaturnTexture, rotationSpeed: 0.038, color: "#ead6b8", hasRing: true, ringColor: "#c8b89a", ringSize: 0.8, facts: "Famous for its spectacular ring system made of ice and rock", diameter: "116,460 km", orbitPeriod: "29.46 years" },
  { name: "Uranus", radius: 0.35, orbitRadius: 8.5, speed: 0.002, tilt: 0.7, texFn: createUranusTexture, rotationSpeed: 0.03, color: "#7ec8e3", facts: "Rotates on its side with an axial tilt of 98°", diameter: "50,724 km", orbitPeriod: "84 years" },
  { name: "Neptune", radius: 0.33, orbitRadius: 10.0, speed: 0.0015, texFn: createNeptuneTexture, rotationSpeed: 0.032, color: "#3b5fb0", facts: "Windiest planet — winds reach 2,100 km/h", diameter: "49,244 km", orbitPeriod: "164.8 years" },
];

// ── Component ──

export function SolarSystemViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(8, 6, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 35;
    controls.target.set(0, 0, 0);

    // ── Galaxy background ──

    // Spiral arms
    const armCount = 3;
    const particleCount = 25000;
    const armLength = 80;
    const armSpread = 0.5;
    const coreSize = 8;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const isCore = i < 4000;
      let r: number, theta: number, armOffset: number;

      if (isCore) {
        r = Math.random() * coreSize;
        theta = Math.random() * Math.PI * 2;
        armOffset = 0;
      } else {
        const armIndex = Math.floor(Math.random() * armCount);
        const armAngle = (armIndex / armCount) * Math.PI * 2;
        const dist = coreSize + Math.random() * (armLength - coreSize);
        const spiralAngle = dist * 0.15 + armAngle;
        const scatter = (Math.random() - 0.5) * armSpread * (dist / armLength) * 10;
        r = dist;
        theta = spiralAngle + scatter;
        armOffset = scatter;
      }

      const x = r * Math.cos(theta) * 0.8;
      const z = r * Math.sin(theta) * 0.8;
      const y = (Math.random() - 0.5) * 0.3 * (r / armLength) * 5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Colors
      const distNorm = r / armLength;
      let rCol: number, gCol: number, bCol: number;

      if (isCore) {
        rCol = 1.0; gCol = 0.8 + Math.random() * 0.2; bCol = 0.4 + Math.random() * 0.2;
      } else {
        const armFactor = 1 - Math.abs(armOffset) / (armSpread * 5);
        if (distNorm < 0.3) {
          rCol = 0.8 + Math.random() * 0.2;
          gCol = 0.5 + Math.random() * 0.2;
          bCol = 0.3 + Math.random() * 0.2;
        } else if (distNorm < 0.6) {
          rCol = 0.5 + Math.random() * 0.3;
          gCol = 0.4 + Math.random() * 0.2;
          bCol = 0.6 + Math.random() * 0.3;
        } else {
          rCol = 0.2 + Math.random() * 0.3;
          gCol = 0.2 + Math.random() * 0.3;
          bCol = 0.5 + Math.random() * 0.5;
        }
        rCol *= armFactor;
        gCol *= armFactor;
        bCol *= armFactor;
      }

      colors[i * 3] = Math.max(0, rCol);
      colors[i * 3 + 1] = Math.max(0, gCol);
      colors[i * 3 + 2] = Math.max(0, bCol);
    }

    const galGeo = new THREE.BufferGeometry();
    galGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    galGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const galMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const galaxy = new THREE.Points(galGeo, galMat);
    galaxy.position.set(-70, -15, -50);
    galaxy.rotation.x = 0.3;
    galaxy.rotation.z = -0.2;
    scene.add(galaxy);

    // Background stars (distant, subtle)
    const bgStarGeo = new THREE.BufferGeometry();
    const bgCount = 4000;
    const bgPos = new Float32Array(bgCount * 3);
    const bgCol = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 150 + Math.random() * 100;
      bgPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bgPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      bgPos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.2 + Math.random() * 0.3;
      bgCol[i * 3] = b;
      bgCol[i * 3 + 1] = b;
      bgCol[i * 3 + 2] = b + Math.random() * 0.1;
    }
    bgStarGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    bgStarGeo.setAttribute("color", new THREE.BufferAttribute(bgCol, 3));
    const bgStarMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.4 });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x4466aa, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffeedd, 50, 100);
    sunLight.position.set(0, 0, 0);
    sunLight.decay = 1;
    scene.add(sunLight);

    const topLight = new THREE.DirectionalLight(0xffddaa, 1.5);
    topLight.position.set(0, 15, 0);
    scene.add(topLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 1.0);
    fillLight.position.set(-10, 5, 10);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0x4488ff, 0.8);
    backLight.position.set(0, -5, -15);
    scene.add(backLight);

    // ── Sun ──
    const sunTex = createSunTexture();
    const sunGeometry = new THREE.SphereGeometry(0.9, 48, 48);
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: sunTex,
      emissive: 0xff6600,
      emissiveIntensity: 1.5,
      emissiveMap: sunTex,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun glow layers
    const glowLayers = [
      { radius: 1.05, color: 0xff8800, opacity: 0.15 },
      { radius: 1.2, color: 0xff6600, opacity: 0.08 },
      { radius: 1.5, color: 0xff4400, opacity: 0.04 },
    ];
    const glows: THREE.Mesh[] = [];
    glowLayers.forEach((g) => {
      const geo = new THREE.SphereGeometry(g.radius, 32, 32);
      const mat = new THREE.MeshBasicMaterial({ color: g.color, transparent: true, opacity: g.opacity });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      glows.push(mesh);
    });

    // Sun corona
    const coronaGeo = new THREE.BufferGeometry();
    const coronaCount = 1200;
    const coronaPos = new Float32Array(coronaCount * 3);
    const coronaSizes = new Float32Array(coronaCount);
    for (let i = 0; i < coronaCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.1 + Math.random() * 1.2;
      coronaPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      coronaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      coronaPos[i * 3 + 2] = r * Math.cos(phi);
      coronaSizes[i] = 0.02 + Math.random() * 0.06;
    }
    coronaGeo.setAttribute("position", new THREE.BufferAttribute(coronaPos, 3));
    coronaGeo.setAttribute("size", new THREE.BufferAttribute(coronaSizes, 1));
    const coronaMat = new THREE.PointsMaterial({
      color: 0xff8800,
      size: 0.04,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const corona = new THREE.Points(coronaGeo, coronaMat);
    scene.add(corona);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const planetMeshes: { mesh: THREE.Mesh; data: PlanetData; angle: number }[] = [];

    // Create planets
    planets.forEach((p) => {
      // Orbit path (dashed ring for realistic look)
      const orbitGroup = new THREE.Group();
      const points: THREE.Vector3[] = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * p.orbitRadius, 0, Math.sin(angle) * p.orbitRadius));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMat = new THREE.LineDashedMaterial({
        color: 0x88bbff,
        transparent: true,
        opacity: 0.45,
        dashSize: 0.06,
        gapSize: 0.08,
        depthWrite: false,
        linewidth: 1,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.computeLineDistances();
      orbitGroup.add(orbitLine);

      // Glow ring beneath dashes
      const ringGeo = new THREE.RingGeometry(p.orbitRadius - 0.008, p.orbitRadius + 0.008, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x4488cc,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      orbitGroup.add(ring);

      scene.add(orbitGroup);

      // Planet mesh
      const tex = p.texFn();
      tex.needsUpdate = true;
      const geometry = new THREE.SphereGeometry(p.radius, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4,
        metalness: 0.05,
        emissive: new THREE.Color(p.color).multiplyScalar(0.15),
        emissiveMap: tex,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { name: p.name };
      scene.add(mesh);

      // Saturn ring
      if (p.hasRing) {
        const ringTexCanvas = document.createElement("canvas");
        ringTexCanvas.width = 512; ringTexCanvas.height = 64;
        const rctx = ringTexCanvas.getContext("2d")!;
        const gradient = rctx.createLinearGradient(0, 0, 512, 0);
        gradient.addColorStop(0, "rgba(180,160,130,0.1)");
        gradient.addColorStop(0.15, "rgba(200,180,150,0.8)");
        gradient.addColorStop(0.3, "rgba(160,140,110,0.3)");
        gradient.addColorStop(0.45, "rgba(210,190,160,0.9)");
        gradient.addColorStop(0.55, "rgba(220,200,170,0.7)");
        gradient.addColorStop(0.7, "rgba(180,160,130,0.4)");
        gradient.addColorStop(0.85, "rgba(200,180,150,0.8)");
        gradient.addColorStop(1, "rgba(180,160,130,0.1)");
        rctx.fillStyle = gradient;
        rctx.fillRect(0, 0, 512, 64);
        // Add some noise to rings
        const ringData = rctx.getImageData(0, 0, 512, 64);
        for (let i = 0; i < ringData.data.length; i += 4) {
          const noise = Math.random() * 40 - 20;
          ringData.data[i] = Math.min(255, Math.max(0, ringData.data[i] + noise));
          ringData.data[i + 1] = Math.min(255, Math.max(0, ringData.data[i + 1] + noise));
          ringData.data[i + 2] = Math.min(255, Math.max(0, ringData.data[i + 2] + noise));
        }
        rctx.putImageData(ringData, 0, 0);

        const ringTex = new THREE.CanvasTexture(ringTexCanvas);
        const ringGeometry = new THREE.RingGeometry(p.radius * 1.3, p.radius + (p.ringSize ?? 0.8), 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2.4;
        mesh.add(ring);
      }

      const angle = Math.random() * Math.PI * 2;
      planetMeshes.push({ mesh, data: p, angle });
      mesh.position.x = Math.cos(angle) * p.orbitRadius;
      mesh.position.z = Math.sin(angle) * p.orbitRadius;
    });

    // ── Asteroid belt (between Mars and Jupiter) ──
    const astGeo = new THREE.BufferGeometry();
    const astCount = 3000;
    const astPos = new Float32Array(astCount * 3);
    const astSizes = new Float32Array(astCount);
    for (let i = 0; i < astCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 4.8 + Math.random() * 0.8;
      const y = (Math.random() - 0.5) * 0.15;
      astPos[i * 3] = Math.cos(angle) * r;
      astPos[i * 3 + 1] = y;
      astPos[i * 3 + 2] = Math.sin(angle) * r;
      astSizes[i] = 0.01 + Math.random() * 0.03;
    }
    astGeo.setAttribute("position", new THREE.BufferAttribute(astPos, 3));
    astGeo.setAttribute("size", new THREE.BufferAttribute(astSizes, 1));
    const astMat = new THREE.PointsMaterial({
      color: 0x888877,
      size: 0.02,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const asteroidBelt = new THREE.Points(astGeo, astMat);
    scene.add(asteroidBelt);

    // ── Click / hover ──
    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = planetMeshes.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const name = intersects[0].object.userData.name as string;
        const planet = planets.find((p) => p.name === name);
        if (planet) setSelectedPlanet(planet);
      } else {
        setSelectedPlanet(null);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = planetMeshes.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        setHoveredPlanet(intersects[0].object.userData.name as string);
        renderer.domElement.style.cursor = "pointer";
      } else {
        setHoveredPlanet(null);
        renderer.domElement.style.cursor = "default";
      }
    };

    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Animation ──
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      sun.rotation.y += 0.001;
      glows.forEach((g, i) => {
        g.scale.setScalar(1 + Math.sin(time * 0.5 + i) * 0.02);
        const mat = g.material as THREE.MeshBasicMaterial;
        mat.opacity = (glowLayers[i]?.opacity ?? 0.1) + Math.sin(time * 0.3 + i * 2) * 0.02;
      });
      corona.rotation.y += 0.002;
      corona.rotation.x += 0.001;

      galaxy.rotation.y += 0.0002;
      bgStars.rotation.y += 0.00005;
      asteroidBelt.rotation.y += 0.001;

      planetMeshes.forEach((p) => {
        p.angle += p.data.speed * 0.02;
        p.mesh.position.x = Math.cos(p.angle) * p.data.orbitRadius;
        p.mesh.position.z = Math.sin(p.angle) * p.data.orbitRadius;
        p.mesh.position.y = Math.sin(p.angle * 2) * 0.05;
        p.mesh.rotation.y += p.data.rotationSpeed;
        if (p.data.tilt) p.mesh.rotation.x = p.data.tilt;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Info panel */}
      {selectedPlanet && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full shadow-inner" style={{ backgroundColor: selectedPlanet.color }} />
              <h3 className="font-bold text-lg">{selectedPlanet.name}</h3>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="size-6 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedPlanet.facts}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2">
              <span className="text-zinc-500">Diameter</span>
              <p className="font-medium">{selectedPlanet.diameter}</p>
            </div>
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2">
              <span className="text-zinc-500">Orbit Period</span>
              <p className="font-medium">{selectedPlanet.orbitPeriod}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hover name */}
      {hoveredPlanet && !selectedPlanet && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/70 text-white text-sm font-medium backdrop-blur-sm pointer-events-none">
          {hoveredPlanet}
        </div>
      )}

      {/* Hint */}
      {!selectedPlanet && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-zinc-900/70 text-zinc-300 text-xs backdrop-blur-sm pointer-events-none whitespace-nowrap">
          Click any planet to learn more &middot; Drag to orbit &middot; Scroll to zoom
        </div>
      )}
    </div>
  );
}
