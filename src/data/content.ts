/**
 * 页面用的文案与素材清单。
 * 换图：把 public/images 下同名文件替换掉即可，或者改这里的文件名。
 */
const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`

/** 首屏人像（3:4 竖图，深色背景） */
export const portraitImage = asset('portrait.jpg')

/** Marquee 第 1 行：1-11 张 */
export const marqueeRowOne: string[] = Array.from({ length: 11 }, (_, i) =>
  asset(`marquee-${String(i + 1).padStart(2, '0')}.jpg`),
)

/** Marquee 第 2 行：12-21 张 */
export const marqueeRowTwo: string[] = Array.from({ length: 10 }, (_, i) =>
  asset(`marquee-${String(i + 12).padStart(2, '0')}.jpg`),
)

/** 首屏底部两行小字 */
export const heroTagline = ['Vision Model PM · Beijing', 'Baidu · Feed Content Quality']

/** About 正文（AnimatedText 逐字点亮） */
export const aboutText =
  '香港城市大学计算机硕士，现在在百度负责 Feed 内容质量的视觉多模态模型。日常是把「模型到底好不好」拆成可度量的评测标准，再把评测结论变成训练数据策略，陪算法把 Caption Model 一轮轮推到线上。相信好模型是评出来的，不是训出来的。'

export type Project = {
  id: string
  index: string
  name: string
  /** 项目名下面的一行说明 */
  subtitle: string
  /** 左侧 40% 栏：两张上下堆叠的图 */
  col1: [string, string]
  /** 右侧 60% 栏：一张高图 */
  col2: string
}

export const projects: Project[] = [
  {
    id: 'caption-model',
    index: '01',
    name: 'Caption Model',
    subtitle: 'Feed 内容质量 · 视觉多模态评测与数据策略',
    col1: [asset('project-01-a.jpg'), asset('project-01-b.jpg')],
    col2: asset('project-01-c.jpg'),
  },
  {
    id: 'ai-video-call',
    index: '02',
    name: 'AI Video Call',
    subtitle: '文心助手 · 视频通话视觉能力与 RAG 检索优化',
    col1: [asset('project-02-a.jpg'), asset('project-02-b.jpg')],
    col2: asset('project-02-c.jpg'),
  },
  {
    id: 'data-platform',
    index: '03',
    name: 'Data Platform',
    subtitle: '集团数据可视化与录入平台 · 从 0 到 1',
    col1: [asset('project-03-a.jpg'), asset('project-03-b.jpg')],
    col2: asset('project-03-c.jpg'),
  },
  {
    id: 'code-quality-ai',
    index: '04',
    name: 'Code Quality AI',
    subtitle: 'Coding AI · 代码质量评估平台与缺陷预测',
    col1: [asset('project-04-a.jpg'), asset('project-04-b.jpg')],
    col2: asset('project-04-c.jpg'),
  },
]

export type TimelineItem = {
  period: string
  org: string
  role: string
  /** WORK / INTERN / EDU */
  kind: 'work' | 'intern' | 'edu'
  /** 一行补充说明 */
  note: string
}

/** 经历时间线：工作 → 实习 → 教育 */
export const timeline: TimelineItem[] = [
  {
    period: '2026.01 — NOW',
    org: 'Baidu 百度',
    role: '视觉模型策略产品经理',
    kind: 'work',
    note: 'Feed 内容质量多模态 · 评测体系、训练数据策略、SFT/RL 迭代',
  },
  {
    period: '2023.07 — 2024.04',
    org: 'Ping An 中国平安',
    role: '数据产品经理',
    kind: 'work',
    note: '集团数据可视化与录入平台，分级权限、数据安全与自动化录入体系',
  },
  {
    period: '2025.05 — 2025.08',
    org: 'NetEase 网易互娱',
    role: 'Coding AI 产品策划（实习）',
    kind: 'intern',
    note: '代码质量评估平台从 0 到 1，缺陷预测模型与标准化评估规则',
  },
  {
    period: '2025.02 — 2025.05',
    org: 'Kingsoft 金山',
    role: 'AI 应用产品经理（实习）',
    kind: 'intern',
    note: 'KG-RAG 游戏运维知识图谱，告警根因定位与智能问答',
  },
  {
    period: '2024.09 — 2025.10',
    org: 'CityU 香港城市大学',
    role: '计算机科学与技术 · 硕士',
    kind: 'edu',
    note: 'Computer Science, Master',
  },
  {
    period: '2018.09 — 2022.06',
    org: 'BJTU 北京交通大学',
    role: '计算机科学与技术 · 本科',
    kind: 'edu',
    note: 'Computer Science, Bachelor',
  },
]

/** 联系方式 */
export const contactEmail = 'ruyuhui0624@163.com'
export const contactHref = `mailto:${contactEmail}`
