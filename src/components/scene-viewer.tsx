"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface SceneObject {
  type: "box" | "sphere" | "torus" | "cone" | "cylinder" | "torusKnot";
  color: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

interface SceneConfig {
  objects: SceneObject[];
  autoRotate?: boolean;
  showGrid?: boolean;
  backgroundColor?: string;
  ambientLight?: number;
  directionalLight?: number;
}

interface SceneViewerProps {
  config: SceneConfig;
  className?: string;
}

const defaultConfig: SceneConfig = {
  objects: [
    { type: "box", color: "#6366f1", position: [-2, 1, 0] },
    { type: "sphere", color: "#8b5cf6", position: [0, 1, 0] },
    { type: "torus", color: "#a855f7", position: [2, 1, 0] },
  ],
  autoRotate: true,
  showGrid: true,
  backgroundColor: "#0a0a0f",
};

const geometryMap = {
  box: () => new THREE.BoxGeometry(1.2, 1.2, 1.2),
  sphere: () => new THREE.SphereGeometry(0.8, 32, 32),
  torus: () => new THREE.TorusGeometry(0.7, 0.25, 16, 48),
  cone: () => new THREE.ConeGeometry(0.8, 1.2, 32),
  cylinder: () => new THREE.CylinderGeometry(0.7, 0.7, 1.2, 32),
  torusKnot: () => new THREE.TorusKnotGeometry(0.6, 0.22, 64, 8),
};

export function SceneViewer({ config, className }: SceneViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    objects: THREE.Mesh[];
    frameId: number;
  } | null>(null);

  const merged = { ...defaultConfig, ...config };
  merged.objects = config.objects ?? defaultConfig.objects;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(merged.backgroundColor);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
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
    controls.maxDistance = 15;
    controls.autoRotate = merged.autoRotate ?? false;
    controls.autoRotateSpeed = 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, merged.ambientLight ?? 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, merged.directionalLight ?? 2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.4);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.3);
    rimLight.position.set(0, -3, 5);
    scene.add(rimLight);

    if (merged.showGrid) {
      const gridHelper = new THREE.GridHelper(10, 20, 0x6366f1, 0x312e81);
      gridHelper.position.y = -0.01;
      scene.add(gridHelper);
    }

    const groundGeometry = new THREE.PlaneGeometry(12, 12);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const meshes: THREE.Mesh[] = [];

    merged.objects.forEach((obj) => {
      const builder = geometryMap[obj.type];
      if (!builder) return;
      const geometry = builder();
      const material = new THREE.MeshPhysicalMaterial({
        color: obj.color,
        metalness: 0.1,
        roughness: 0.3,
        clearcoat: 0.1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...obj.position);
      if (obj.rotation) mesh.rotation.set(...obj.rotation);
      if (obj.scale) mesh.scale.setScalar(obj.scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshes.push(mesh);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      meshes.forEach((m) => {
        m.rotation.x += 0.005;
        m.rotation.y += 0.01;
      });
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

    sceneRef.current = { scene, camera, renderer, controls, objects: meshes, frameId };

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-hidden bg-[#0a0a0f] ${className ?? "w-full aspect-video"}`}
    />
  );
}
