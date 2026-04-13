'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleFieldVanilla() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let animationFrameId: number;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let particles: THREE.Points;
    let htmlRenderer: any;
    let htmlDiv: HTMLDivElement;
    let group: THREE.Group;

    const mouse = { x: 0, y: 0 };
    const particleCount = 5000;

    async function init() {
      // Import html-in-canvas modules
      const [{ installHtmlInCanvasPolyfill }, { ThreeHTMLRenderer }] = await Promise.all([
        import('three-html-render/polyfill'),
        import('three-html-render/renderer')
      ]);

      // Install polyfill
      installHtmlInCanvasPolyfill();

      // Create scene
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000000, 1, 15);

      // Create camera
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      // Create WebGL renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      // CRITICAL: Add layoutsubtree attribute BEFORE appending
      renderer.domElement.setAttribute('layoutsubtree', '');
      
      containerRef.current!.appendChild(renderer.domElement);

      // Create HTML renderer and connect AFTER canvas is in DOM
      htmlRenderer = new ThreeHTMLRenderer();
      htmlRenderer.connect(renderer.domElement, camera, renderer);
      
      console.log('HTML Renderer connected, canvas has layoutsubtree:', 
        renderer.domElement.hasAttribute('layoutsubtree'));

      // Create particles
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0x4488ff,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Create HTML element
      htmlDiv = document.createElement('div');
      htmlDiv.style.cssText = `
        width: 300px;
        padding: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #4488ff;
        border-radius: 10px;
        color: white;
        font-family: system-ui;
        position: absolute;
        left: -9999px;
      `;
      htmlDiv.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: #4488ff;">HTML in Canvas! 🎉</h2>
        <p style="margin: 0 0 10px 0;">This HTML is rendered directly on the canvas using the html-in-canvas polyfill.</p>
        <button id="htmlButton" style="
          background: #4488ff;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        ">Click Counter: 0</button>
        <input type="text" placeholder="Type something..." style="
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          border: 1px solid #4488ff;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          box-sizing: border-box;
        ">
      `;
      
      // Add to document body so it can be rendered
      document.body.appendChild(htmlDiv);

      // Add button click handler
      let clickCount = 0;
      const button = htmlDiv.querySelector('#htmlButton') as HTMLButtonElement;
      button.addEventListener('click', () => {
        clickCount++;
        button.textContent = `Click Counter: ${clickCount}`;
      });

      // Create group and add HTML plane
      group = new THREE.Group();
      
      // Create plane geometry for HTML
      const planeGeometry = new THREE.PlaneGeometry(3, 2);
      
      // Create a basic material - the polyfill will replace it with the HTML texture
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      
      // Attach HTML element to the mesh
      (plane as any).element = htmlDiv;
      
      group.add(plane);
      group.position.set(0, 0, 0);
      scene.add(group);
      
      console.log('Plane mesh created:');
      console.log('  - Has element property:', !!(plane as any).element);
      console.log('  - Element:', (plane as any).element);
      console.log('  - Material type:', planeMaterial.type);

      // Mouse move handler
      const handleMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      function animate() {
        animationFrameId = requestAnimationFrame(animate);

        // Animate particles
        const positions = particles.geometry.attributes.position.array as Float32Array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < particleCount * 3; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];

          // Wave motion
          positions[i + 1] += Math.sin(time + x) * 0.01;

          // Mouse interaction
          const dx = mouse.x * 5 - x;
          const dy = mouse.y * 5 - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 2) {
            positions[i] += dx * 0.01;
            positions[i + 1] += dy * 0.01;
          }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;

        // Rotate HTML group
        group.rotation.y += 0.005;

        // Update HTML renderer - pass the scene so it can find meshes with .element
        if (htmlRenderer) {
          try {
            htmlRenderer.update(scene);
          } catch (e: any) {
            // Log errors to see what's happening
            if (e.message && !e.message.includes('no snapshot')) {
              console.error('HTML renderer error:', e.message);
            }
          }
        }

        // Render scene
        renderer.render(scene, camera);
      }

      animate();

      // Store cleanup function
      cleanupRef.current = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        
        if (htmlRenderer) {
          htmlRenderer.disconnect();
        }
        
        if (htmlDiv && htmlDiv.parentNode) {
          htmlDiv.parentNode.removeChild(htmlDiv);
        }
        
        if (renderer) {
          renderer.dispose();
          containerRef.current?.removeChild(renderer.domElement);
        }
        
        if (particles) {
          particles.geometry.dispose();
          (particles.material as THREE.Material).dispose();
        }
        
        if (group) {
          scene.remove(group);
        }
      };
    }

    init().catch(console.error);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#000',
      }}
    />
  );
}
