import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [displayChildren, setDisplayChildren] = useState(children)
    const location = useLocation()

    useEffect(() => {
        setIsTransitioning(true)
        
        const timer = setTimeout(() => {
            setDisplayChildren(children)
            setIsTransitioning(false)
        }, 150)

        return () => clearTimeout(timer)
    }, [location.pathname, children])

    return (
        <div className="relative min-h-screen">
            {/* Overlay de transición */}
            <div 
                className={`fixed inset-0 bg-white z-50 transition-opacity duration-300 pointer-events-none ${
                    isTransitioning ? 'opacity-20' : 'opacity-0'
                }`}
            />
            
            {/* Contenido de la página */}
            <div 
                className={`transition-all duration-300 transform ${
                    isTransitioning 
                        ? 'opacity-80 scale-[0.98] blur-sm' 
                        : 'opacity-100 scale-100 blur-0'
                }`}
            >
                {displayChildren}
            </div>
        </div>
    )
}

export default PageTransition