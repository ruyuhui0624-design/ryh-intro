import type { CSSProperties, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

type ContactButtonProps = {
  /** 目标链接，默认邮件 */
  href?: string
  /** 按钮文案，默认「联系我」 */
  label?: string
  className?: string
  /** 是否显示右上箭头图标 */
  withIcon?: boolean
  /** 用 button 语义时传 onClick */
  onClick?: () => void
}

/** 药丸按钮：多色渐变 + 内阴影 + 白色 2px 外描边（偏移 -3px） */
const pillStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
  boxShadow:
    'inset 0 2px 16px rgba(255, 255, 255, 0.30), inset 0 -14px 28px rgba(0, 0, 0, 0.55)',
  outline: '2px solid #FFFFFF',
  outlineOffset: '-3px',
}

export default function ContactButton({
  href,
  label = '联系我',
  className = '',
  withIcon = true,
  onClick,
}: ContactButtonProps) {
  const inner: ReactNode = (
    <span className="flex items-center gap-2">
      {/* 文字白色、大写 */}
      <span className="uppercase tracking-[0.06em] text-white">{label}</span>
      {withIcon && (
        <ArrowUpRight
          size={18}
          strokeWidth={2.4}
          className="text-white transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
          aria-hidden="true"
        />
      )}
    </span>
  )

  const cls = [
    'group relative inline-flex shrink-0 items-center justify-center rounded-full',
    'px-6 py-3 text-[12px] leading-none',
    'sm:px-8 sm:py-[14px] sm:text-[13px]',
    'md:px-10 md:py-4 md:text-[15px]',
    'lg:px-12 lg:py-[18px] lg:text-base',
    'font-semibold transition-transform duration-300 ease-out will-change-transform',
    'hover:scale-[1.03] active:scale-[0.99]',
    className,
  ].join(' ')

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} style={pillStyle}>
        {inner}
      </button>
    )
  }

  return (
    <a href={href} className={cls} style={pillStyle}>
      {inner}
    </a>
  )
}
