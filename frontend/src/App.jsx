import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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

// Componente para las rutas de la aplicación
const AppRoutes = () => (
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
              <Route path="/blog/campaign/:campaignId" element={<CampaignDetailPage />} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
        </div>
      </CampaignCacheProvider>
    </PropertyProvider>
  </InstagramProvider>
)

function App() {
  // Detectar si estamos en la ruta base del proyecto
  const isProjectRoute = window.location.pathname.startsWith('/project')
  
  if (isProjectRoute) {
    return (
      <Router basename="/project">
        <AppRoutes />
      </Router>
    )
  }
  
  // Si no estamos en /project, redirigir
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to="/project/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
