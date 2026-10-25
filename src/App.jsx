import Analyzer from './components/Analyzer.jsx'
import Footer from './components/Footer.jsx'
import Frame from './components/Frame.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import RedFlags from './components/RedFlags.jsx'

export default function App() {
  return (
    <>
      <Frame />
      <main className="overflow-x-clip">
        <Hero />
        <Analyzer />
        <HowItWorks />
        <RedFlags />
      </main>
      <Footer />
    </>
  )
}
