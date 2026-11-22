/**
 * 页面用的占位素材清单。
 * 换图：把 public/images 下同名文件替换掉即可，或者改这里的文件名。
 */
const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`

/** 首屏人像（建议 3:4 竖图，深色背景） */
export const portraitImage = asset('portrait.jpg')

/** Marquee 第 1 行：1-11 张 */
export const marqueeRowOne: string[] = Array.from({ length: 11 }, (_, i) =>
  asset(`marquee-${String(i + 1).padStart(2, '0')}.jpg`),
)

/** Marquee 第 2 行：12-21 张 */
export const marqueeRowTwo: string[] = Array.from({ length: 10 }, (_, i) =>
  asset(`marquee-${String(i + 12).padStart(2, '0')}.jpg`),
)

export type Project = {
  id: string
  index: string
  name: string
  /** 左侧 40% 栏：两张上下堆叠的图 */
  col1: [string, string]
  /** 右侧 60% 栏：一张高图 */
  col2: string
}

export const projects: Project[] = [
  {
    id: 'p1',
    index: '01',
    name: 'Vision Training Lab',
    col1: [asset('project-01-a.jpg'), asset('project-01-b.jpg')],
    col2: asset('project-01-c.jpg'),
  },
  {
    id: 'p2',
    index: '02',
    name: 'Agent Workflow',
    col1: [asset('project-02-a.jpg'), asset('project-02-b.jpg')],
    col2: asset('project-02-c.jpg'),
  },
  {
    id: 'p3',
    index: '03',
    name: 'Portrait Retouch',
    col1: [asset('project-03-a.jpg'), asset('project-03-b.jpg')],
    col2: asset('project-03-c.jpg'),
  },
  {
    id: 'p4',
    index: '04',
    name: 'Weekly AI Notes',
    col1: [asset('project-04-a.jpg'), asset('project-04-b.jpg')],
    col2: asset('project-04-c.jpg'),
  },
]

/** 联系方式：换成你自己的邮箱即可 */
export const contactHref = 'mailto:hello@ryh.example.com'
