# Agent Rules for Particle Field Repository

## Project Overview
This is a Next.js 16.2.1 application using React 19.2.4, Three.js 0.183.2, the `three-html-render` polyfill for rendering HTML content onto 3D surfaces using vanilla Three.js (not React Three Fiber), and pmndrs/postprocessing for bloom effects.

## Core Technologies & Constraints

### 1. Three.js Implementation
- **ALWAYS use vanilla Three.js**, NOT React Three Fiber (R3F)
- R3F was attempted but caused conflicts with the html-in-canvas polyfill
- Use `THREE.WebGLRenderer`, `THREE.Scene`, `THREE.PerspectiveCamera` directly
- All Three.js code lives in `app/ParticleFieldVanilla.tsx`

### 2. HTML-in-Canvas Polyfill (`three-html-render`)
- This is the WICG html-in-canvas polyfill implementation
- **CRITICAL**: Canvas element MUST have `layoutsubtree` attribute: `renderer.domElement.setAttribute('layoutsubtree', '')`
- **CRITICAL**: HTML elements MUST be appended inside the canvas element: `renderer.domElement.appendChild(htmlDiv)`
- **CRITICAL**: Set `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)` for correct texture orientation
- Import polyfill dynamically for SSR safety:
  ```typescript
  const { installHtmlInCanvasPolyfill } = await import('three-html-render/src/htmlInCanvasPolyfill');
  const { ThreeHTMLRenderer } = await import('three-html-render/src/threeHTMLRenderer');
  const { HtmlOverlayRenderer } = await import('three-html-render/src/htmlOverlayRenderer');
  ```
- Register HTML elements with meshes: `htmlRenderer.addObject(htmlDiv, mesh)`
- Update in animation loop: `htmlRenderer.update()` BEFORE `renderer.render(scene, camera)`

### 3. Plane-to-HTML Size Ratio
- **CRITICAL RATIO**: For a 400x400px HTML element, use a 2x2 Three.js plane
- This ratio was discovered through debugging and matches working examples
- Example: 512x512px HTML → 2x2 plane, 400x400px HTML → 2x2 plane
- Do NOT use larger planes (3x3, 5x5, etc.) - this causes texture clipping
- Set explicit bounding box on geometry:
  ```typescript
  planeGeometry.boundingBox = new THREE.Box3(
    new THREE.Vector3(-1, -1, 0),
    new THREE.Vector3(1, 1, 0)
  );
  ```

### 4. Next.js & React Patterns
- Use dynamic imports with `ssr: false` for Three.js components
- Components must check for `typeof window !== 'undefined'` before accessing browser APIs
- Cleanup in `useEffect` return function (dispose geometries, materials, remove event listeners)
- Package manager: `pnpm` (NOT npm or yarn)
- Dev server runs with Turbopack: `pnpm dev`

### 5. OrbitControls Integration
- Import from: `three/examples/jsm/controls/OrbitControls`
- Disable controls when hovering over interactive HTML elements:
  ```typescript
  htmlDiv.addEventListener('pointerenter', () => controls.enabled = false);
  htmlDiv.addEventListener('pointerleave', () => controls.enabled = true);
  ```
- Call `controls.update()` in animation loop BEFORE rendering
- Set reasonable limits: `minDistance: 2`, `maxDistance: 20`

### 6. Postprocessing Effects (pmndrs/postprocessing)
- Import from: `postprocessing`
- Use `EffectComposer` instead of direct `renderer.render()`
- Setup pattern:
  ```typescript
  import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
  
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new EffectPass(camera, new BloomEffect({ intensity: 2.0 })));
  
  // In animation loop
  composer.render();
  ```
- Update composer size on window resize: `composer.setSize(width, height)`
- Dispose composer in cleanup: `composer.dispose()`

## File Structure Rules

### Primary Files
- `app/ParticleFieldVanilla.tsx` - Main Three.js implementation with particles and HTML-in-canvas
- `app/page.tsx` - Entry point that imports ParticleFieldVanilla
- `app/globals.css` - Contains `overflow: hidden` on html/body to prevent scrollbars
- `package.json` - Dependencies managed with pnpm

### Do NOT Modify
- `next.config.ts` - Already configured for the project
- `tsconfig.json` - TypeScript config is correct
- `pnpm-lock.yaml` - Lock file managed by pnpm

## Common Pitfalls & Solutions

### Problem: Texture Clipping on Right/Bottom Edges
- **Solution**: Check plane-to-HTML size ratio. Use 2x2 plane for 400x400 HTML.

### Problem: Texture Upside Down
- **Solution**: Ensure `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)` is set
- Do NOT rotate plane or use CSS transforms to flip

### Problem: HTML Interactions Not Working
- **Solution**: Disable OrbitControls on pointerenter/pointerleave events
- Ensure HTML element is properly registered with `htmlRenderer.addObject()`

### Problem: SSR Errors with Three.js
- **Solution**: Use dynamic imports with `ssr: false`
- Check `typeof window !== 'undefined'` before browser API access

### Problem: Build Errors with BufferAttribute
- **Solution**: Use manual `geometry.setAttribute()` instead of JSX-style declarations
- Vanilla Three.js patterns, not React Three Fiber patterns

## Code Style Guidelines

### TypeScript
- Use explicit types for Three.js objects: `THREE.Scene`, `THREE.Mesh`, etc.
- Declare refs with proper types: `let renderer: THREE.WebGLRenderer | null = null`

### Three.js Patterns
- Create geometries and materials, then create meshes
- Always dispose of geometries and materials in cleanup
- Store refs to objects that need cleanup (renderer, controls, geometries, materials)

### HTML Styling
- Use inline styles with `style.cssText` for HTML elements inside canvas
- Keep dimensions explicit (width, height in pixels)
- Avoid borders and border-radius (they don't render properly in canvas)
- Use padding for spacing, not margin

## Animation Loop Pattern
```typescript
const animate = () => {
  animationId = requestAnimationFrame(animate);
  
  // 1. Update controls
  controls.update();
  
  // 2. Update particles or other animations
  // ... particle logic ...
  
  // 3. Update HTML renderer
  htmlRenderer.update();
  
  // 4. Render scene with postprocessing
  composer.render();
};
```

## Testing & Validation
- Always test changes with `pnpm dev` and verify hot reload works
- Check browser console for Three.js warnings or errors
- Verify HTML interactions (button clicks, text input) work correctly
- Test OrbitControls (zoom, pan, rotate) function properly
- Confirm particle field animates smoothly without performance issues

## When Making Changes
1. Read the relevant code sections first
2. Understand the vanilla Three.js pattern (not R3F)
3. Maintain the polyfill initialization order
4. Preserve the plane-to-HTML size ratio
5. Test interactive elements after changes
6. Verify cleanup code prevents memory leaks

## Dependencies
- Next.js: 16.2.1
- React: 19.2.4  
- Three.js: 0.183.2
- three-html-render: 0.1.2
- postprocessing: Latest (pmndrs/postprocessing)
- Package manager: pnpm v10.28.0

## Additional Notes
- The particle system uses 5000 particles with color gradients (cyan to magenta)
- Particles have vertex colors with dynamic color pulsing on mouse interaction
- Particle size: 0.015 (very small for subtle effect)
- Particles use additive blending for glow effect
- Camera starts at `z: 5` looking at origin
- Scene has enhanced fog: `new THREE.Fog(0x000000, 1, 10)` (denser than default)
- Bloom effect settings: intensity 2.0, luminanceThreshold 0.15, luminanceSmoothing 0.9
- Particles have spiral rotation and wave animations
- HTML element is 400x400px with 10px padding
- Background color: `rgba(0, 0, 0, 0.9)` (semi-transparent black)
