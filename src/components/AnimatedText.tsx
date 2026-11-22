import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

type AnimatedTextProps = {
  text: string
  className?: string
  /** 逐字动画的初始透明度 */
  from?: number
  /** 逐字动画的最终透明度 */
  to?: number
}

function Char({
  char,
  progress,
  range,
  from,
  to,
}: {
  char: string
  progress: MotionValue<number>
  range: [number, number]
  from: number
  to: number
}) {
  // 字符 opacity：0.2 → 1
  const opacity = useTransform(progress, range, [from, to])
  return (
    <motion.span style={{ opacity }} className="inline-block whitespace-pre">
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}

/**
 * 逐字符滚动驱动透明度动画。
 * scroll offset: ['start 0.8', 'end 0.2']
 */
export default function AnimatedText({
  text,
  className = '',
  from = 0.2,
  to = 1,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  })

  const chars = Array.from(text)

  return (
    <p ref={containerRef} className={`m-0 ${className}`} aria-label={text}>
      <span aria-hidden="true" style={{ wordBreak: 'break-word' }}>
        {chars.map((char, i) => (
          <Char
            key={`${char}-${i}`}
            char={char}
            progress={scrollYProgress}
            range={[i / chars.length, (i + 1) / chars.length]}
            from={from}
            to={to}
          />
        ))}
      </span>
    </p>
  )
}
