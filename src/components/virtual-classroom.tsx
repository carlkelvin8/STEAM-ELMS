"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface ClassroomLesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  videoUrl: string | null;
  courseTitle?: string;
  moduleTitle?: string;
}

interface VirtualClassroomProps {
  lesson: ClassroomLesson;
}

function createWhiteboardTexture(lesson: ClassroomLesson): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1e1b4b");
  gradient.addColorStop(1, "#0f0a1a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
  ctx.lineWidth = 2;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const titleGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  titleGradient.addColorStop(0, "#c4b5fd");
  titleGradient.addColorStop(1, "#a78bfa");
  ctx.fillStyle = titleGradient;

  const titleLines = wrapText(ctx, lesson.title, 800, 48);
  let yOffset = 80;
  ctx.font = "bold 44px system-ui, sans-serif";
  for (const line of titleLines) {
    ctx.fillText(line, 512 - ctx.measureText(line).width / 2, yOffset);
    yOffset += 56;
  }

  if (lesson.courseTitle) {
    ctx.fillStyle = "rgba(167, 139, 250, 0.6)";
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText(lesson.courseTitle, 512 - ctx.measureText(lesson.courseTitle).width / 2, yOffset + 20);
  }

  if (lesson.description) {
    yOffset = 260;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "22px system-ui, sans-serif";
    const descLines = wrapText(ctx, lesson.description, 750, 22);
    for (const line of descLines.slice(0, 10)) {
      ctx.fillText(line, 512 - ctx.measureText(line).width / 2, yOffset);
      yOffset += 34;
    }
  }

  if (lesson.type === "VIDEO" && lesson.videoUrl) {
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
    ctx.font = "18px system-ui, sans-serif";
    const label = "▶ Video lesson";
    ctx.fillText(label, 512 - ctx.measureText(label).width / 2, canvas.height - 60);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "16px system-ui, sans-serif";
    const hint = "Watch the video alongside this classroom";
    ctx.fillText(hint, 512 - ctx.measureText(hint).width / 2, canvas.height - 30);
  }

  const now = new Date();
  ctx.fillStyle = "rgba(167, 139, 250, 0.3)";
  ctx.font = "14px system-ui, sans-serif";
  const dateStr = `Virtual Classroom · ${now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;
  ctx.fillText(dateStr, 40, canvas.height - 24);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `${fontSize}px system-ui, sans-serif`;
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

export function VirtualClassroom({ lesson }: VirtualClassroomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 12, 25);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 50);
    camera.position.set(5, 4, 8);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.target.set(0, 1, 0);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;

    /* ── Lighting ── */
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    mainLight.position.set(3, 8, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const fill = new THREE.DirectionalLight(0x8888ff, 0.6);
    fill.position.set(-4, 3, -2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x6366f1, 0.4);
    rim.position.set(0, -2, 6);
    scene.add(rim);

    const pointLight = new THREE.PointLight(0xa78bfa, 0.5, 10);
    pointLight.position.set(0, 3.5, -4);
    scene.add(pointLight);

    /* ── Room ── */
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.05,
      roughness: 0.6,
      side: THREE.BackSide,
    });
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: 0x16213e,
      metalness: 0.1,
      roughness: 0.4,
    });

    const roomSize = 10;
    const roomHeight = 4;
    const wallGeo = new THREE.BoxGeometry(roomSize, roomHeight, 0.15);
    const floorGeo = new THREE.PlaneGeometry(roomSize, roomSize);

    // Floor
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor grid
    const grid = new THREE.GridHelper(roomSize, 20, 0x6366f1, 0x312e81);
    grid.position.y = 0.01;
    scene.add(grid);

    // Walls
    const wallPositions = [
      { pos: [0, roomHeight / 2, -roomSize / 2], rot: 0 },
      { pos: [roomSize / 2, roomHeight / 2, 0], rot: Math.PI / 2 },
      { pos: [-roomSize / 2, roomHeight / 2, 0], rot: Math.PI / 2 },
      { pos: [0, roomHeight / 2, roomSize / 2], rot: 0 },
    ];
    for (const w of wallPositions) {
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(w.pos[0], w.pos[1], w.pos[2]);
      wall.rotation.y = w.rot;
      wall.receiveShadow = true;
      scene.add(wall);
    }

    // Ceiling with subtle glow
    const ceilMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f0a1a,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.BackSide,
    });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = roomHeight;
    scene.add(ceil);

    /* ── Whiteboard ── */
    const whiteboardTexture = createWhiteboardTexture(lesson);
    const boardMat = new THREE.MeshPhysicalMaterial({
      map: whiteboardTexture,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.3,
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), boardMat);
    board.position.set(0, 1.8, -4.92);
    board.castShadow = true;
    scene.add(board);

    // Whiteboard frame
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      metalness: 0.3,
      roughness: 0.4,
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.08), frameMat);
    frame.position.set(0, 1.8, -4.85);
    scene.add(frame);

    // Whiteboard glow
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.05,
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.6), glowMat);
    glow.position.set(0, 1.8, -4.75);
    scene.add(glow);

    /* ── Podium/Teacher Desk ── */
    const podiumMat = new THREE.MeshPhysicalMaterial({
      color: 0x2d2a4e,
      metalness: 0.2,
      roughness: 0.5,
    });
    const podium = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.8), podiumMat);
    podium.position.set(0, 0.4, -3.8);
    podium.castShadow = true;
    podium.receiveShadow = true;
    scene.add(podium);

    const podiumTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.9), new THREE.MeshPhysicalMaterial({ color: 0x6366f1, metalness: 0.4, roughness: 0.3 }));
    podiumTop.position.set(0, 0.84, -3.8);
    scene.add(podiumTop);

    /* ── Desks ── */
    const deskMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a4a,
      metalness: 0.15,
      roughness: 0.5,
    });
    const deskTopMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d3d6b,
      metalness: 0.1,
      roughness: 0.4,
    });
    const legMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a33,
      metalness: 0.3,
      roughness: 0.6,
    });

    const deskPositions = [
      [-2.5, 0.5, -2], [-2.5, 0.5, 0.5],
      [0, 0.5, -2], [0, 0.5, 0.5],
      [2.5, 0.5, -2], [2.5, 0.5, 0.5],
    ];

    for (const dp of deskPositions) {
      const deskGroup = new THREE.Group();

      const deskBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.9), deskMat);
      deskBody.position.y = 0.3;
      deskBody.castShadow = true;
      deskBody.receiveShadow = true;
      deskGroup.add(deskBody);

      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 1.0), deskTopMat);
      deskTop.position.y = 0.63;
      deskGroup.add(deskTop);

      for (const lx of [-0.65, 0.65]) {
        for (const lz of [-0.35, 0.35]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), legMat);
          leg.position.set(lx, 0.2, lz);
          deskGroup.add(leg);
        }
      }

      deskGroup.position.set(dp[0], dp[1], dp[2]);
      scene.add(deskGroup);
    }

    /* ── Student Chairs ── */
    const chairMat = new THREE.MeshPhysicalMaterial({
      color: 0x38385a,
      metalness: 0.1,
      roughness: 0.6,
    });
    const chairSeatMat = new THREE.MeshPhysicalMaterial({
      color: 0x4a4a7a,
      metalness: 0.05,
      roughness: 0.8,
    });

    const chairPositions = [
      [-2.5, 0, -1.2], [-2.5, 0, 1.3],
      [0, 0, -1.2], [0, 0, 1.3],
      [2.5, 0, -1.2], [2.5, 0, 1.3],
    ];

    for (const cp of chairPositions) {
      const chairGroup = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), chairSeatMat);
      seat.position.y = 0.4;
      seat.castShadow = true;
      chairGroup.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.06), chairMat);
      back.position.set(0, 0.63, -0.28);
      chairGroup.add(back);

      for (const lx of [-0.2, 0.2]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), chairMat);
        leg.position.set(lx, 0.2, 0.2);
        chairGroup.add(leg);
      }

      chairGroup.position.set(cp[0], cp[1], cp[2]);
      scene.add(chairGroup);
    }

    /* ── Side screens ── */
    const sideScreenMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      emissive: 0x312e81,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.4,
    });
    for (const sx of [-4.92, 4.92]) {
      const side = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), sideScreenMat);
      side.position.set(sx, 1.8, -2);
      if (sx < 0) side.rotation.y = Math.PI / 2;
      else side.rotation.y = -Math.PI / 2;
      scene.add(side);
    }

    /* ── Plants ── */
    const plantMat = new THREE.MeshPhysicalMaterial({
      color: 0x2d6a2d,
      metalness: 0.0,
      roughness: 0.9,
    });
    const potMat = new THREE.MeshPhysicalMaterial({
      color: 0x5c3a1e,
      metalness: 0.1,
      roughness: 0.8,
    });

    for (const pz of [-4.5, 4.5]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8), potMat);
      pot.position.set(pz, 0.15, -4.5);
      pot.castShadow = true;
      scene.add(pot);

      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), plantMat);
        leaf.position.set(
          pz + (Math.random() - 0.5) * 0.2,
          0.35 + Math.random() * 0.15,
          -4.5 + (Math.random() - 0.5) * 0.2,
        );
        scene.add(leaf);
      }
    }

    /* ── Floating Orbs ── */
    const orbMat = new THREE.MeshPhysicalMaterial({
      color: 0xa78bfa,
      emissive: 0x6366f1,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.6,
      metalness: 0.0,
      roughness: 0.1,
    });
    const orbs: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), orbMat);
      const angle = (i / 6) * Math.PI * 2;
      orb.position.set(Math.cos(angle) * 3.5, 2.5 + Math.sin(i * 1.5) * 0.6, Math.sin(angle) * 3.5);
      scene.add(orb);
      orbs.push(orb);
    }

    /* ── Animations ── */
    let time = 0;
    const animate = () => {
      time += 0.005;
      controls.update();
      orbs.forEach((o, i) => {
        const angle = (i / 6) * Math.PI * 2 + time;
        o.position.x = Math.cos(angle) * 3.5;
        o.position.z = Math.sin(angle) * 3.5;
        o.position.y = 2.5 + Math.sin(time * 2 + i) * 0.4;
      });

      glow.material.opacity = 0.03 + Math.sin(time * 2) * 0.02;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    let frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      loadedRef.current = false;
    };
  }, [lesson]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0a1a] relative"
    >
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 px-5 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-zinc-800/50 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <svg className="size-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" /></svg>
          Drag to look around
        </span>
        <span className="w-px h-4 bg-zinc-700" />
        <span className="flex items-center gap-1.5">
          <svg className="size-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" /></svg>
          Scroll to zoom
        </span>
        <span className="w-px h-4 bg-zinc-700" />
        <span className="flex items-center gap-1.5">
          <span className="text-violet-400 font-semibold">{lesson.title}</span>
        </span>
      </div>
    </div>
  );
}
