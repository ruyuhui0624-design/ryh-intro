import { useEffect, useRef } from 'react'

type InkBlob = {
  x: number
  y: number
  r0: number
  r1: number
  born: number
  life: number
  hue: number
  driftX: number
  driftY: number
  wobA: number
  wobF: number
  phase: number
  glow: number
  /** 椭圆压扁系数，让墨团不是正圆 */
  squash: number
  angle: number
}

/** 偏霓虹的色相池 */
const NEON_HUES = [190, 205, 265, 285, 315, 330, 155, 45]

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const pickHue = () => {
  const base = NEON_HUES[Math.floor(Math.random() * NEON_HUES.length)]
  return base + rand(-10, 10)
}

/**
 * 点击墨迹特效：
 * - 点击处炸开彩色液体，0.5s 扩散到约 200px 后停住，再 2s 淡出
 * - 按住拖动留下会自己扭动、慢慢消散的彩色轨迹
 * - 画布 pointer-events:none，不挡按钮和滚动；只画彩色像素，没有黑色底
 */
export default function InkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let vw = window.innerWidth
    let vh = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(vw * dpr)
      canvas.height = Math.floor(vh * dpr)
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const blobs: InkBlob[] = []
    let isDown = false
    let lastTrailAt = 0
    let currentHue = pickHue()

    const burst = (px: number, py: number, now: number) => {
      currentHue = pickHue()
      // 每次点击配一个邻近的撞色，让墨团更像彩色液体而不是单一光斑
      const accentHue = currentHue + (Math.random() > 0.5 ? 115 : -110)
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + rand(-0.18, 0.18)
        const dist = 8 + Math.pow(Math.random(), 0.7) * 54
        blobs.push({
          x: px + Math.cos(angle) * dist,
          y: py + Math.sin(angle) * dist,
          r0: rand(8, 16),
          r1: rand(52, 84),
          born: now + i * 6,
          life: rand(2.3, 2.8),
          hue: i % 5 === 0 ? accentHue + rand(-10, 10) : currentHue + rand(-18, 18),
          driftX: Math.cos(angle) * rand(14, 34),
          driftY: Math.sin(angle) * rand(14, 34),
          wobA: rand(3, 8),
          wobF: rand(1.2, 2.6),
          phase: Math.random() * Math.PI * 2,
          glow: rand(0.55, 1),
          squash: rand(0.38, 0.65),
          angle,
        })
      }
      // 外围溅射的小墨点，让轮廓更像液体散开
      for (let i = 0; i < 7; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = rand(58, 96)
        blobs.push({
          x: px + Math.cos(angle) * dist,
          y: py + Math.sin(angle) * dist,
          r0: rand(3, 7),
          r1: rand(10, 24),
          born: now + rand(20, 120),
          life: rand(2.0, 2.5),
          hue: accentHue + rand(-25, 25),
          driftX: Math.cos(angle) * rand(10, 30),
          driftY: Math.sin(angle) * rand(10, 30),
          wobA: rand(2, 6),
          wobF: rand(1.5, 3),
          phase: Math.random() * Math.PI * 2,
          glow: rand(0.5, 0.9),
          squash: rand(0.7, 1),
          angle: Math.random() * Math.PI,
        })
      }
      // 中心高光
      blobs.push({
        x: px,
        y: py,
        r0: 3,
        r1: 22,
        born: now,
        life: 0.9,
        hue: currentHue,
        driftX: 0,
        driftY: 0,
        wobA: 0,
        wobF: 0,
        phase: 0,
        glow: 0.8,
        squash: 1,
        angle: 0,
      })
    }

    const trail = (px: number, py: number, now: number) => {
      blobs.push({
        x: px + rand(-3, 3),
        y: py + rand(-3, 3),
        r0: 4,
        r1: rand(16, 34),
        born: now,
        life: rand(2.0, 2.6),
        hue: currentHue + rand(-26, 26),
        driftX: rand(-10, 10),
        driftY: rand(-12, 8),
        wobA: rand(8, 18),
        wobF: rand(2.4, 5.6),
        phase: Math.random() * Math.PI * 2,
        glow: rand(0.65, 1),
        squash: rand(0.72, 1),
        angle: Math.random() * Math.PI,
      })
    }

    const onPointerDown = (e: PointerEvent) => {
      isDown = true
      lastTrailAt = 0

      // 拖动时不要触发浏览器原生的文字选中（否则会盖出一块蓝色选区）
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      const isEditable =
        el?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (!isEditable) {
        document.body.style.userSelect = 'none'
        window.getSelection()?.removeAllRanges()
      }

      burst(e.clientX, e.clientY, performance.now())
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return
      const now = performance.now()
      if (now - lastTrailAt < 18) return
      lastTrailAt = now
      trail(e.clientX, e.clientY, now)
    }
    const onPointerUp = () => {
      isDown = false
      document.body.style.userSelect = ''
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, vw, vh)
      if (!blobs.length) return

      type Frame = {
        x: number
        y: number
        r: number
        alpha: number
        glow: number
        hue: number
        squash: number
        angle: number
      }
      const frames: Frame[] = []

      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i]
        const t = (now - b.born) / 1000
        if (t > b.life) {
          blobs.splice(i, 1)
          continue
        }
        // 还没到出生时间：等下一帧，不要剔除
        if (t < 0) continue

        // 0.5s 内 ease-out 扩散到目标尺寸，之后停住只淡出
        const grow = t < 0.5 ? 1 - Math.pow(1 - t / 0.5, 3) : 1
        const radius = b.r0 + (b.r1 - b.r0) * grow
        if (radius <= 0) continue

        // 0.5s 后开始淡出
        const fadeT = Math.max(0, (t - 0.5) / Math.max(0.4, b.life - 0.5))
        const alpha = Math.pow(Math.max(0, 1 - fadeT), 1.5)
        if (alpha <= 0.01) continue

        // 自己扭动 + 轻微漂移
        const x =
          b.x + b.driftX * t + Math.sin(t * b.wobF + b.phase) * b.wobA * (0.3 + t)
        const y =
          b.y + b.driftY * t + Math.cos(t * b.wobF * 0.8 + b.phase) * b.wobA * (0.3 + t)

        frames.push({
          x,
          y,
          r: radius,
          alpha,
          glow: b.glow,
          hue: b.hue,
          squash: b.squash,
          angle: b.angle,
        })
      }

      // 1) 液体本体：正常混合的彩色实体，保证颜色饱和、有墨迹的边缘
      ctx.globalCompositeOperation = 'source-over'
      for (const f of frames) {
        const h = f.hue
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.angle)
        ctx.scale(1, f.squash)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, f.r)
        g.addColorStop(0, `hsla(${h}, 100%, 70%, ${0.58 * f.alpha * f.glow})`)
        g.addColorStop(0.42, `hsla(${h}, 100%, 58%, ${0.46 * f.alpha * f.glow})`)
        g.addColorStop(0.75, `hsla(${h}, 100%, 52%, ${0.2 * f.alpha * f.glow})`)
        g.addColorStop(1, `hsla(${h}, 100%, 50%, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(0, 0, f.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 2) 发光边缘：叠加一层更大的柔光
      ctx.globalCompositeOperation = 'lighter'
      for (const f of frames) {
        const h = f.hue
        const r = f.r * 1.32
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.angle)
        ctx.scale(1, f.squash)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
        g.addColorStop(0, `hsla(${h}, 100%, 72%, ${0.17 * f.alpha * f.glow})`)
        g.addColorStop(0.55, `hsla(${h}, 100%, 64%, ${0.13 * f.alpha * f.glow})`)
        g.addColorStop(1, `hsla(${h}, 100%, 55%, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    let raf = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      draw(now)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })
    window.addEventListener('blur', onPointerUp)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('blur', onPointerUp)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  )
}
