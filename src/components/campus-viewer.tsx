"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface BuildingData {
  id: string;
  name: string;
  description: string | null;
  abbreviation: string | null;
  color: string;
  positionX: number;
  positionZ: number;
  width: number;
  depth: number;
  height: number;
  department: string | null;
  icon: string | null;
}

interface RouteInfo {
  from: { x: number; z: number };
  to: { x: number; z: number };
  waypoints: { x: number; z: number }[];
  fromName: string;
  toName: string;
  distance: number;
}

function createTextSprite(text: string, fontSize = 48, color = "#ffffff", bgColor = "rgba(0,0,0,0.6)", padding = 16): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  canvas.width = textWidth + padding * 2;
  canvas.height = fontSize + padding * 2;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  const r = 6;
  ctx.moveTo(r, 0);
  ctx.lineTo(canvas.width - r, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
  ctx.lineTo(canvas.width, canvas.height - r);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
  ctx.lineTo(r, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvas.width / 100, canvas.height / 100, 1);
  return sprite;
}

function createFacadeTexture(baseColor: string, stories: number, windowsX: number, hasDoor = false): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = new THREE.Color(baseColor);
  const r = Math.floor(c.r * 200 + 55);
  const g = Math.floor(c.g * 200 + 55);
  const b = Math.floor(c.b * 200 + 55);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.random() * 20 - 10;
    ctx.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},0.03)`;
    ctx.fillRect(x, y, 4, 4);
  }
  const floorH = size / stories;
  for (let f = 0; f < stories; f++) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, floorH * (f + 1) - 2, size, 2);
    const winW = Math.floor(size / (windowsX + 1.5));
    const winH = Math.floor(floorH * 0.55);
    const gap = (size - winW * windowsX) / (windowsX + 1);
    for (let w = 0; w < windowsX; w++) {
      const wx = gap + w * (winW + gap);
      const wy = floorH * f + (floorH - winH) / 2;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(wx - 1, wy - 1, winW + 2, winH + 2);
      if (Math.random() > 0.3) {
        const bright = 140 + Math.floor(Math.random() * 80);
        ctx.fillStyle = `rgba(${bright},${bright + 20},255,0.25)`;
      } else {
        ctx.fillStyle = "rgba(20,30,60,0.5)";
      }
      ctx.fillRect(wx, wy, winW, winH);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(wx + 3, wy + 3, 4, winH - 6);
    }
  }
  if (hasDoor) {
    const doorW = 60;
    const doorH = 80;
    const dx = (size - doorW) / 2;
    const dy = size - doorH - 8;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(dx - 2, dy - 2, doorW + 4, doorH + 4);
    ctx.fillStyle = "#3d2b1f";
    ctx.fillRect(dx, dy, doorW, doorH);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(dx + doorW * 0.55, dy + 10, 4, doorH - 20);
    ctx.fillStyle = "#c9a84c";
    ctx.beginPath();
    ctx.arc(dx + doorW / 2, dy + 4, doorW / 2 + 4, Math.PI, 0);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
  return texture;
}

// ── Decorator helpers ──
const woodMat = new THREE.MeshPhysicalMaterial({ color: 0x6b4226, roughness: 0.8 });
const metalMat = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.5 });
const darkMetalMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.3 });
const whiteMetalMat = new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.3, roughness: 0.3 });

function createTree(scene: THREE.Scene, x: number, z: number, scale = 1) {
  const g = new THREE.Group();
  const trunkH = 0.6 * scale;
  const trunkR = 0.08 * scale;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.6, trunkR, trunkH, 6), new THREE.MeshPhysicalMaterial({ color: 0x5c4033, roughness: 0.9 }));
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);
  const canopyR = 0.35 * scale;
  const colors = [0x2d8a4e, 0x3a9d5c, 0x4aad6a, 0x1e7a3e];
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) {
    const br = canopyR * (0.6 + Math.random() * 0.4);
    const b = new THREE.Mesh(new THREE.SphereGeometry(br, 7, 7), new THREE.MeshPhysicalMaterial({ color: colors[i % colors.length], roughness: 0.9 }));
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    b.position.set(Math.cos(a) * canopyR * 0.3, trunkH + (0.15 + Math.random() * 0.2) * scale, Math.sin(a) * canopyR * 0.3);
    b.castShadow = true;
    g.add(b);
  }
  g.position.set(x, 0, z);
  scene.add(g);
}

function createPineTree(scene: THREE.Scene, x: number, z: number, scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.5 * scale, 6), new THREE.MeshPhysicalMaterial({ color: 0x4a3728, roughness: 0.9 }));
  trunk.position.y = 0.25 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const tr = 0.25 * scale * (1 - i / tiers);
    const th = 0.25 * scale;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(tr, th, 6), new THREE.MeshPhysicalMaterial({ color: 0x1a5c2a, roughness: 0.9 }));
    cone.position.y = 0.5 * scale + i * 0.18 * scale;
    cone.castShadow = true;
    g.add(cone);
  }
  g.position.set(x, 0, z);
  scene.add(g);
}

function createLampPost(scene: THREE.Scene, x: number, z: number) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.2, 6), darkMetalMat);
  pole.position.y = 0.6;
  pole.castShadow = true;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 4), whiteMetalMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.1, 1.15, 0);
  g.add(arm);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffee, emissive: 0xffdd88, emissiveIntensity: 0.5, transparent: true, opacity: 0.6 }));
  bulb.position.set(0.22, 1.1, 0);
  g.add(bulb);
  const light = new THREE.PointLight(0xffdd88, 0.3, 2.5);
  light.position.set(0.22, 1.0, 0);
  g.add(light);
  g.position.set(x, 0, z);
  scene.add(g);
}

function createBench(scene: THREE.Scene, x: number, z: number, rotation = 0) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.18), woodMat);
  seat.position.y = 0.22;
  seat.castShadow = true;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.02), woodMat);
  back.position.set(0, 0.34, -0.1);
  back.castShadow = true;
  g.add(back);
  for (const lx of [-0.2, 0.2]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.22, 4), metalMat);
    leg.position.set(lx, 0.11, 0.07);
    g.add(leg);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  scene.add(g);
}

function createCloud(scene: THREE.Scene, x: number, y: number, z: number, scale = 1) {
  const g = new THREE.Group();
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 + Math.random() * 0.15, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = [[0, 0, 0.6], [-0.4, 0.1, 0.5], [0.4, 0.05, 0.5], [-0.2, 0.2, 0.35], [0.2, 0.15, 0.4]];
  for (const p of pts) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(p[2] * scale, 6, 6), cloudMat);
    s.position.set(p[0] * scale, p[1] * scale, 0);
    g.add(s);
  }
  g.position.set(x, y, z);
  scene.add(g);
}

function createCar(scene: THREE.Scene, x: number, z: number, color = 0xcc3333, rotation = 0) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, metalness: 0.3, clearcoat: 0.5 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x88bbee, transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0 });
  const wheelMat = new THREE.MeshPhysicalMaterial({ color: 0x222222, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.14), bodyMat);
  body.position.y = 0.06;
  body.castShadow = true;
  g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.12), glassMat);
  cabin.position.set(-0.02, 0.12, 0);
  g.add(cabin);
  for (const wx of [-0.1, 0.1]) {
    for (const wz of [-0.06, 0.06]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.03, 6), wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.02, wz);
      g.add(w);
    }
  }
  // Headlights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 4), lightMat);
  hl.position.set(0.16, 0.05, -0.05);
  g.add(hl);
  const hr = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 4), lightMat);
  hr.position.set(0.16, 0.05, 0.05);
  g.add(hr);
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  scene.add(g);
}

function createPerson(scene: THREE.Scene, x: number, z: number, rotation = 0) {
  const g = new THREE.Group();
  const skinMat = new THREE.MeshPhysicalMaterial({ color: 0xdeb887, roughness: 0.5 });
  const shirtColors = [0x4488cc, 0x44cc88, 0xcc4444, 0x8888cc, 0xcc8844];
  const pantsColors = [0x333355, 0x444444, 0x555533, 0x2a2a4a];
  const shirtMat = new THREE.MeshPhysicalMaterial({ color: shirtColors[Math.floor(Math.random() * shirtColors.length)], roughness: 0.5 });
  const pantsMat = new THREE.MeshPhysicalMaterial({ color: pantsColors[Math.floor(Math.random() * pantsColors.length)], roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 6), shirtMat);
  body.position.y = 0.18;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), skinMat);
  head.position.y = 0.26;
  g.add(head);
  const legMat = pantsMat;
  for (const lx of [-0.015, 0.015]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.1, 4), legMat);
    leg.position.set(lx, 0.07, 0);
    g.add(leg);
  }
  // Arm
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 4), skinMat);
  arm.position.set(0.05, 0.18, 0);
  arm.rotation.z = -0.3;
  g.add(arm);
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  scene.add(g);
}

function createTrashCan(scene: THREE.Scene, x: number, z: number) {
  const g = new THREE.Group();
  const canMat = new THREE.MeshPhysicalMaterial({ color: 0x556b2f, roughness: 0.6 });
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.16, 8), canMat);
  can.position.y = 0.08;
  can.castShadow = true;
  g.add(can);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.02, 8), new THREE.MeshPhysicalMaterial({ color: 0x44552a, roughness: 0.5 }));
  lid.position.y = 0.17;
  g.add(lid);
  g.position.set(x, 0, z);
  scene.add(g);
}

function createPicnicTable(scene: THREE.Scene, x: number, z: number, rotation = 0) {
  const g = new THREE.Group();
  const tableMat = new THREE.MeshPhysicalMaterial({ color: 0x8b5a2b, roughness: 0.7 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.25), tableMat);
  top.position.y = 0.2;
  top.castShadow = true;
  g.add(top);
  for (const tx of [-0.12, 0.12]) {
    for (const tz of [-0.1, 0.1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.02), tableMat);
      leg.position.set(tx, 0.1, tz);
      g.add(leg);
    }
  }
  // Benches on each side
  for (const bz of [-0.22, 0.22]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.06), tableMat);
    bench.position.set(0, 0.12, bz);
    g.add(bench);
    for (const bx of [-0.1, 0.1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), tableMat);
      leg.position.set(bx, 0.06, bz);
      g.add(leg);
    }
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  scene.add(g);
}

function createBikeRack(scene: THREE.Scene, x: number, z: number, rotation = 0) {
  const g = new THREE.Group();
  const rackMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.4, roughness: 0.3 });
  for (let i = -0.2; i <= 0.2; i += 0.1) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 8), rackMat);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(i, 0.06, 0);
    g.add(hoop);
  }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.015, 0.015), rackMat);
  bar.position.set(0, 0.02, 0);
  g.add(bar);
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  scene.add(g);
}

function createFireHydrant(scene: THREE.Scene, x: number, z: number) {
  const g = new THREE.Group();
  const redMat = new THREE.MeshPhysicalMaterial({ color: 0xcc2222, roughness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.12, 8), redMat);
  body.position.y = 0.06;
  body.castShadow = true;
  g.add(body);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
  dome.position.y = 0.12;
  g.add(dome);
  // Side outlets
  for (const a of [0, Math.PI / 2]) {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.03, 6), new THREE.MeshPhysicalMaterial({ color: 0xaa2222, metalness: 0.3, roughness: 0.3 }));
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.set(Math.cos(a) * 0.045, 0.06, Math.sin(a) * 0.045);
    g.add(nozzle);
  }
  g.position.set(x, 0, z);
  scene.add(g);
}

function createFlowerBed(scene: THREE.Scene, x: number, z: number) {
  const g = new THREE.Group();
  const soilMat = new THREE.MeshPhysicalMaterial({ color: 0x3d2b1f, roughness: 0.9 });
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 8), soilMat);
  bed.position.y = 0.02;
  scene.add(bed);
  // Flowers
  const flowerColors = [0xff4466, 0xff8844, 0xffdd44, 0xff44aa, 0x8844ff];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
    const d = 0.06 + Math.random() * 0.08;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.06, 4), new THREE.MeshPhysicalMaterial({ color: 0x2a7a2a }));
    stem.position.set(Math.cos(a) * d, 0.06, Math.sin(a) * d);
    g.add(stem);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.015 + Math.random() * 0.01, 5, 5), new THREE.MeshPhysicalMaterial({ color: flowerColors[i % flowerColors.length], roughness: 0.3 }));
    fl.position.set(Math.cos(a) * d, 0.1, Math.sin(a) * d);
    g.add(fl);
  }
  g.position.set(x, 0, z);
  scene.add(g);
}

function createHedge(scene: THREE.Scene, x: number, z: number, w = 0.4, d = 0.15, h = 0.2) {
  const hedgeMat = new THREE.MeshPhysicalMaterial({ color: 0x2a7a2a, roughness: 0.9 });
  const hedge = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hedgeMat);
  hedge.position.set(x, h / 2, z);
  hedge.castShadow = true;
  scene.add(hedge);
}

function createACUnit(scene: THREE.Scene, bx: number, bz: number, bh: number) {
  const g = new THREE.Group();
  const acMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.3, roughness: 0.3 });
  const unit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.1), acMat);
  unit.position.set(bx + (Math.random() > 0.5 ? 0.5 : -0.5) * 0.6, bh + 0.1, bz + (Math.random() > 0.5 ? 0.3 : -0.3) * 0.4);
  unit.castShadow = true;
  g.add(unit);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.005, 6), new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.2 }));
  fan.position.set(unit.position.x, unit.position.y, unit.position.z + 0.06);
  fan.userData.isFan = true;
  g.add(fan);
  scene.add(g);
}

function createDirectionalSign(scene: THREE.Scene, x: number, z: number, rotation = 0) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.6, 4), darkMetalMat);
  post.position.y = 0.3;
  g.add(post);
  const signMat = new THREE.MeshPhysicalMaterial({ color: 0x2255aa, roughness: 0.3 });
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.005), signMat);
    arm.position.set(0.08, 0.35 + i * 0.08, 0);
    arm.rotation.y = (i - 1) * Math.PI / 6;
    g.add(arm);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  scene.add(g);
}

function createBuildingSign(scene: THREE.Scene, bx: number, bz: number, bh: number, w: number, text: string) {
  const g = new THREE.Group();
  const signMat = new THREE.MeshPhysicalMaterial({ color: 0x222244, roughness: 0.3, metalness: 0.1 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 0.08, 0.02), signMat);
  sign.position.set(bx, bh * 0.6, bz - 1.5);
  g.add(sign);
  const sprite = createTextSprite(text, 24, "#ffffff", "transparent", 6);
  sprite.position.set(bx, bh * 0.6, bz - 1.48);
  sprite.scale.set(w * 0.35, 0.07, 1);
  g.add(sprite);
  scene.add(g);
}

function findPath(fromX: number, fromZ: number, toX: number, toZ: number, _buildings: BuildingData[]): { x: number; z: number }[] {
  return [{ x: fromX, z: fromZ }, { x: (fromX + toX) / 2 + (toZ - fromZ) * 0.15, z: (fromZ + toZ) / 2 + (toX - fromX) * -0.15 }, { x: toX, z: toZ }];
}

function formatDistance(dist: number): string {
  const meters = Math.round(dist * 10);
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}

function Minimap({ buildings, selected, sceneRef }: {
  buildings: BuildingData[];
  selected: BuildingData | null;
  sceneRef: React.MutableRefObject<{
    scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; controls: OrbitControls;
    frameId: number; raycaster: THREE.Raycaster; mouse: THREE.Vector2; buildingMeshes: Map<string, THREE.Mesh>;
    routeLine: THREE.Line | null; markerPulse: { mesh: THREE.Mesh; time: number } | null; labelGroup: THREE.Group;
  } | null>;
}) {
  const xs = buildings.map((b) => b.positionX);
  const zs = buildings.map((b) => b.positionZ);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const rangeX = maxX - minX || 1, rangeZ = maxZ - minZ || 1, pad = 4;
  const toScreen = (x: number, z: number) => {
    const scale = Math.min(32 / (rangeX + pad * 2), 32 / (rangeZ + pad * 2));
    return { sx: ((x - minX + pad) / (rangeX + pad * 2)) * 36 * scale + (36 - 36 * scale) / 2, sy: ((z - minZ + pad) / (rangeZ + pad * 2)) * 36 * scale + (36 - 36 * scale) / 2 };
  };
  const cam = sceneRef.current?.camera;
  const target = sceneRef.current?.controls.target;
  const camPos = cam ? toScreen(cam.position.x, cam.position.z) : null;
  const targetPos = target ? toScreen(target.x, target.z) : null;
  return (
    <div className="absolute bottom-4 right-4 z-20 w-40 h-40 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="relative w-full h-full p-2">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          {buildings.map((b) => buildings.filter((b2) => { const dx = b2.positionX - b.positionX, dz = b2.positionZ - b.positionZ; return Math.sqrt(dx * dx + dz * dz) < 12 && b2.id > b.id; }).map((b2) => { const f = toScreen(b.positionX, b.positionZ), t = toScreen(b2.positionX, b2.positionZ); return <line key={`${b.id}-${b2.id}`} x1={f.sx} y1={f.sy} x2={t.sx} y2={t.sy} stroke="rgba(99,102,241,0.2)" strokeWidth={0.3} />; }))}
          {buildings.map((b) => { const { sx, sy } = toScreen(b.positionX, b.positionZ); return <rect key={b.id} x={sx - 0.5} y={sy - 0.5} width={1} height={1} rx={0.3} fill={b.color} opacity={selected?.id === b.id ? 1 : 0.6} stroke={selected?.id === b.id ? "#22d3ee" : "none"} strokeWidth={0.3} />; })}
          {camPos && targetPos && <polygon points={`${camPos.sx},${camPos.sy} ${targetPos.sx - 0.5},${targetPos.sy + 2} ${targetPos.sx + 0.5},${targetPos.sy + 2}`} fill="rgba(99,102,241,0.3)" />}
        </svg>
      </div>
    </div>
  );
}

export function CampusViewer({ buildings }: { buildings: BuildingData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<BuildingData | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [search, setSearch] = useState("");
  const sceneRef = useRef<{
    scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; controls: OrbitControls;
    frameId: number; raycaster: THREE.Raycaster; mouse: THREE.Vector2; buildingMeshes: Map<string, THREE.Mesh>;
    routeLine: THREE.Line | null; markerPulse: { mesh: THREE.Mesh; time: number } | null; labelGroup: THREE.Group;
  } | null>(null);
  const [filtered, setFiltered] = useState<BuildingData[]>(buildings);

  useEffect(() => { const q = search.toLowerCase(); setFiltered(q ? buildings.filter((b) => b.name.toLowerCase().includes(q) || (b.department && b.department.toLowerCase().includes(q)) || (b.abbreviation && b.abbreviation.toLowerCase().includes(q))) : buildings); }, [search, buildings]);

  const resetView = useCallback(() => { const ref = sceneRef.current; if (!ref) return; ref.controls.target.set(0, 1.5, 0); ref.camera.position.set(22, 18, 22); ref.controls.update(); setSelected(null); setRoute(null); }, []);
  const flyTo = useCallback((building: BuildingData) => { const ref = sceneRef.current; if (!ref) return; ref.controls.target.set(building.positionX, 1.5, building.positionZ); ref.camera.position.set(building.positionX + 8, 5, building.positionZ + 8); ref.controls.update(); setSelected(building); }, []);
  const navigateTo = useCallback((building: BuildingData) => {
    if (!selected) { setSelected(building); flyTo(building); return; }
    if (selected.id === building.id) return;
    const waypoints = findPath(selected.positionX, selected.positionZ, building.positionX, building.positionZ, buildings);
    const dx = building.positionX - selected.positionX, dz = building.positionZ - selected.positionZ, dist = Math.sqrt(dx * dx + dz * dz);
    setRoute({ from: { x: selected.positionX, z: selected.positionZ }, to: { x: building.positionX, z: building.positionZ }, waypoints, fromName: selected.name, toName: building.name, distance: dist });
    const ref = sceneRef.current;
    if (ref) {
      if (ref.routeLine) { ref.scene.remove(ref.routeLine); ref.routeLine.geometry.dispose(); (ref.routeLine.material as THREE.Material).dispose(); ref.routeLine = null; }
      const points = waypoints.map((w) => new THREE.Vector3(w.x, 0.15, w.z));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(points).getPoints(50)), new THREE.LineBasicMaterial({ color: 0x22d3ee }));
      ref.scene.add(line); ref.routeLine = line;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
      dot.position.set(building.positionX, 0.3, building.positionZ); ref.scene.add(dot); ref.markerPulse = { mesh: dot, time: 0 };
    }
    setSelected(building); flyTo(building);
  }, [selected, buildings, flyTo]);

  useEffect(() => {
    if (!containerRef.current || buildings.length === 0) return;
    const container = containerRef.current;
    const width = container.clientWidth, height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(22, 18, 22);
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
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 55;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 1.5, 0);

    // ── Sky ──
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 2; skyCanvas.height = 512;
    const sctx = skyCanvas.getContext("2d")!;
    const grad = sctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#1a3a6b"); grad.addColorStop(0.3, "#4a8fd4"); grad.addColorStop(0.55, "#87ceeb");
    grad.addColorStop(0.75, "#c9e8f0"); grad.addColorStop(0.9, "#e8f0d5"); grad.addColorStop(1, "#d4c9a8");
    sctx.fillStyle = grad; sctx.fillRect(0, 0, 2, 512);
    const skyMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(skyCanvas), side: THREE.BackSide });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 32), skyMat));

    // Sun
    const sun = new THREE.DirectionalLight(0xffeedd, 2.8);
    sun.position.set(25, 30, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048; sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 65;
    sun.shadow.camera.left = -35; sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35;
    scene.add(sun);

    // Sun disk
    const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffeedd, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    sunDisk.position.set(25, 30, 15);
    scene.add(sunDisk);

    const ambient = new THREE.AmbientLight(0x8899bb, 0.45);
    scene.add(ambient);
    const fillLight = new THREE.DirectionalLight(0x99bbff, 0.3);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xccddff, 0.15);
    rimLight.position.set(-5, 2, -20);
    scene.add(rimLight);

    // ── Clouds ──
    for (const cld of [[-18, 14, -10, 1.2], [-8, 12, -12, 0.8], [5, 13, -8, 0.9], [15, 11, 5, 1.1], [10, 15, -15, 0.7], [-5, 14, 12, 1.0], [18, 13, -5, 0.8]]) {
      createCloud(scene, cld[0], cld[1], cld[2], cld[3]);
    }

    // ── Roads ──
    const roadMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, roughness: 0.9 });
    const roadSegments: [number, number, number, number, number][] = [
      [-6, 0, 0.8, 22, -15], // bottom horizontal
      [-6, 0, 0.8, 22, 14],  // top horizontal
      [-17, 0, 14, 0.8, 0.5], // left vertical
      [3, 0, 14, 0.8, 0.5],   // right vertical
      // Main entrance drive
      [-0.9, 0, 0.8, 3, -11.5],
    ];
    for (const rx of roadSegments) {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(rx[2], rx[3]), roadMat);
      r.rotation.x = -Math.PI / 2;
      r.position.set(rx[0], 0.005, rx[4]);
      r.receiveShadow = true;
      scene.add(r);
    }

    // Road center dashes
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.3 });
    for (let z = -14; z <= 12; z += 1.2) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.2), dashMat);
      d.rotation.x = -Math.PI / 2;
      d.position.set(0, 0.006, z);
      scene.add(d);
    }

    // Crosswalks
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    for (let i = 0; i < 4; i++) {
      const cw = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.4), crossMat);
      cw.rotation.x = -Math.PI / 2;
      cw.position.set(-0.7 + i * 0.16, 0.007, -7.5);
      scene.add(cw);
    }
    for (let i = 0; i < 4; i++) {
      const cw = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.4), crossMat);
      cw.rotation.x = -Math.PI / 2;
      cw.position.set(-0.7 + i * 0.16, 0.007, 3.5);
      scene.add(cw);
    }

    // Manhole covers on road
    const manholeMat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.3, roughness: 0.5 });
    for (const mh of [[-2, -8], [2, -3], [-1.5, 6], [3, 10]]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8), manholeMat);
      m.position.set(mh[0], 0.008, mh[1]);
      scene.add(m);
    }

    // ── Ground ──
    const gCanvas = document.createElement("canvas"); gCanvas.width = 512; gCanvas.height = 512;
    const gctx = gCanvas.getContext("2d")!;
    for (let x = 0; x < 512; x++) for (let y = 0; y < 512; y++) { const n = (Math.random() - 0.5) * 25; gctx.fillStyle = `rgb(${Math.floor(70 + n)},${Math.floor(140 + n * 1.5)},${Math.floor(50 + n)})`; gctx.fillRect(x, y, 1, 1); }
    const groundTex = new THREE.CanvasTexture(gCanvas);
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping; groundTex.repeat.set(6, 6);
    const groundMat = new THREE.MeshPhysicalMaterial({ map: groundTex, roughness: 0.9, metalness: 0 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), groundMat);
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
    scene.add(ground);

    // ── Sidewalks ──
    const swMat = new THREE.MeshPhysicalMaterial({ color: 0xb8a88a, roughness: 0.8 });
    for (const sw of [[-4.8, -4.5, 0.6, 6], [4.8, -4.5, 0.6, 6], [0, -6.5, 8, 0.5], [0, 4.5, 8, 0.5], [-8.5, 2, 0.5, 8], [8.5, 2, 0.5, 8]]) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(sw[2], sw[3]), swMat);
      s.rotation.x = -Math.PI / 2; s.position.set(sw[0], 0.007, sw[1]); s.receiveShadow = true;
      scene.add(s);
    }

    // ── Main Quad Plaza ──
    const quadMat = new THREE.MeshPhysicalMaterial({ color: 0xc9b18a, roughness: 0.7, metalness: 0.05 });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), quadMat);
    quad.rotation.x = -Math.PI / 2; quad.position.set(0, 0.01, -1); quad.receiveShadow = true;
    scene.add(quad);

    const borderMat = new THREE.MeshPhysicalMaterial({ color: 0x8a7a5a, roughness: 0.8 });
    for (const bd of [[0, 0.04, -4.5, 9.2, 0.04, 0.15], [0, 0.04, 2.5, 9.2, 0.04, 0.15], [-4.6, 0.04, -1, 0.15, 0.04, 7.2], [4.6, 0.04, -1, 0.15, 0.04, 7.2]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bd[3], bd[4], bd[5]), borderMat);
      b.position.set(bd[0], bd[1], bd[2]); scene.add(b);
    }

    // ── Fountain (detailed) ──
    const fg = new THREE.Group();
    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.35, 16), new THREE.MeshPhysicalMaterial({ color: 0x999999, roughness: 0.3, metalness: 0.2 }));
    fBase.position.y = 0.175; fBase.receiveShadow = true; fBase.castShadow = true; fg.add(fBase);
    // Step 2
    const fStep = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.15, 16), new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 0.2, roughness: 0.3 }));
    fStep.position.y = 0.35; fg.add(fStep);
    const fPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.55, 8), new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 0.3, roughness: 0.2 }));
    fPillar.position.y = 0.55; fg.add(fPillar);
    const fBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.12, 12), new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.2, roughness: 0.3 }));
    fBowl.position.y = 0.8; fg.add(fBowl);
    // Upper basin
    const fUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.08, 10), new THREE.MeshPhysicalMaterial({ color: 0x999999, metalness: 0.2, roughness: 0.3 }));
    fUpper.position.y = 0.95; fg.add(fUpper);
    const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x4a9ebb, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.3 });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10), waterMat); water.position.y = 0.98; fg.add(water);
    const waterLower = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 10), waterMat); waterLower.position.y = 0.72; fg.add(waterLower);
    fg.position.set(0, 0, -1); scene.add(fg);

    // ── Buildings ──
    const buildingMeshes = new Map<string, THREE.Mesh>();
    const labelGroup = new THREE.Group();

    for (const b of buildings) {
      const bg = new THREE.Group();
      const w = b.width, d = b.depth, h = b.height;
      const stories = Math.max(2, Math.floor(h / 0.8));
      const windowsX = Math.max(2, Math.floor(w / 0.8));
      const facadeTex = createFacadeTexture(b.color, stories, windowsX, b.name.includes("Admin"));

      const bodyMat = new THREE.MeshPhysicalMaterial({ map: facadeTex, roughness: 0.4, metalness: 0.05 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
      body.position.y = h / 2; body.castShadow = true; body.receiveShadow = true;
      body.userData.buildingId = b.id;
      bg.add(body);

      // Roof
      const roofMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(b.color).multiplyScalar(0.7), roughness: 0.6 });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.08, d + 0.1), roofMat);
      roof.position.y = h + 0.04; bg.add(roof);

      const edgeMat2 = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(b.color).multiplyScalar(0.5), metalness: 0.3, roughness: 0.3 });
      const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.04, d + 0.15), edgeMat2);
      edge.position.y = h + 0.1; bg.add(edge);

      // Entrance canopy (front side)
      const canopyMat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.4, roughness: 0.3 });
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, 0.04, 0.2), canopyMat);
      canopy.position.set(0, 0.3, -d / 2 - 0.05);
      bg.add(canopy);

      bg.position.set(b.positionX, 0, b.positionZ);
      scene.add(bg);
      buildingMeshes.set(b.id, body);

      // Ground ring
      const glowR = Math.max(w, d) * 0.55;
      const glowMesh = new THREE.Mesh(new THREE.RingGeometry(glowR * 0.7, glowR, 24), new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      glowMesh.rotation.x = -Math.PI / 2; glowMesh.position.set(b.positionX, 0.015, b.positionZ);
      scene.add(glowMesh);

      // AC units on roof
      createACUnit(scene, b.positionX, b.positionZ, h);

      // Building name sign
      if (b.abbreviation) createBuildingSign(scene, b.positionX, b.positionZ, h, w, b.abbreviation);

      // Label sprite
      const sprite = createTextSprite(b.abbreviation || b.name, 32, "#ffffff", "rgba(0,0,0,0.45)", 10);
      sprite.position.set(b.positionX, h + 1.8, b.positionZ);
      labelGroup.add(sprite);
    }
    scene.add(labelGroup);

    // ── Pathways ──
    const pathMat = new THREE.MeshPhysicalMaterial({ color: 0xc9b18a, roughness: 0.8, metalness: 0, transparent: true, opacity: 0.6 });
    const pathPairs: [number, number, number, number, number][] = [
      [0, -1, -2, -3.5, 1], [0, -1, 2, -3.5, 1], [0, -1, -5, 2, 1], [0, -1, 5, 3, 1],
      [0, -1, -4.5, 5, 1], [0, -1, 3.5, 5, 1], [0, -1, 0, 6.5, 0.8], [0, -1, -5, -5, 0.8],
      [0, -1, 5, -5, 0.8], [-2, -3.5, -5.5, -5.5, 0.6], [2, -3.5, 5.5, -5.5, 0.6],
      [-5, 2, -9, 3, 0.6], [5, 3, 10, 4, 0.6], [0, 6.5, 0, 11, 0.6],
      [-5, -5, -7.5, -8, 0.6], [5, -5, 6.5, -8, 0.6], [-5, 2, -10, 8, 0.6], [5, 3, 10, 8, 0.6],
      [-5, -5, -3, -9, 0.6], [-7.5, -8, -9, -9, 0.5], [7.5, -8, 8.5, -10, 0.5],
      // Crosswalks continuation
      [-0.8, -7.5, -0.8, -5, 0.5], [0.8, -7.5, 0.8, -5, 0.5],
    ];
    for (const [x1, z1, x2, z2, pw] of pathPairs) {
      const angle = Math.atan2(z2 - z1, x2 - x1);
      const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(len, pw), pathMat);
      p.rotation.x = -Math.PI / 2; p.position.set((x1 + x2) / 2, 0.012, (z1 + z2) / 2);
      p.rotation.z = angle; p.receiveShadow = true; scene.add(p);
    }

    // ── Trees ──
    const treeLocs: [number, number, number, boolean][] = [
      [-1.5, -2.5, 0.8, false], [1.5, -2.5, 0.8, false],
      [-2, 0, 0.9, false], [2, 0, 0.9, false],
      [-1.5, 1.5, 0.7, false], [1.5, 1.5, 0.7, false],
      [-3.5, 3, 0.8, false], [3.5, 3, 0.8, false],
      [-4.5, 0.5, 0.9, false], [4.5, 0.5, 0.9, false],
      [-8, -4, 0.7, false], [9, 4, 0.7, false],
      [-8, 5, 0.8, false], [10, 5, 0.8, false],
      [-11, 7, 0.7, false], [12, 7, 0.7, false],
      [-11, 10, 0.6, false], [12, 10, 0.6, false],
      [-7, -8, 0.7, false], [7, -8, 0.7, false],
      [-3, -10, 0.6, false], [5, -10, 0.6, false],
      [-13, 0, 0.7, false], [13, 1, 0.7, false],
      [-10, -2, 0.6, false], [11, -2, 0.6, false],
      [-14, 5, 0.6, false], [14, 6, 0.6, false],
      [-6, 8, 0.7, false], [6, 8, 0.7, false],
      [-13, -5, 0.6, false], [13, -5, 0.6, false],
      // Pine trees (evergreens)
      [-12, -4, 0.7, true], [12, -4, 0.7, true],
      [-12, 4, 0.6, true], [12, 4, 0.6, true],
      [-9, -9, 0.6, true], [9, -9, 0.6, true],
      [-14, -7, 0.5, true], [14, -7, 0.5, true],
    ];
    for (const [tx, tz, sc, isPine] of treeLocs) {
      if (isPine) createPineTree(scene, tx, tz, sc);
      else createTree(scene, tx, tz, sc);
    }

    // ── Hedges ──
    createHedge(scene, -3, -4.2, 0.6, 0.2, 0.2);
    createHedge(scene, 3, -4.2, 0.6, 0.2, 0.2);
    createHedge(scene, -5.5, 3.5, 0.8, 0.2, 0.18);
    createHedge(scene, 5.5, 3.5, 0.8, 0.2, 0.18);
    createHedge(scene, -9.5, -8.5, 0.5, 0.15, 0.15);
    createHedge(scene, 8.5, -8.5, 0.5, 0.15, 0.15);

    // ── Flower Beds ──
    createFlowerBed(scene, -5.5, -2);
    createFlowerBed(scene, 5.5, -2);
    createFlowerBed(scene, -6, 5);
    createFlowerBed(scene, 6, 5);
    createFlowerBed(scene, 0, -5);

    // ── Lamp Posts ──
    const lampLocs: [number, number][] = [
      [-3.5, -3.5], [3.5, -3.5], [-3.5, 1.5], [3.5, 1.5],
      [-5, -3], [5, -3], [-5.5, 2], [5.5, 2],
      [-7, 5], [7, 5], [-9, 7], [9, 7],
      [-4, -8], [-2, 5.5], [2, 5.5],
      // Road lamps
      [-8, -9], [8, -9], [-8, 10], [8, 10],
      [-12, -2], [12, -2],
    ];
    for (const [lx, lz] of lampLocs) createLampPost(scene, lx, lz);

    // ── Benches ──
    const benchLocs: [number, number, number][] = [
      [-2.2, -1.5, 0.2], [2.2, -1.5, -0.2], [-2.2, 0.8, 0.2], [2.2, 0.8, -0.2],
      [-5, 1.5, 1.2], [5, 1.5, -1.2], [-7, 6, 0.8], [7, 6, -0.8],
      [-4, -8.5, 0.3], [4, -8.5, -0.3],
    ];
    for (const [bx, bz, rot] of benchLocs) createBench(scene, bx, bz, rot);

    // ── Picnic Tables ──
    createPicnicTable(scene, 6, -7.5, 0.5);
    createPicnicTable(scene, 2.5, -8, -0.3);
    createPicnicTable(scene, -1.5, 9.5, 0.8);

    // ── Trash Cans ──
    for (const tc of [[-3, -3.5], [3, -3.5], [-5, 1], [5, 1], [-6, 7], [6, 7], [0, -7.5], [-8.5, -1], [8.5, -1]]) {
      createTrashCan(scene, tc[0], tc[1]);
    }

    // ── Bike Racks ──
    createBikeRack(scene, -1.5, 8.5, 0);
    createBikeRack(scene, 2, -7, 0.5);

    // ── Fire Hydrants ──
    createFireHydrant(scene, -5, -6);
    createFireHydrant(scene, 5, -6);
    createFireHydrant(scene, -8, 8);
    createFireHydrant(scene, 8, 8);

    // ── Directional Signs ──
    createDirectionalSign(scene, -6, -3, 0.3);
    createDirectionalSign(scene, 6, -3, -0.3);
    createDirectionalSign(scene, 0, 6, Math.PI);

    // ── Cars in Parking Lot ──
    const carPositions: [number, number, number, number][] = [
      [-0.2, 14.2, 0xcc3333, 0], [0.5, 14.5, 0x2244aa, 0], [0.8, 14.0, 0xcccccc, Math.PI],
      [-0.5, 15.0, 0x44aa44, 0], [0.2, 13.7, 0x222222, Math.PI],
      // Extra parking near gym
      [-2.5, -10.5, 0xcc3333, 0.5], [-1.8, -10.8, 0x2244aa, 0.5], [-3.2, -10.2, 0xcccccc, -0.3],
    ];
    for (const [cx, cz, col, rot] of carPositions) createCar(scene, cx, cz, col, rot);

    // ── Bus ──
    (() => {
      const g = new THREE.Group();
      const busMat = new THREE.MeshPhysicalMaterial({ color: 0xddbb33, roughness: 0.3 });
      const busGlass = new THREE.MeshPhysicalMaterial({ color: 0x88bbee, transparent: true, opacity: 0.4, roughness: 0.1 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.2), busMat);
      body.position.y = 0.1; body.castShadow = true; g.add(body);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.18), busGlass);
      cabin.position.set(-0.05, 0.2, 0); g.add(cabin);
      for (const wx of [-0.2, 0.2]) for (const wz of [-0.08, 0.08]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.03, 6), new THREE.MeshPhysicalMaterial({ color: 0x222222, roughness: 0.8 })); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.02, wz); g.add(w); }
      g.position.set(5.5, 0, -9.5);
      g.rotation.y = 0.5;
      scene.add(g);
    })();

    // ── Pedestrians ──
    const peopleLocs: [number, number, number][] = [
      [-2, -1.5, 0.2], [1.5, -2, -0.3], [-0.5, 0.5, 0.8], [0.5, 1.5, -0.5],
      [-3.5, -2.8, 0.1], [4, -0.5, -0.7], [-2, 3.5, 0.9], [3, 4, -0.4],
      [-8, 5.5, 0.3], [8.5, 5, -0.5], [-4, -7, 0.6], [4.5, -7.5, -0.3],
      [-0.5, -5, 0], [-11, 1.5, 0.4], [11, 2, -0.4],
    ];
    for (const [px, pz, prot] of peopleLocs) createPerson(scene, px, pz, prot);

    // ── Sports Field (detailed) ──
    const fieldMat = new THREE.MeshPhysicalMaterial({ color: 0x3a8c3a, roughness: 0.9 });
    const field = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.5), fieldMat);
    field.rotation.x = -Math.PI / 2; field.position.set(-4, 0.011, -12.5); field.receiveShadow = true;
    scene.add(field);

    // Track (oval around field)
    const trackMat = new THREE.MeshPhysicalMaterial({ color: 0x8a3a3a, roughness: 0.6 });
    const track = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.3, 32), trackMat);
    track.rotation.x = -Math.PI / 2; track.position.set(-4, 0.012, -12.5);
    scene.add(track);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const fieldLines = [
      [0, -12.5, 4.8, 0.04], [0, -12.5, 0.04, 3.3], [-2.3, -12.5, 0.04, 0.3],
      [2.3, -12.5, 0.04, 0.3], [-2.3, -12.5, 0.04, 3.3], [2.3, -12.5, 0.04, 3.3],
      [-2.3, -10.9, 3.6, 0.04], [-2.3, -14.1, 3.6, 0.04],
    ];
    for (const [lx, lz, lw, ld] of fieldLines) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(lw, ld), lineMat);
      line.rotation.x = -Math.PI / 2; line.position.set(-4 + lx, 0.012, lz);
      scene.add(line);
    }

    // Goal posts
    const goalMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.3 });
    for (const gz of [-14.2, -10.8]) {
      for (const gx of [-6.2, -1.8]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4), goalMat);
        p.position.set(gx, 0.25, gz); scene.add(p);
      }
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.4, 4), goalMat);
      bar.rotation.x = Math.PI / 2; bar.position.set(-4, 0.5, gz); scene.add(bar);
    }

    // Bleachers
    const bleacherMat = new THREE.MeshPhysicalMaterial({ color: 0x6688aa, roughness: 0.6 });
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.2), bleacherMat);
      step.position.set(-4, 0.04 + i * 0.1, -10.0 + i * 0.25);
      scene.add(step);
    }
    // Bleacher seats (colored)
    const seatColors = [0xcc3333, 0xcc8833, 0x33aa33];
    for (let row = 0; row < 3; row++) {
      for (let col = -0.4; col <= 0.4; col += 0.2) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.04), new THREE.MeshPhysicalMaterial({ color: seatColors[Math.floor(Math.random() * seatColors.length)], roughness: 0.5 }));
        s.position.set(-4 + col, 0.08 + row * 0.1, -10.0 + row * 0.25 + 0.08);
        scene.add(s);
      }
    }

    // Scoreboard
    const sbMat = new THREE.MeshPhysicalMaterial({ color: 0x223344, roughness: 0.3 });
    const sb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.05), sbMat);
    sb.position.set(-0.5, 1.0, -11.5);
    scene.add(sb);
    for (const sx of [-0.5, 0.5]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 1.0, 4), whiteMetalMat);
      pole.position.set(sx * 0.35, 0.5, -11.5);
      scene.add(pole);
    }

    // ── Parking Lot (expanded) ──
    const lotMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, roughness: 0.9, metalness: 0 });
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2), lotMat);
    lot.rotation.x = -Math.PI / 2; lot.position.set(0, 0.008, 14.5); lot.receiveShadow = true;
    scene.add(lot);

    const parkLineMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.3 });
    for (let i = -1; i <= 1; i += 0.67) {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 1.5), parkLineMat);
      pl.rotation.x = -Math.PI / 2; pl.position.set(i, 0.009, 14.5); scene.add(pl);
    }

    // ── Bus Stop ──
    const bsGroup = new THREE.Group();
    const bsPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.8, 4), darkMetalMat);
    bsPole.position.y = 0.4; bsGroup.add(bsPole);
    const bsSign = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.02), new THREE.MeshPhysicalMaterial({ color: 0x2255aa, emissive: 0x2255aa, emissiveIntensity: 0.2 }));
    bsSign.position.set(0, 0.6, 0); bsGroup.add(bsSign);
    const bsText = createTextSprite("BUS", 20, "#ffffff", "rgba(0,0,0,0.4)", 6);
    bsText.position.set(0, 0.6, 0.05); bsText.scale.set(0.3, 0.15, 1); bsGroup.add(bsText);
    bsGroup.position.set(6, 0, -10); scene.add(bsGroup);

    // ── Flag Pole ──
    const flagGroup = new THREE.Group();
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 2.5, 6), whiteMetalMat);
    flagPole.position.y = 1.25; flagPole.castShadow = true; flagGroup.add(flagPole);
    const flagMat = new THREE.MeshPhysicalMaterial({ color: 0x1a3a6b, side: THREE.DoubleSide, roughness: 0.5 });
    const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), flagMat);
    flagMesh.position.set(0.25, 2.2, 0); flagMesh.userData = { waveTime: 0 }; flagGroup.add(flagMesh);
    const fBall = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshPhysicalMaterial({ color: 0xffcc00, metalness: 0.5, roughness: 0.2 }));
    fBall.position.y = 2.5; flagGroup.add(fBall);
    flagGroup.position.set(-4.5, 0, -4); scene.add(flagGroup);

    // ── Campus Entrance Sign ──
    const signGroup = new THREE.Group();
    const spMat = new THREE.MeshPhysicalMaterial({ color: 0x8a7a5a, roughness: 0.7 });
    const sp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.0, 4), spMat);
    sp1.position.set(-0.5, 0.5, 0); signGroup.add(sp1);
    const sp2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.0, 4), spMat);
    sp2.position.set(0.5, 0.5, 0); signGroup.add(sp2);
    const sb2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.03), new THREE.MeshPhysicalMaterial({ color: 0x3d2b1f }));
    sb2.position.set(0, 0.65, 0); signGroup.add(sb2);
    const st = createTextSprite("AR ELMS", 56, "#c9a84c", "transparent", 12);
    st.position.set(0, 0.66, 0.04); st.scale.set(1.2, 0.3, 1); signGroup.add(st);
    const st2 = createTextSprite("EST. 2025", 24, "#c9a84c", "transparent", 6);
    st2.position.set(0, 0.5, 0.04); st2.scale.set(0.6, 0.12, 1); signGroup.add(st2);
    signGroup.position.set(0, 0, -7); scene.add(signGroup);

    // ── Shrubs ──
    const shrubMat = new THREE.MeshPhysicalMaterial({ color: 0x3a7a3a, roughness: 0.9 });
    const shrubPos: [number, number][] = [
      [-2.5, -4], [2.5, -4], [-3.5, 2.5], [3.5, 2.5], [-11, -9], [12, -9],
      [-13, 8], [13, 8], [-5.5, -11.5], [-2.5, -11.5], [-7, 7.5], [7, 7.5],
      [-9, -6], [10, -6],
    ];
    for (const [sx, sz] of shrubPos) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.2 + Math.random() * 0.15, 6, 6), shrubMat);
      s.position.set(sx, 0.13, sz); scene.add(s);
    }

    // ── Raycaster ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(buildingMeshes.values());
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const buildingId = hit.userData.buildingId as string;
        const building = buildings.find((b) => b.id === buildingId);
        if (building) navigateTo(building);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    sceneRef.current = { scene, camera, renderer, controls, frameId: 0, raycaster, mouse, buildingMeshes, routeLine: null, markerPulse: null, labelGroup };

    // ── Animation ──
    const clock = new THREE.Clock();
    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      controls.update();

      // Fountain
      water.position.y = 0.98 + Math.sin(elapsed * 1.5) * 0.02;
      waterLower.position.y = 0.72 + Math.sin(elapsed * 1.2 + 0.5) * 0.015;
      waterMat.opacity = 0.4 + Math.sin(elapsed * 2) * 0.1;

      // Water particles
      if (elapsed % 1.5 < 0.08) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 }));
        p.position.set((Math.random() - 0.5) * 0.25, 1.0, (Math.random() - 0.5) * 0.25);
        p.userData = { vy: 0.4 + Math.random() * 0.3, life: 0 };
        fg.add(p);
      }
      fg.children.forEach((child) => {
        if (child.userData && child.userData.vy !== undefined) {
          const p = child as THREE.Mesh;
          const data = p.userData as { vy: number; life: number };
          data.life += delta;
          p.position.y += data.vy * delta;
          data.vy -= 0.9 * delta;
          (p.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 - data.life * 0.8);
          if (data.life > 0.8) { fg.remove(p); p.geometry.dispose(); (p.material as THREE.MeshBasicMaterial).dispose(); }
        }
      });

      // Flag wave
      const fm = flagGroup.children.find((c) => c.type === "Mesh" && (c as THREE.Mesh).geometry.type === "PlaneGeometry") as THREE.Mesh | undefined;
      if (fm) {
        const pos = fm.geometry.attributes.position;
        const arr = pos.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) { arr[i + 2] = Math.sin(elapsed * 2.5 + arr[i] * 8) * 0.04; }
        pos.needsUpdate = true;
      }

      // AC fan rotation
      scene.children.forEach((c) => {
        if (c.type === "Group") {
          (c as THREE.Group).children.forEach((child) => {
            if ((child as THREE.Mesh).userData?.isFan) { child.rotation.z += delta * 10; }
          });
        }
      });

      // Labels billboard
      labelGroup.children.forEach((child) => child.lookAt(camera.position));

      // Route line
      if (sceneRef.current?.routeLine) {
        const mat = sceneRef.current.routeLine.material as THREE.LineBasicMaterial;
        const d = (elapsed * 0.5) % 1;
        mat.color.setHSL(0.55 + d * 0.1, 0.8, 0.6);
      }

      // Marker pulse
      if (sceneRef.current?.markerPulse) {
        const mp = sceneRef.current.markerPulse;
        mp.time += delta;
        mp.mesh.scale.setScalar(1 + Math.sin(mp.time * 3) * 0.3);
        (mp.mesh.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(mp.time * 3) * 0.3;
      }

      renderer.render(scene, camera);
      sceneRef.current!.frameId = frameId;
    };
    const frameId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => { const w = container.clientWidth, h = container.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.removeEventListener("click", onClick);
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [buildings, navigateTo]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#1a3a6b]" style={{ minHeight: "60vh" }}>
      <div className="absolute top-0 inset-x-0 z-20 p-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input type="text" placeholder="Search buildings or departments..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <button onClick={resetView}
          className="px-3 py-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-xs text-zinc-300 hover:text-white hover:border-amber-400/50 transition-colors flex items-center gap-1.5">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
          </svg>
          Reset
        </button>
      </div>

      {search && filtered.length > 0 && (
        <div className="absolute top-16 left-4 z-20 w-full max-w-md bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {filtered.slice(0, 8).map((b) => (
            <button key={b.id} onClick={() => { flyTo(b); setSearch(""); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-zinc-200 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
              <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
              <div className="min-w-0">
                <p className="font-medium truncate">{b.name}</p>
                {b.department && <p className="text-xs text-zinc-400 truncate">{b.department}</p>}
              </div>
              {b.abbreviation && <span className="ml-auto text-xs text-zinc-500 font-mono">{b.abbreviation}</span>}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-zinc-900/85 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-4 rounded-lg shrink-0" style={{ backgroundColor: selected.color }} />
            <h3 className="text-white font-bold">{selected.name}</h3>
            {selected.abbreviation && <span className="text-xs text-zinc-400 font-mono">{selected.abbreviation}</span>}
          </div>
          {selected.department && <p className="text-xs text-zinc-300 mb-1">{selected.department}</p>}
          {selected.description && <p className="text-xs text-zinc-400 leading-relaxed">{selected.description}</p>}
          {route && route.toName !== selected.name && <p className="text-xs text-cyan-400 mt-2">Route to {route.toName} &middot; {formatDistance(route.distance)}</p>}
          {route && route.toName === selected.name && (
            <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
              <span>From {route.fromName} &middot; {formatDistance(route.distance)}</span>
            </div>
          )}
        </div>
      )}

      <Minimap buildings={buildings} selected={selected} sceneRef={sceneRef} />
      <div ref={containerRef} className="w-full" style={{ minHeight: "60vh" }} />
    </div>
  );
}
