import FadeIn from './FadeIn'
import AnimatedText from './AnimatedText'
import ContactButton from './ContactButton'
import { contactHref } from '../data/content'

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-clip px-5 py-24 sm:px-8 sm:py-28 md:px-10 md:py-32"
    >
      {/* 标题：hero-heading（clamp 流体字号） */}
      <FadeIn delay={0} y={24} duration={1} className="w-full">
        <h2 className="hero-heading text-center">About me</h2>
      </FadeIn>

      {/* 正文 + 联系按钮，区块间距统一由 gap 控制 */}
      <div className="mt-10 flex w-full flex-col items-center gap-8 sm:mt-12 sm:gap-10 md:mt-16 md:gap-12">
        <AnimatedText
          text="自我介绍，之后再替换"
          className="mx-auto max-w-[560px] text-center text-[15px] font-light leading-[1.95] tracking-wide text-[#D7E2EA] sm:text-base md:text-lg lg:text-xl"
        />

        <div id="contact" className="scroll-mt-24">
          <FadeIn delay={0.1} y={16} duration={0.9}>
            <ContactButton href={contactHref} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
