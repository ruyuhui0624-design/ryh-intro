import FadeIn from './FadeIn'
import ContactButton from './ContactButton'
import { contactHref, heroTagline } from '../data/content'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function HelloSection() {
  return (
    <section
      id="hello"
      className="relative flex h-screen w-full flex-col overflow-x-clip px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-7 md:px-10 md:pb-10 md:pt-9"
    >
      {/* 导航栏：About / Projects / Contact */}
      <FadeIn delay={0} duration={0.8} className="relative z-30">
        <nav className="flex items-center justify-between" aria-label="主导航">
          <a
            href="#hello"
            className="text-[10px] font-light uppercase tracking-[0.34em] text-[#D7E2EA]/50 transition-opacity duration-200 hover:opacity-70 sm:text-[11px]"
          >
            RYH
          </a>

          <ul className="flex items-center gap-5 sm:gap-8 md:gap-12">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[10px] font-medium uppercase leading-none tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 sm:text-[11px] md:text-xs lg:text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </FadeIn>

      {/* 主标题 */}
      <div className="relative flex min-h-0 flex-1 items-center">
        <FadeIn delay={0.15} y={40} duration={1.1} className="w-full">
          <div className="w-full overflow-hidden">
            <h1 className="hello-heading whitespace-nowrap font-black uppercase leading-[0.8] tracking-[-0.045em] text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]">
              RYH
              {/* 中文字形宽度约为拉丁字母的 1.6 倍，压到 0.82em 才能与 RYH 视觉等重且不裁字 */}
              <span className="text-[0.82em] tracking-[-0.02em]">个人简介</span>
            </h1>
          </div>
        </FadeIn>
      </div>

      {/* 底部：左侧小字 / 右侧联系按钮 */}
      <div className="relative z-30 mt-4 flex items-end justify-between gap-4 sm:mt-6 sm:gap-6">
        <FadeIn delay={0.35} y={20} duration={0.9} className="min-w-0">
          <p className="max-w-[52vw] text-[9px] font-light uppercase leading-[1.7] tracking-[0.2em] text-[#D7E2EA] sm:max-w-none sm:text-[10px] sm:tracking-[0.28em] md:text-xs">
            {heroTagline[0]}
            <br />
            {heroTagline[1]}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20} duration={0.9} className="shrink-0">
          <ContactButton href={contactHref} />
        </FadeIn>
      </div>
    </section>
  )
}
