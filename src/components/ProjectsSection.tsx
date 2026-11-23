import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import FadeIn from './FadeIn'
import { projects, type Project } from '../data/content'

type StickyCardProps = {
  project: Project
  index: number
  total: number
  progress: MotionValue<number>
}

function StickyCard({ project, index, total, progress }: StickyCardProps) {
  // targetScale = 1 - (totalCards - 1 - index) * 0.03
  const targetScale = 1 - (total - 1 - index) * 0.03
  // 每张卡片从自己进入堆叠的位置开始缩小
  const scale = useTransform(progress, [index / total, 1], [1, targetScale])

  const style = {
    // 每张 top 额外偏移 index * 28px（.stack-card 里与 6rem / md:8rem 相加）
    '--stack-offset': `${index * 28}px`,
    scale,
    transformOrigin: 'top center',
    zIndex: index + 1,
  } as MotionStyle

  return (
    <motion.article
      style={style}
      className="stack-card sticky mb-[9vh] flex h-[74vh] min-h-[430px] w-full flex-col overflow-hidden rounded-[26px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 shadow-[0_-18px_60px_rgba(0,0,0,0.55)] sm:p-6 md:h-[85vh] md:rounded-[36px] md:p-8"
    >
      {/* 顶部行：大序号 + 项目名 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-3 sm:gap-5 md:gap-7">
          <span className="shrink-0 font-black leading-[0.72] tracking-[-0.04em] text-[#D7E2EA] text-[13vw] sm:text-[9vw] md:text-[6vw] lg:text-[5vw]">
            {project.index}
          </span>
          <h3 className="min-w-0 truncate text-base font-semibold uppercase leading-none tracking-tight text-[#D7E2EA] sm:text-xl md:text-2xl lg:text-3xl">
            {project.name}
          </h3>
        </div>

        <ArrowUpRight
          size={22}
          strokeWidth={2}
          className="mt-1 shrink-0 text-[#D7E2EA]/50 sm:size-6 md:size-7"
          aria-hidden="true"
        />
      </div>

      {/* 项目一行说明 */}
      <p className="mt-2 max-w-[92%] text-[10px] font-light uppercase leading-relaxed tracking-[0.14em] text-[#D7E2EA]/45 sm:mt-3 sm:text-[11px] md:text-xs">
        {project.subtitle}
      </p>

      {/* 图片区：左 40%（两张堆叠） / 右 60%（一张高图） */}
      <div className="mt-4 grid min-h-0 flex-1 grid-cols-[40%_60%] gap-3 sm:mt-5 md:mt-6 md:gap-4">
        <div className="order-1 flex min-h-0 flex-col gap-3 md:gap-4">
          <img
            src={project.col1[0]}
            alt={`${project.name} 项目配图 1`}
            loading="lazy"
            decoding="async"
            className="min-h-0 w-full flex-1 rounded-xl bg-[#141414] object-cover md:rounded-2xl"
          />
          <img
            src={project.col1[1]}
            alt={`${project.name} 项目配图 2`}
            loading="lazy"
            decoding="async"
            className="min-h-0 w-full flex-1 rounded-xl bg-[#141414] object-cover md:rounded-2xl"
          />
        </div>

        <div className="order-2 min-h-0">
          <img
            src={project.col2}
            alt={`${project.name} 项目主图`}
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-xl bg-[#141414] object-cover md:rounded-2xl"
          />
        </div>
      </div>
    </motion.article>
  )
}

export default function ProjectsSection() {
  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      id="projects"
      className="relative z-10 -mt-8 w-full rounded-t-[40px] pt-16 sm:-mt-14 sm:rounded-t-[56px] sm:pt-20 md:-mt-20 md:pt-24"
    >
      <FadeIn delay={0} y={24} duration={1} className="px-5 sm:px-8 md:px-10">
        <h2 className="hero-heading text-center">Project</h2>
      </FadeIn>

      {/* 粘性堆叠卡片容器：height 由卡片自然撑开（移动端 74vh + 9vh 间距，md 起 85vh + 9vh） */}
      <div
        ref={stackRef}
        className="relative mx-auto mt-10 w-full max-w-[1000px] px-4 sm:px-6 md:mt-16 md:px-8"
      >
        {projects.map((project, index) => (
          <StickyCard
            key={project.id}
            project={project}
            index={index}
            total={projects.length}
            progress={scrollYProgress}
          />
        ))}
      </div>

      <div className="h-10" />
    </section>
  )
}
