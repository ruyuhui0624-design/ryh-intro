import { useEffect, useRef, useState } from 'react'
import { marqueeRowOne, marqueeRowTwo } from '../data/content'

/** 三倍复制，实现无缝循环 */
const triple = (list: string[]) => [...list, ...list, ...list]

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const updateOffset = () => {
      const section = sectionRef.current
      if (!section) return

      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      // 滚动偏移：(scrollY - sectionTop + innerHeight) * 0.3
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3)
    }

    updateOffset()
    window.addEventListener('scroll', updateOffset, { passive: true })
    window.addEventListener('resize', updateOffset, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateOffset)
      window.removeEventListener('resize', updateOffset)
    }
  }, [])

  const rowOne = triple(marqueeRowOne)
  const rowTwo = triple(marqueeRowTwo)

  return (
    <section
      ref={sectionRef}
      aria-label="精选图片跑马灯"
      className="relative w-full overflow-x-clip py-14 sm:py-16 md:py-20"
    >
      <div className="flex flex-col gap-3">
        {/* 第一行：向右 */}
        <div className="marquee-row flex w-max gap-3" style={{ transform: `translateX(calc(-50% + ${offset - 200}px))` }}>
          {rowOne.map((src, i) => (
            <img
              key={`row1-${i}`}
              src={src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-[270px] w-[420px] shrink-0 rounded-2xl bg-[#141414] object-cover"
            />
          ))}
        </div>

        {/* 第二行：向左 */}
        <div className="marquee-row flex w-max gap-3" style={{ transform: `translateX(calc(-50% - ${offset - 200}px))` }}>
          {rowTwo.map((src, i) => (
            <img
              key={`row2-${i}`}
              src={src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-[270px] w-[420px] shrink-0 rounded-2xl bg-[#141414] object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
