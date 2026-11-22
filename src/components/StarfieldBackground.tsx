import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Three.js r128 星云星空背景。
 * - 1200×1200×1200 立方体内随机分布 6000 个蓝色点粒子
 * - 相机 z = 220
 * - 每帧整团云绕 Y += 0.0012 / X += 0.0004
 */
export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x0c0c0c, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      1,
      4000,
    )
    camera.position.z = 220

    // 粒子几何体：1200³ 立方体（-600 ~ 600）
    const COUNT = 6000
    const SIZE = 1200
    const positions = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SIZE
      positions[i * 3 + 1] = (Math.random() - 0.5) * SIZE
      positions[i * 3 + 2] = (Math.random() - 0.5) * SIZE
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // 圆形柔光 sprite：默认 Points 是方块，用一张径向渐变贴图做成星点
    const spriteCanvas = document.createElement('canvas')
    spriteCanvas.width = 64
    spriteCanvas.height = 64
    const spriteCtx = spriteCanvas.getContext('2d')
    if (spriteCtx) {
      const grad = spriteCtx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grad.addColorStop(0, 'rgba(255,255,255,1)')
      grad.addColorStop(0.22, 'rgba(255,255,255,0.9)')
      grad.addColorStop(0.55, 'rgba(255,255,255,0.22)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      spriteCtx.fillStyle = grad
      spriteCtx.fillRect(0, 0, 64, 64)
    }
    const sprite = new THREE.CanvasTexture(spriteCanvas)

    const material = new THREE.PointsMaterial({
      color: 0x8fc2ff,
      map: sprite,
      size: 1.4,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const cloud = new THREE.Points(geometry, material)
    scene.add(cloud)

    let rafId = 0
    const render = () => {
      rafId = requestAnimationFrame(render)
      if (!reduceMotion) {
        cloud.rotation.y += 0.0012
        cloud.rotation.x += 0.0004
      }
      renderer.render(scene, camera)
    }

    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h, false)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    render()

    // 切到后台时暂停，回来继续，省电
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId)
      } else {
        cancelAnimationFrame(rafId)
        render()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      geometry.dispose()
      material.dispose()
      sprite.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {/* 顶部/底部轻微压暗，保证文字对比度 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,12,12,0)_35%,rgba(12,12,12,0.55)_100%)]" />
    </div>
  )
}
