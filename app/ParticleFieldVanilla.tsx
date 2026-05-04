'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';

export default function ParticleFieldVanilla() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let composer: EffectComposer;
    let animationId: number;
    let particlesMesh: THREE.Points;
    let monsterGroup: THREE.Group | null = null;

    const loadGLTF = (path: string) =>
      new Promise<any>((resolve, reject) =>
        new GLTFLoader().load(path, resolve, undefined, reject)
      );

    const loadFBX = (path: string) =>
      new Promise<THREE.Group>((resolve, reject) =>
        new FBXLoader().load(path, resolve, undefined, reject)
      );

    const init = async () => {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.Fog(0x000000, 1, 10);

      const width = window.innerWidth;
      const height = window.innerHeight;

      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current?.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 20;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2;

      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(
        new EffectPass(camera, new BloomEffect({
          intensity: 2.0,
          luminanceThreshold: 0.15,
          luminanceSmoothing: 0.9,
        }))
      );

      // Shared lighting
      const light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(5, 5, 5);
      scene.add(light1);
      const light2 = new THREE.DirectionalLight(0xff00ff, 0.5);
      light2.position.set(-5, -5, 5);
      scene.add(light2);
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));

      createParticles();
      await loadSupermarket();
      await loadMonster();

      createUI();
      window.addEventListener('resize', onWindowResize);
      animate();
    };

    const createParticles = () => {
      const particleCount = 5000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        const t = i / particleCount;
        colors[i * 3]     = Math.sin(t * Math.PI) * 0.5 + 0.5;
        colors[i * 3 + 1] = Math.cos(t * Math.PI) * 0.5 + 0.5;
        colors[i * 3 + 2] = 1;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

      particlesMesh = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 0.015,
        vertexColors: true,
        transparent: true,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      }));
      scene.add(particlesMesh);
    };

    // Load supermarket independently
    const loadSupermarket = async () => {
      try {
        const gltf = await loadGLTF('/models/supermarket.glb');

        // Measure model depth for spacing
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const depth = (size.z * 1) || 20;

        // 2 rows in Z, 30 copies along X, gap of 2 between rows
        const copiesX = 30;
        const rowsZ = [0, depth + 6];
        rowsZ.forEach((zOffset, rowIdx) => {
          for (let i = 0; i < copiesX; i++) {
            const clone = gltf.scene.clone(true);
            clone.traverse((child: any) => {
              if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
            });
            clone.scale.set(2, 2, 2);
            clone.position.set(i * depth, 0, zOffset);
            // First row rotated 180 degrees to face inward
            if (rowIdx === 1) clone.rotation.y = Math.PI;
            scene.add(clone);
          }
        });
        console.log('✓ supermarket.glb cloned ' + (copiesX * rowsZ.length));
      } catch {
        console.warn('✗ supermarket.glb not found — skipping');
      }
    };

  // Load monster independently

    const loadMonster = async () => {
      const paths = [
        { loader: 'gltf', path: '/models/monster.glb' },
      ];

      for (const { loader, path } of paths) {
        try {
          monsterGroup = new THREE.Group();
          if (loader === 'gltf') {
            const gltf = await loadGLTF(path);
            gltf.scene.traverse((child: any) => {
              if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
            });
            monsterGroup.add(gltf.scene);
          } else {
            const object = await loadFBX(path);
            object.scale.setScalar(0.02);
            monsterGroup.add(object);
          }
          // Scatter 5 monster clones close together
          const positions = [
            [0, 0, 0],
            [2, 0, 0],
            [-2, 0, 0],
          ];
          positions.forEach(([x, y, z], idx) => {
            const clone = monsterGroup!.clone(true);
            clone.scale.set(2, 2, 2);
            clone.position.set(x, y, z);
            clone.rotation.y = Math.random() * Math.PI * 2;
            scene.add(clone);
          });

          // Keep reference to first one for animation
          monsterGroup.scale.set(2, 2, 2);
          monsterGroup.position.set(0, 0, 0);
          scene.add(monsterGroup);
          console.log('✓ Monster loaded and cloned x5:', path);
          return;
        } catch {
          console.warn('✗ Failed:', path);
          monsterGroup = null;
        }
      }

    };

    const createUI = () => {
      const title = document.createElement('div');
      title.id = '__ui_title';
      title.style.cssText = `
        position: fixed; top: 40px; left: 50%; transform: translateX(-50%);
        color: #00ffff; font-size: 48px; font-weight: bold;
        text-shadow: 0 0 20px #00ffff, 0 0 40px #ff00ff;
        font-family: 'Courier New', monospace; z-index: 100;
        pointer-events: none; letter-spacing: 3px; white-space: nowrap;
      `;
      title.textContent = 'CONSUMABLES';
      document.body.appendChild(title);

      const panel = document.createElement('div');
      panel.id = '__ui_panel';
      panel.style.cssText = `
        position: fixed; top: 120px; left: 32px; max-width: 300px;
        font-family: 'Courier New', monospace; color: rgba(0,255,238,0.8);
        z-index: 100; pointer-events: none;
        border-left: 2px solid rgba(0,255,238,0.35); padding-left: 16px;
      `;
      panel.innerHTML = `
        <div style="font-size:10px;letter-spacing:3px;opacity:0.5;margin-bottom:6px;text-transform:uppercase;">
          Motivation / Concept
        </div>
        <div style="font-size:14px;font-style:italic;color:#ff88cc;margin-bottom:10px;line-height:1.5;">
          Memories are Perishable.
        </div>
        <div style="font-size:12px;line-height:1.75;opacity:0.75;margin-bottom:20px;">
          <em>Consumables</em> transforms the "Memories of Dreams" into expiring products on a shelf.
          In this horror experience, we explore the liminal space of an infinite supermarket,
          where the past is a resource to be consumed—and you are being hunted by what remains.
        </div>
        <div style="font-size:10px;letter-spacing:3px;opacity:0.5;margin-bottom:6px;text-transform:uppercase;">
          Instructions
        </div>
        <div style="font-size:12px;line-height:1.75;opacity:0.75;">
          Navigate the Nightmare:<br>
          <span style="color:#00ffee;">Move:</span> Use WASD to walk the infinite aisle.
        </div>
      `;
      document.body.appendChild(panel);

      const videoContainer = document.createElement('div');
      videoContainer.id = '__ui_video';
      videoContainer.style.cssText = `
        position: fixed; bottom: 40px; right: 40px;
        width: 400px; height: 225px;
        background: rgba(0,0,0,0.9);
        border: 2px solid #00ffff; border-radius: 8px; overflow: hidden;
        box-shadow: 0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(255,0,255,0.3);
        z-index: 100;
      `;
      const video = document.createElement('video');
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      video.controls = true;
      video.src = '/videos/demo.mp4';
      videoContainer.appendChild(video);
      document.body.appendChild(videoContainer);
    };

    const onWindowResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      if (particlesMesh) {
        const pos = particlesMesh.geometry.getAttribute('position').array as Float32Array;
        const time = Date.now() * 0.0005;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i + 1] += Math.sin(time + i * 0.001) * 0.001;
          pos[i + 2] += Math.cos(time + i * 0.001) * 0.001;
        }
        particlesMesh.geometry.getAttribute('position').needsUpdate = true;
        particlesMesh.rotation.x += 0.0001;
        particlesMesh.rotation.y += 0.0002;
      }

      if (monsterGroup) {
        monsterGroup.rotation.y += 0.003;
        monsterGroup.rotation.x += 0.001;
      }

      composer.render();
    };

    init().catch(console.error);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationId);
      ['__ui_title', '__ui_panel', '__ui_video'].forEach(id => {
        document.getElementById(id)?.remove();
      });
      renderer?.dispose();
      composer?.dispose();
      controls?.dispose();
      containerRef.current?.removeChild(renderer?.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}
