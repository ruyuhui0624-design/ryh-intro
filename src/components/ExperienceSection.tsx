import FadeIn from './FadeIn'
import { timeline, type TimelineItem } from '../data/content'

const kindLabel: Record<TimelineItem['kind'], string> = {
  work: 'Full-time',
  intern: 'Internship',
  edu: 'Education',
}

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      className="relative flex w-full flex-col items-center overflow-x-clip px-5 pb-32 pt-24 sm:px-8 sm:pb-40 sm:pt-28 md:px-10 md:pb-44 md:pt-32"
    >
      <FadeIn delay={0} y={24} duration={1} className="w-full">
        <h2 className="hero-heading text-center">Experience</h2>
      </FadeIn>

      <div className="mx-auto mt-12 w-full max-w-[880px] sm:mt-14 md:mt-16">
        {timeline.map((item, index) => (
          <FadeIn
            key={`${item.org}-${item.period}`}
            delay={index * 0.06}
            y={18}
            duration={0.8}
            className="group"
          >
            <div className="grid grid-cols-1 gap-2 border-t border-[#D7E2EA]/10 py-6 sm:grid-cols-[200px_1fr] sm:gap-8 md:py-7">
              {/* 时间 */}
              <div className="flex items-center gap-3 sm:items-start sm:pt-1">
                <span
                  className="mt-[3px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#D7E2EA]/35 transition-colors duration-300 group-hover:bg-[#D7E2EA]"
                  aria-hidden="true"
                />
                <span className="text-[10px] font-light uppercase tracking-[0.18em] text-[#D7E2EA]/45 transition-colors duration-300 group-hover:text-[#D7E2EA]/70 sm:text-[11px]">
                  {item.period}
                </span>
              </div>

              {/* 单位 / 职位 / 说明 */}
              <div className="min-w-0 pl-8 sm:pl-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-[#D7E2EA] sm:text-lg md:text-xl">
                    {item.org}
                  </h3>
                  <span className="text-[9px] font-light uppercase tracking-[0.16em] text-[#D7E2EA]/35 sm:text-[10px]">
                    {kindLabel[item.kind]}
                  </span>
                </div>

                <p className="mt-2 text-[13px] font-light leading-snug text-[#D7E2EA]/85 sm:text-sm md:text-[15px]">
                  {item.role}
                </p>

                <p className="mt-2 max-w-[560px] text-[11px] font-light leading-relaxed text-[#D7E2EA]/45 sm:text-xs md:text-[13px]">
                  {item.note}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
