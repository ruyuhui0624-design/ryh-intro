import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type FadeInProps = {
  children: ReactNode
  className?: string
  /** 延迟（秒） */
  delay?: number
  /** 时长（秒） */
  duration?: number
  /** 入场水平位移 */
  x?: number
  /** 入场垂直位移 */
  y?: number
}

/**
 * 进入视口淡入组件。
 * whileInView + once:true + margin:"50px"，缓动 [0.25, 0.1, 0.25, 1]
 */
export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.9,
  x = 0,
  y = 0,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px' }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
