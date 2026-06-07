"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface PosterObject {
  type: "box" | "sphere" | "torus" | "cone" | "cylinder" | "torusKnot";
  color: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  label?: string;
  animate?: "float" | "spin" | "orbit" | "pulse";
}

interface PosterConfig {
  posterColor?: string;
  frameColor?: string;
  accentColor?: string;
  title: string;
  description?: string;
  backgroundColor?: string;
  objects?: PosterObject[];
  showParticles?: boolean;
  autoRotate?: boolean;
}

interface PosterConfigWrapper {
  config: PosterConfig;
  className?: string;
}

const GRADIENT_COLORS = [
  ["#6366f1", "#8b5cf6"],
  ["#ec4899", "#f43f5e"],
  ["#14b8a6", "#06b6d4"],
  ["#f59e0b", "#f97316"],
  ["#22c55e", "#10b981"],
  ["#a855f7", "#d946ef"],
];

function hashColor(title: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
  }
  const idx = Math.abs(hash) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[idx] as [string, string];
}

export function PosterViewer({ config, className }: PosterConfigWrapper) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.backgroundColor ?? "#0a0a1a");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0.5, 0);
    controls.autoRotate = config.autoRotate ?? true;
    controls.autoRotateSpeed = 1.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.5);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.4);
    rimLight.position.set(0, -2, 5);
    scene.add(rimLight);

    const [gradFrom, gradTo] = hashColor(config.title);
    const posterColor = config.posterColor ?? gradFrom;
    const frameColor = config.frameColor ?? gradTo;
    const accentColor = config.accentColor ?? gradTo;

    // ── Poster frame ──
    const frameGroup = new THREE.Group();

    const frameMat = new THREE.MeshPhysicalMaterial({
      color: frameColor,
      metalness: 0.3,
      roughness: 0.4,
      emissive: frameColor,
      emissiveIntensity: 0.05,
    });

    const frameDepth = 0.06;
    const fw = 2.8;
    const fh = 2.0;
    const thickness = 0.08;

    const bars: { s: [number, number, number]; p: [number, number, number] }[] = [
      { s: [fw + thickness * 2, thickness, frameDepth], p: [0, fh / 2 + thickness / 2, 0] },
      { s: [fw + thickness * 2, thickness, frameDepth], p: [0, -fh / 2 - thickness / 2, 0] },
      { s: [thickness, fh, frameDepth], p: [-fw / 2 - thickness / 2, 0, 0] },
      { s: [thickness, fh, frameDepth], p: [fw / 2 + thickness / 2, 0, 0] },
    ];

    for (const bar of bars) {
      const geo = new THREE.BoxGeometry(...bar.s);
      const mesh = new THREE.Mesh(geo, frameMat);
      mesh.position.set(...bar.p);
      mesh.castShadow = true;
      frameGroup.add(mesh);
    }

    frameGroup.position.y = 0.5;
    scene.add(frameGroup);

    // ── Poster surface ──
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext("2d")!;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, posterColor);
    bgGrad.addColorStop(1, accentColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const gradientBar = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientBar.addColorStop(0, "rgba(255,255,255,0)");
    gradientBar.addColorStop(0.5, "rgba(255,255,255,0.15)");
    gradientBar.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradientBar;
    ctx.fillRect(0, 80, canvas.width, 3);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;

    const titleLines = wrapText(ctx, config.title, 880, 52);
    let ty = canvas.height / 2 - (titleLines.length - 1) * 32;
    for (const line of titleLines) {
      ctx.fillText(line, canvas.width / 2, ty);
      ty += 64;
    }

    if (config.description) {
      ctx.shadowBlur = 0;
      ctx.font = "20px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      const descLines = wrapText(ctx, config.description, 800, 20);
      let dy = canvas.height / 2 + 60;
      for (const line of descLines) {
        ctx.fillText(line, canvas.width / 2, dy);
        dy += 30;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const surfaceMat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.1,
    });
    const surfaceGeo = new THREE.PlaneGeometry(fw, fh);
    const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
    surface.position.set(0, 0.5, 0);
    surface.castShadow = true;
    scene.add(surface);

    // ── 3D objects ──
    const geoBuilders: Record<string, () => THREE.BufferGeometry> = {
      box: () => new THREE.BoxGeometry(0.4, 0.4, 0.4),
      sphere: () => new THREE.SphereGeometry(0.25, 24, 24),
      torus: () => new THREE.TorusGeometry(0.2, 0.08, 12, 32),
      cone: () => new THREE.ConeGeometry(0.25, 0.4, 24),
      cylinder: () => new THREE.CylinderGeometry(0.2, 0.2, 0.4, 24),
      torusKnot: () => new THREE.TorusKnotGeometry(0.2, 0.08, 32, 6),
    };

    const meshes: { mesh: THREE.Mesh; animate?: "float" | "spin" | "orbit" | "pulse"; phase: number }[] = [];

    if (config.objects) {
      config.objects.forEach((obj) => {
        const builder = geoBuilders[obj.type];
        if (!builder) return;
        const mat = new THREE.MeshPhysicalMaterial({
          color: obj.color,
          metalness: 0.3,
          roughness: 0.2,
          emissive: obj.color,
          emissiveIntensity: 0.1,
          clearcoat: 0.2,
        });
        const mesh = new THREE.Mesh(builder(), mat);
        mesh.position.set(...obj.position);
        if (obj.rotation) mesh.rotation.set(...obj.rotation);
        if (obj.scale) mesh.scale.setScalar(obj.scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        meshes.push({
          mesh,
          animate: obj.animate,
          phase: Math.random() * Math.PI * 2,
        });
      });
    }

    // ── Particles ──
    let particleSystem: THREE.Points | null = null;
    if (config.showParticles !== false) {
      const particleCount = 300;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 8;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: accentColor,
        size: 0.03,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      particleSystem = new THREE.Points(particleGeo, particleMat);
      particleSystem.position.y = 1;
      scene.add(particleSystem);
    }

    // ── Ground glow ring ──
    const ringGeo = new THREE.RingGeometry(0.8, 1.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.01;
    scene.add(ring);

    const time = { value: 0 };
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time.value += delta;

      controls.update();

      for (const entry of meshes) {
        if (entry.animate === "float") {
          entry.mesh.position.y += Math.sin(time.value * 2 + entry.phase) * 0.002;
        } else if (entry.animate === "spin") {
          entry.mesh.rotation.x += delta * 1.5;
          entry.mesh.rotation.y += delta * 2;
        } else if (entry.animate === "pulse") {
          const s = 1 + Math.sin(time.value * 3 + entry.phase) * 0.1;
          entry.mesh.scale.setScalar(s);
        } else {
          entry.mesh.rotation.x += delta * 0.5;
          entry.mesh.rotation.y += delta * 1;
        }
      }

      if (particleSystem) {
        const pos = particleSystem.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] += Math.sin(time.value + pos[i - 1]) * 0.0005;
          pos[i - 1] += Math.cos(time.value * 0.5 + pos[i]) * 0.0005;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      ring.scale.setScalar(1 + Math.sin(time.value) * 0.1);
      ringMat.opacity = 0.1 + Math.sin(time.value * 0.5) * 0.05;

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

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-hidden bg-[#0a0a1a] ${className ?? "w-full aspect-video"}`}
    />
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}
