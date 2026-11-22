import { useEffect, useRef, type ReactNode } from 'react'

type GridNode = {
  /** 静止位置（视口坐标） */
  ox: number
  oy: number
  /** 当前位置 */
  x: number
  y: number
  vx: number
  vy: number
}

const COLS = 14
const ROWS = 10
const MAP_W = 72
const MAP_H = 48
/** 单点最大形变（px），同时决定 filter scale */
const MAX_DISP = 58

/**
 * 鼠标按压布料效果。
 *
 * 做法：在视口上铺一张 14×10 的物理网格，每个节点是带阻尼的弹簧；鼠标周围
 * 施加随距离衰减的斥力，节点位移通过两次邻域扩散形成波纹，最后把位移场编码成
 * 一张小的位移贴图，交给 SVG feDisplacementMap 作用于整个页面 DOM。
 *
 * 这样文字、按钮、图片都是真实的 DOM（可点击、可选中），不是 canvas 渲染出来的
 * 截图；同时能拿到矩阵/位移级的局部扭曲。桌面端才启用，移动端/减弱动效偏好直接跳过。
 */
export default function ClothWarp({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<SVGFilterElement>(null)
  const mapRef = useRef<SVGFEImageElement>(null)

  useEffect(() => {
    const content = contentRef.current
    const filter = filterRef.current
    const mapImage = mapRef.current
    if (!content || !filter || !mapImage) return

    // 只做桌面端
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const RADIUS = 250
    const STIFFNESS = 0.11
    const DAMPING = 0.9
    const IMPULSE = 5.2 // 稳态位移 ≈ IMPULSE / STIFFNESS

    let nodes: GridNode[] = []
    let vw = document.documentElement.clientWidth
    let vh = window.innerHeight

    const mouse = { x: vw / 2, y: vh / 2, active: false }

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v))

    const build = () => {
      vw = document.documentElement.clientWidth
      vh = window.innerHeight
      nodes = []
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const ox = (c / (COLS - 1)) * vw
          const oy = (r / (ROWS - 1)) * vh
          nodes.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 })
        }
      }
    }

    // 位移贴图画布（很小，重建成本低）
    const mapCanvas = document.createElement('canvas')
    mapCanvas.width = MAP_W
    mapCanvas.height = MAP_H
    const mapCtx = mapCanvas.getContext('2d')
    if (!mapCtx) return
    const imageData = mapCtx.createImageData(MAP_W, MAP_H)

    const sample = (field: number[], px: number, py: number) => {
      const gx = clamp((px / vw) * (COLS - 1), 0, COLS - 1)
      const gy = clamp((py / vh) * (ROWS - 1), 0, ROWS - 1)
      const c0 = Math.min(Math.floor(gx), COLS - 2)
      const r0 = Math.min(Math.floor(gy), ROWS - 2)
      const tx = gx - c0
      const ty = gy - r0
      const i00 = r0 * COLS + c0
      const i10 = i00 + 1
      const i01 = i00 + COLS
      const i11 = i01 + 1
      const top = field[i00] * (1 - tx) + field[i10] * tx
      const bottom = field[i01] * (1 - tx) + field[i11] * tx
      return top * (1 - ty) + bottom * ty
    }

    const drawMap = () => {
      const dispX: number[] = new Array(nodes.length)
      const dispY: number[] = new Array(nodes.length)
      for (let i = 0; i < nodes.length; i++) {
        dispX[i] = nodes[i].x - nodes[i].ox
        dispY[i] = nodes[i].y - nodes[i].oy
      }

      const data = imageData.data
      let k = 0
      for (let y = 0; y < MAP_H; y++) {
        const py = ((y + 0.5) / MAP_H) * vh
        for (let x = 0; x < MAP_W; x++) {
          const px = ((x + 0.5) / MAP_W) * vw
          const dx = sample(dispX, px, py) / (2 * MAX_DISP)
          const dy = sample(dispY, px, py) / (2 * MAX_DISP)
          data[k] = clamp(128 + dx * 255, 0, 255)
          data[k + 1] = clamp(128 + dy * 255, 0, 255)
          data[k + 2] = 128
          data[k + 3] = 255
          k += 4
        }
      }
      mapCtx.putImageData(imageData, 0, 0)
      mapImage.setAttribute('href', mapCanvas.toDataURL('image/png'))
    }

    const syncRegion = () => {
      const sy = window.scrollY
      filter.setAttribute('x', '0')
      filter.setAttribute('y', String(sy))
      filter.setAttribute('width', String(vw))
      filter.setAttribute('height', String(vh))
      mapImage.setAttribute('x', '0')
      mapImage.setAttribute('y', String(sy))
      mapImage.setAttribute('width', String(vw))
      mapImage.setAttribute('height', String(vh))
    }

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    build()
    syncRegion()

    let raf = 0
    let last = performance.now()
    let frame = 0
    let filterOn = false

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(32, now - last)
      last = now
      const step = dt / 16.667
      frame++

      let maxDisp = 0

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        let fx = (n.ox - n.x) * STIFFNESS
        let fy = (n.oy - n.y) * STIFFNESS

        if (mouse.active) {
          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < RADIUS && dist > 0.001) {
            const falloff = 1 - dist / RADIUS
            const push = falloff * falloff * IMPULSE
            fx += (dx / dist) * push
            fy += (dy / dist) * push
          }
        }

        n.vx = (n.vx + fx) * DAMPING
        n.vy = (n.vy + fy) * DAMPING
        n.x += n.vx * step
        n.y += n.vy * step
      }

      // 两次邻域扩散：让形变像布料一样向外传导出波纹
      const sx: number[] = new Array(nodes.length)
      const syArr: number[] = new Array(nodes.length)
      for (let i = 0; i < nodes.length; i++) {
        sx[i] = nodes[i].x - nodes[i].ox
        syArr[i] = nodes[i].y - nodes[i].oy
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const i = r * COLS + c
            let ax = 0
            let ay = 0
            let count = 0
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (!dr && !dc) continue
                const rr = r + dr
                const cc = c + dc
                if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue
                const j = rr * COLS + cc
                ax += sx[j]
                ay += syArr[j]
                count++
              }
            }
            if (count) {
              const w = 0.16
              const nx = sx[i] * (1 - w) + (ax / count) * w
              const ny = syArr[i] * (1 - w) + (ay / count) * w
              sx[i] = nx
              syArr[i] = ny
              nodes[i].x = nodes[i].ox + nx
              nodes[i].y = nodes[i].oy + ny
            }
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        maxDisp = Math.max(
          maxDisp,
          Math.abs(nodes[i].x - nodes[i].ox),
          Math.abs(nodes[i].y - nodes[i].oy),
        )
      }

      if (maxDisp > 0.45) {
        if (!filterOn) {
          content.style.filter = 'url(#cloth-filter)'
          filterOn = true
        }
        if (frame % 2 === 0) {
          syncRegion()
          drawMap()
        }
      } else if (filterOn) {
        content.style.filter = ''
        filterOn = false
      }
    }

    const onResize = () => {
      build()
      mouse.x = vw / 2
      mouse.y = vh / 2
      syncRegion()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    window.addEventListener('resize', onResize)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('resize', onResize)
      content.style.filter = ''
    }
  }, [])

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden"
      >
        <filter
          ref={filterRef}
          id="cloth-filter"
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage ref={mapRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={MAX_DISP * 2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div ref={contentRef} className="relative z-10">
        {children}
      </div>
    </>
  )
}
