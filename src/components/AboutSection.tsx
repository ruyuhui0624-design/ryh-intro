import FadeIn from './FadeIn'
import AnimatedText from './AnimatedText'
import ContactButton from './ContactButton'
import { aboutText, contactEmail, contactHref } from '../data/content'

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
          text={aboutText}
          className="mx-auto max-w-[560px] text-center text-[15px] font-light leading-[1.95] tracking-wide text-[#D7E2EA] sm:text-base md:text-lg lg:text-xl"
        />

        <div id="contact" className="flex flex-col items-center gap-5 scroll-mt-24">
          <FadeIn delay={0.1} y={16} duration={0.9}>
            <ContactButton href={contactHref} />
          </FadeIn>

          <FadeIn delay={0.2} y={12} duration={0.9}>
            <p className="text-[10px] font-light uppercase tracking-[0.24em] text-[#D7E2EA]/45 sm:text-[11px]">
              {contactEmail}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
