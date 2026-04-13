# HTML-in-Canvas Integration for Next.js + React Three Fiber

This project demonstrates how to integrate the `three-html-render` library with Next.js and React Three Fiber to render interactive HTML content directly on 3D surfaces in a WebGL canvas.

## Installation

The required packages are already installed:

```bash
pnpm add three-html-render three @react-three/fiber @react-three/drei @react-three/postprocessing
```

## Usage

### Basic Component Usage

The `HtmlInCanvas` component allows you to render HTML content on a 3D plane:

```tsx
import { HtmlInCanvas } from './HtmlInCanvas'

function Scene() {
  return (
    <>
      <HtmlInCanvas 
        htmlElementId="my-html-content" 
        position={[0, 0, 0]}
        width={4}
        height={3}
      />
    </>
  )
}

// In your JSX, include the HTML content outside the Canvas
<div id="my-html-content" style={{ width: '512px', height: '384px' }}>
  <h1>Hello World!</h1>
  <button>Click me</button>
</div>
```

### Props

- `htmlElementId` (required): The ID of the HTML element to render
- `position`: [x, y, z] position in 3D space (default: [0, 0, 0])
- `rotation`: [x, y, z] rotation in radians (default: [0, 0, 0])
- `scale`: [x, y, z] scale (default: [1, 1, 1])
- `width`: Width of the 3D plane (default: 2)
- `height`: Height of the 3D plane (default: 2)

### Using the Hook

For more control, use the `useHtmlInCanvas` hook:

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useHtmlInCanvas } from './HtmlInCanvas'
import * as THREE from 'three'

function MyComponent() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { update } = useHtmlInCanvas('my-content', meshRef.current)

  useFrame(() => {
    update()
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial />
    </mesh>
  )
}
```

## How It Works

1. **Polyfill Installation**: The library installs a polyfill that implements the WICG HTML-in-Canvas API
2. **Canvas Setup**: The R3F canvas element gets the `layoutsubtree` attribute
3. **HTML Rendering**: HTML elements are rasterized via SVG foreignObject → image → texture
4. **Texture Upload**: The texture is uploaded to WebGL each frame
5. **DOM Overlay**: A transparent overlay handles interaction (clicks, hovers, input)

## Example: Particle Field with HTML Panel

See `ParticleFieldWithHtml.tsx` for a complete example that combines:
- Animated particle field with mouse interaction
- Volumetric fog
- Post-processing effects (Bloom, Depth of Field, Vignette)
- Interactive HTML panel rendered on a 3D plane

## Important Notes

### Server-Side Rendering

The library is client-side only. The components use dynamic imports to avoid SSR issues:

```tsx
'use client'  // Always use this directive

// Dynamic imports handle SSR
if (typeof window !== 'undefined') {
  import('three-html-render/renderer')
  import('three-html-render/polyfill')
}
```

### HTML Element Placement

HTML elements must be rendered in the DOM (outside the Canvas) but can be positioned off-screen if you don't want them visible:

```tsx
<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
  <Canvas>
    {/* 3D scene */}
  </Canvas>
  
  {/* HTML content - can be styled with position: absolute; left: -9999px */}
  <div id="html-content" style={{ width: '512px', height: '384px' }}>
    {/* Content */}
  </div>
</div>
```

### Initial Frame Warnings

⚠️ **Expected Behavior**: You will see many `InvalidStateError: texElementImage2D: no snapshot recorded yet` warnings in the console during the first 5-10 frames. This is **completely normal** and expected!

**Why this happens:**
- The polyfill needs 1-2 animation frames to capture the first snapshot of the HTML element
- The ThreeHTMLRenderer starts calling `update()` immediately, before the snapshot is ready
- Once the snapshot is captured, these errors stop completely

**The component handles this by:**
1. Waiting 100ms after polyfill installation before connecting
2. Skipping updates for the first 10 frames
3. Catching and silently suppressing errors during initialization
4. Only logging errors after 60 frames (1 second at 60fps) if they persist

**What you'll see:**
- ~100-200 error messages in the first second
- Then they stop completely
- The HTML content renders perfectly on the 3D surface
- All interactions work flawlessly

This is a known limitation of the polyfill architecture and does not affect functionality.

## Features

✅ **Fully Interactive**: Buttons, inputs, and other HTML elements work normally  
✅ **CSS Styling**: Use regular CSS, including pseudo-classes (:hover, :focus)  
✅ **Animations**: CSS animations and transitions work  
✅ **Real DOM Events**: Click, hover, focus events propagate correctly  
✅ **Text Selection**: Text can be selected and copied  
✅ **Forms**: Input fields, textareas, selects all work  

## Limitations

❌ Textarea internal scroll not reflected in texture  
❌ contenteditable doesn't support caret rendering  
❌ :visited pseudo-class cannot be polyfilled  
❌ Some CSS features render differently in SVG foreignObject context  

## Performance Tips

1. **Minimize Updates**: Only call `update()` when the HTML content changes
2. **Optimize HTML**: Keep the DOM structure simple
3. **Use CSS Transform**: For animations, use CSS transforms instead of JS
4. **Batch Changes**: Update multiple properties at once to reduce redraws

## Browser Support

- ✅ Chrome, Edge (Polyfill)
- ✅ Safari, iOS Safari (Polyfill)
- ✅ Firefox (Polyfill)
- ✅ Android Chrome/WebView (Polyfill)
- ✅ Chrome Canary (Native + Polyfill)

## Resources

- [three-html-render GitHub](https://github.com/pmndrs/three-html-render)
- [WICG HTML-in-Canvas Proposal](https://github.com/WICG/canvas-place-element)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)

## Examples

### Rotating Dashboard

```tsx
function RotatingDashboard() {
  const meshRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
    }
  })

  return (
    <group ref={meshRef}>
      <HtmlInCanvas 
        htmlElementId="dashboard" 
        width={4}
        height={3}
      />
    </group>
  )
}
```

### Multiple HTML Panels

```tsx
function MultiPanel() {
  return (
    <>
      <HtmlInCanvas 
        htmlElementId="panel1" 
        position={[-3, 0, 0]}
      />
      <HtmlInCanvas 
        htmlElementId="panel2" 
        position={[3, 0, 0]}
      />
    </>
  )
}
```

### Interactive Form in 3D

```tsx
<div id="form-panel" style={{ width: '400px', height: '500px', padding: '20px' }}>
  <h2>Sign Up</h2>
  <form onSubmit={(e) => { e.preventDefault(); /* handle */ }}>
    <input type="text" placeholder="Name" />
    <input type="email" placeholder="Email" />
    <button type="submit">Submit</button>
  </form>
</div>
```

## Troubleshooting

### HTML not showing up?

1. Check that the HTML element ID matches
2. Ensure the element is rendered in the DOM
3. Verify the element has explicit width/height styles
4. Check browser console for errors

### Blurry text?

Increase the resolution by using larger pixel dimensions in the HTML element's style.

### Performance issues?

1. Reduce the size of the HTML element
2. Simplify the DOM structure
3. Avoid expensive CSS effects
4. Consider using `will-change: transform` for animated elements
