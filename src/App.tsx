import StarfieldBackground from './components/StarfieldBackground'
import InkCursor from './components/InkCursor'
import ClothWarp from './components/ClothWarp'
import HelloSection from './components/HelloSection'
import MarqueeSection from './components/MarqueeSection'
import AboutSection from './components/AboutSection'
import ExperienceSection from './components/ExperienceSection'
import ProjectsSection from './components/ProjectsSection'

export default function App() {
  return (
    <>
      {/* 底层：Three.js 星空（fixed，z-0） */}
      <StarfieldBackground />

      {/* 中层：整页 DOM 布料形变（z-10，SVG 位移贴图作用于真实 DOM） */}
      <ClothWarp>
        <main className="app-shell relative z-10 min-h-screen w-full font-kanit text-haze">
          <HelloSection />
          <MarqueeSection />
          <AboutSection />
          <ExperienceSection />
          <ProjectsSection />
        </main>
      </ClothWarp>

      {/* 顶层：点击/拖动墨迹（fixed，z-50，pointer-events:none） */}
      <InkCursor />
    </>
  )
}
