'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ConsumablesLanding() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // ===== SCENE SETUP =====
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Camera position
    camera.position.set(0, 0, 10)

    // ===== LIGHTING =====
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xff0000, 1.5, 200)
    pointLight1.position.set(20, 15, 20)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff6600, 1, 200)
    pointLight2.position.set(-20, 15, -20)
    scene.add(pointLight2)

    scene.fog = new THREE.Fog(0x000000, 50, 300)

    // ===== ORBIT CONTROLS (NO AUTO ROTATE) =====
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = false
    controls.autoRotateSpeed = 0
    controls.minDistance = 8
    controls.maxDistance = 50

    // ===== TEXT CANVAS =====
    const createTextCanvas = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 2048
      canvas.height = 512
      const ctx = canvas.getContext('2d')!

      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw glowing text
      ctx.fillStyle = '#ff0000'
      ctx.shadowColor = '#ff6600'
      ctx.shadowBlur = 40
      ctx.font = 'bold 350px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('CONSUMABLES', canvas.width / 2, canvas.height / 2)

      return canvas
    }

    const textCanvas = createTextCanvas()
    const textTexture = new THREE.CanvasTexture(textCanvas)

    // ===== TEXT PLANE =====
    const textGeo = new THREE.PlaneGeometry(16, 4)
    const textMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      side: THREE.DoubleSide,
    })
    const textMesh = new THREE.Mesh(textGeo, textMat)
    textMesh.position.z = 0
    scene.add(textMesh)

    // ===== BACKGROUND BOX =====
    const bgGeo = new THREE.BoxGeometry(18, 5, 1)
    const bgMat = new THREE.MeshStandardMaterial({
      color: 0x330000,
      emissive: 0xff0000,
      emissiveIntensity: 0.2,
    })
    const bgBox = new THREE.Mesh(bgGeo, bgMat)
    bgBox.position.z = -0.5
    scene.add(bgBox)

    // ===== 3D MODEL =====
    let modelGroup = new THREE.Group()
    modelGroup.position.set(-8, -1, 0)
    scene.add(modelGroup)

    const loader = new GLTFLoader()
    loader.load('/models/Untitled.glb', (gltf) => {
      const model = gltf.scene
      model.scale.set(1.5, 1.5, 1.5)
      modelGroup.add(model)
    })

    // ===== VIDEO PLANE =====
    const video = document.createElement('video')
    video.src = '/videos/demo.mp4'
    video.loop = true
    video.muted = true
    video.autoplay = true
    video.crossOrigin = 'anonymous'

    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter

    const videoGeo = new THREE.PlaneGeometry(5, 3.75)
    const videoMat = new THREE.MeshBasicMaterial({ map: videoTexture })
    const videoMesh = new THREE.Mesh(videoGeo, videoMat)
    videoMesh.position.set(8, 0, 0)
    scene.add(videoMesh)

    // ===== PARTICLES =====
    const particleCount = 2000
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 60
      pPos[i + 1] = (Math.random() - 0.5) * 60
      pPos[i + 2] = (Math.random() - 0.5) * 60
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0xff3300,
      size: 0.1,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // Particle velocities
    const pVel = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      pVel[i] = (Math.random() - 0.5) * 0.04
      pVel[i + 1] = (Math.random() - 0.5) * 0.04
      pVel[i + 2] = (Math.random() - 0.5) * 0.04
    }

    // ===== ANIMATION LOOP =====
    const animate = () => {
      requestAnimationFrame(animate)

      // Update particles
      const pos = pGeo.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount * 3; i += 3) {
        pos[i] += pVel[i]
        pos[i + 1] += pVel[i + 1]
        pos[i + 2] += pVel[i + 2]

        if (Math.abs(pos[i]) > 30) pVel[i] *= -1
        if (Math.abs(pos[i + 1]) > 30) pVel[i + 1] *= -1
        if (Math.abs(pos[i + 2]) > 30) pVel[i + 2] *= -1
      }
      ;(pGeo.attributes.position as any).needsUpdate = true

      // Rotate elements
      modelGroup.rotation.y += 0.003
      videoMesh.rotation.y += 0.001

      // KEY: DISABLE AUTO ROTATE EVERY FRAME
      controls.autoRotate = false
      controls.update()

      renderer.render(scene, camera)
    }

    animate()

    // ===== RESIZE HANDLER =====
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // ===== CLEANUP =====
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      <div className="fixed bottom-8 left-8 text-gray-500 text-xs pointer-events-none">
        <p>🖱️ Drag to rotate</p>
        <p>🔄 Scroll to zoom</p>
      </div>
    </div>
  )
}
