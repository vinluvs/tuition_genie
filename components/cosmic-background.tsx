"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function CosmicBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const particlesRef = useRef<any>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.z = 100

    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext("2d")!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    const starTexture = new THREE.CanvasTexture(canvas)

    const particleCount = 3000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const initialPositions = new Float32Array(particleCount * 3)
    const twinkles = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      const x = (Math.random() - 0.5) * 300
      const y = (Math.random() - 0.5) * 300
      const z = (Math.random() - 0.5) * 300

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      initialPositions[i3] = x
      initialPositions[i3 + 1] = y
      initialPositions[i3 + 2] = z

      sizes[i] = Math.random() * 3 + 0.5

      twinkles[i] = Math.random() * Math.PI * 2

      const colorType = Math.random()
      if (colorType < 0.2) {
        // Bright white stars
        colors[i3] = 1.0
        colors[i3 + 1] = 1.0
        colors[i3 + 2] = 1.0
      } else if (colorType < 0.4) {
        // Blue stars
        colors[i3] = 0.3
        colors[i3 + 1] = 0.6
        colors[i3 + 2] = 1.0
      } else if (colorType < 0.6) {
        // Cyan stars
        colors[i3] = 0.2
        colors[i3 + 1] = 0.9
        colors[i3 + 2] = 1.0
      } else if (colorType < 0.8) {
        // Purple stars
        colors[i3] = 0.8
        colors[i3 + 1] = 0.3
        colors[i3 + 2] = 1.0
      } else {
        // Soft blue-white
        colors[i3] = 0.7
        colors[i3 + 1] = 0.85
        colors[i3 + 2] = 1.0
      }
    }

    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(positions, 3)
    positionAttribute.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute("position", positionAttribute)
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      map: starTexture,
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    sceneRef.current = scene
    particlesRef.current = {
      positions,
      initialPositions,
      particles,
      geometry,
      positionAttribute,
      sizes,
      twinkles,
      sizeAttribute: geometry.getAttribute("size") as THREE.BufferAttribute,
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / width) * 2 - 1
      mouseRef.current.y = -(e.clientY / height) * 2 + 1
    }

    window.addEventListener("mousemove", handleMouseMove)

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth
      const newHeight = containerRef.current?.clientHeight
      if (newWidth && newHeight) {
        camera.aspect = newWidth / newHeight
        camera.updateProjectionMatrix()
        renderer.setSize(newWidth, newHeight)
      }
    }

    window.addEventListener("resize", handleResize)

    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01

      const { positions, initialPositions, positionAttribute, sizes, twinkles, sizeAttribute } = particlesRef.current
      let positionUpdated = false
      let sizeUpdated = false

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        const wave = Math.sin(time + initialPositions[i3] * 0.01) * 0.5
        const wave2 = Math.cos(time * 0.5 + initialPositions[i3 + 1] * 0.01) * 0.5
        const wave3 = Math.sin(time * 0.3 + initialPositions[i3 + 2] * 0.005) * 0.5

        positions[i3] = initialPositions[i3] + wave * 20
        positions[i3 + 1] = initialPositions[i3 + 1] + wave2 * 20
        positions[i3 + 2] = initialPositions[i3 + 2] + wave3 * 15

        const limit = 150
        if (Math.abs(positions[i3]) > limit) positions[i3] = initialPositions[i3]
        if (Math.abs(positions[i3 + 1]) > limit) positions[i3 + 1] = initialPositions[i3 + 1]
        if (Math.abs(positions[i3 + 2]) > limit) positions[i3 + 2] = initialPositions[i3 + 2]

        positionUpdated = true

        const twinkleAmount = Math.sin(time * 2 + twinkles[i]) * 0.5 + 0.5
        sizes[i] = (Math.random() * 3 + 0.5) * (0.5 + twinkleAmount * 0.5)
        sizeUpdated = true
      }

      if (positionUpdated) {
        positionAttribute.addUpdateRange(0, particleCount * 3)
        positionAttribute.needsUpdate = true
      }

      if (sizeUpdated && sizeAttribute) {
        sizeAttribute.needsUpdate = true
      }

      const { particles } = particlesRef.current
      particles.rotation.x += mouseRef.current.y * 0.0005
      particles.rotation.y += mouseRef.current.x * 0.0005
      particles.rotation.z += 0.00005

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      starTexture.dispose()
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "radial-gradient(circle at center, #0a0e27 0%, #000000 100%)" }}
    />
  )
}
