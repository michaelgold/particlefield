'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';

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
    let controls: OrbitControls;
    let composer: EffectComposer;

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
      scene.fog = new THREE.Fog(0x000000, 1, 10);

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
      
      // Set FLIP_Y for HTML textures
      const gl = renderer.getContext() as WebGLRenderingContext;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      
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

      // Add colors for each particle (gradient from cyan to magenta)
      const colors = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        const t = Math.random();
        colors[i] = 0.2 + t * 0.8;     // R: cyan to magenta
        colors[i + 1] = 0.4 + t * 0.4; // G: moderate green
        colors[i + 2] = 1.0;            // B: full blue
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.015,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        sizeAttenuation: true,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Create HTML element - match the examples (no box-sizing!)
      htmlDiv = document.createElement('div');
      htmlDiv.style.cssText = `
        width: 400px;
        height: 400px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        font-family: system-ui;
        overflow: visible;
      `;
      htmlDiv.innerHTML = `
        <h2 style="margin: 0 0 8px 0; color: #4488ff; font-size: 16px;">HTML in Canvas! 🎉</h2>
        <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.3;">This HTML is rendered on canvas.</p>
        <button id="htmlButton" style="
          background: #4488ff;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
          display: block;
          width: 100%;
          margin-bottom: 8px;
        ">Click Counter: 0</button>
        <input type="text" placeholder="Type something..." style="
          width: 100%;
          padding: 8px;
          border: 1px solid #4488ff;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 13px;
          box-sizing: border-box;
        ">
      `;
      
      // CRITICAL: Add HTML element INSIDE the canvas, not to body
      renderer.domElement.appendChild(htmlDiv);
      
      // Set explicit dimensions in JavaScript (like the official example does)
      htmlDiv.style.width = '400px';
      htmlDiv.style.height = '400px';

      // Add button click handler
      let clickCount = 0;
      const button = htmlDiv.querySelector('#htmlButton') as HTMLButtonElement;
      button.addEventListener('click', () => {
        clickCount++;
        button.textContent = `Click Counter: ${clickCount}`;
      });

      // Create group and add HTML plane
      group = new THREE.Group();
      
      // Create plane geometry - match the example ratio
      // HTML element is 400x400, use a 2x2 plane like the example
      const planeGeometry = new THREE.PlaneGeometry(2, 2);
      
      // Explicitly set bounding box to match plane size
      planeGeometry.boundingBox = new THREE.Box3(
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(1, 1, 0)
      );
      
      // Create a basic material - the polyfill will replace it with the HTML texture
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      
      group.add(plane);
      group.position.set(0, 0, 0); // Centered at origin
      scene.add(group);
      
      console.log('Group position:', group.position);
      console.log('Plane position:', plane.position);
      console.log('Camera position:', camera.position);
      
      // CRITICAL: Register the HTML element with the mesh using ThreeHTMLRenderer
      htmlRenderer.addObject(htmlDiv, plane);
      
      console.log('Plane mesh created:');
      console.log('  - HTML element registered with renderer');
      console.log('  - Element dimensions:', htmlDiv.offsetWidth, 'x', htmlDiv.offsetHeight);
      console.log('  - Plane geometry size:', planeGeometry.parameters.width, 'x', planeGeometry.parameters.height);
      console.log('  - Canvas size:', renderer.domElement.width, 'x', renderer.domElement.height);
      console.log('  - Canvas client size:', renderer.domElement.clientWidth, 'x', renderer.domElement.clientHeight);
      console.log('  - Window size:', window.innerWidth, 'x', window.innerHeight);
      console.log('  - Pixel ratio:', window.devicePixelRatio);
      console.log('  - Material type:', planeMaterial.type);



      // Add OrbitControls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 20;
      
      // Setup postprocessing with enhanced bloom
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      
      const bloomEffect = new BloomEffect({
        intensity: 2.0,
        luminanceThreshold: 0.15,
        luminanceSmoothing: 0.9,
      });
      composer.addPass(new EffectPass(camera, bloomEffect));
      
      // Disable controls when interacting with HTML elements
      htmlDiv.addEventListener('pointerenter', () => {
        controls.enabled = false;
      });
      htmlDiv.addEventListener('pointerleave', () => {
        controls.enabled = true;
      });

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
        composer.setSize(window.innerWidth, window.innerHeight);
        
        // Update HTML overlay renderer on resize
        if (htmlRenderer && htmlRenderer.overlayRenderer) {
          htmlRenderer.overlayRenderer.update();
        }
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      function animate() {
        animationFrameId = requestAnimationFrame(animate);

        // Animate particles
        const positions = particles.geometry.attributes.position.array as Float32Array;
        const colors = particles.geometry.attributes.color.array as Float32Array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < particleCount * 3; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];

          // Wave motion with rotation
          positions[i + 1] += Math.sin(time + x) * 0.01;
          positions[i + 2] += Math.cos(time + y) * 0.01;

          // Spiral motion
          const angle = time * 0.5;
          const radius = Math.sqrt(x * x + z * z);
          if (radius > 0.1) {
            const newAngle = Math.atan2(z, x) + 0.001;
            positions[i] = Math.cos(newAngle) * radius;
            positions[i + 2] = Math.sin(newAngle) * radius;
          }

          // Mouse interaction with stronger effect
          const dx = mouse.x * 5 - x;
          const dy = mouse.y * 5 - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 2.5) {
            const force = (2.5 - distance) / 2.5;
            positions[i] += dx * 0.02 * force;
            positions[i + 1] += dy * 0.02 * force;
            
            // Color pulse on interaction
            colors[i] = Math.min(1.0, colors[i] + 0.1 * force);
            colors[i + 1] = Math.min(1.0, colors[i + 1] + 0.1 * force);
          } else {
            // Fade back to original colors
            const t = (i / 3) / particleCount;
            colors[i] = colors[i] * 0.95 + (0.2 + t * 0.8) * 0.05;
            colors[i + 1] = colors[i + 1] * 0.95 + (0.4 + t * 0.4) * 0.05;
          }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
        
        // Rotate particle system slowly
        particles.rotation.y += 0.0005;
        
        // Update controls
        controls.update();

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

        // Render scene with postprocessing
        composer.render();
      }

      animate();

      // Store cleanup function
      cleanupRef.current = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        
        if (controls) {
          controls.dispose();
        }
        
        if (composer) {
          composer.dispose();
        }
        
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
