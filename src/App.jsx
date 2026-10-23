import Analyzer from './components/Analyzer.jsx'
import Footer from './components/Footer.jsx'
import Frame from './components/Frame.jsx'
import Cursor from './components/fx/Cursor.jsx'
import Loader from './components/fx/Loader.jsx'
import Marquee from './components/fx/Marquee.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import RedFlags from './components/RedFlags.jsx'

export default function App() {
  return (
    <>
      <Loader />
      
      
      <Frame />
      <main className="overflow-x-clip">
        <Hero />
        <Analyzer />
        <HowItWorks />
        <div className="py-10">
          <Marquee />
        </div>
        <RedFlags />
      </main>
      <Footer />
    </>
  )
}
