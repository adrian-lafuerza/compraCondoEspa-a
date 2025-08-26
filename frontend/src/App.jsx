import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { HeroSection } from './components/HeroSection/HeroSection'
import { PropertiesSection } from './components/PropertiesSection/PropertiesSection'
import OportunitiesSection from './components/OportunitiesSection/OportunitiesSection'
import ConnectSection from './components/ConnectSection/ConnectSection'
import ContactSection from './components/ContactSection/ContactSection'
import Footer from './components/Footer/Footer'
import PageTransition from './components/PageTransition/PageTransition'
import { InstagramProvider } from './context/InstagramContext'
import { PropertyProvider } from './context/PropertyContext'
import { CampaignCacheProvider } from './context/CampaignCacheContext'
import PropertiesPage from './pages/PropertiesPage/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage/PropertyDetailPage'
import BlogPage from './pages/BlogPage/BlogPage'
import CampaignDetailPage from './pages/CampaignDetailPage/CampaignDetailPage'

// Componente para la página principal
const HomePage = () => (
  <>
    <HeroSection />
    <PropertiesSection />
    <OportunitiesSection />
    <ContactSection />
    <ConnectSection />
  </>
)

function App() {
  return (
    <Router basename="/project">
      <InstagramProvider>
        <PropertyProvider>
          <CampaignCacheProvider>
            <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <PageTransition>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/property/:id" element={<PropertyDetailPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/campaign/:campaignId" element={<CampaignDetailPage />} />
                </Routes>
              </PageTransition>
            </main>
            <Footer />
            </div>
          </CampaignCacheProvider>
        </PropertyProvider>
      </InstagramProvider>
    </Router>
  )
}

export default App
