import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProperty } from '../../context/PropertyContext';

export const PropertiesSection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { searchByZone, searchByLocation, searchByNewProperty } = useProperty();
    const sectionRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observar la sección principal
        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        // Observar cada tarjeta
        cardsRef.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleViewProperties = () => {
        navigate('/properties');
    };

    const handleViewMadridProperties = () => {
        searchByLocation('Madrid');
        navigate('/properties?location=Madrid');
    };

    const handleViewCostaDelSolProperties = () => {
        const currentNewProperty = searchParams.get('newProperty');
        if (currentNewProperty) {
            // Si estamos en una página de newProperty, combinar filtros
            searchByNewProperty(currentNewProperty, 'costa-del-sol');
            navigate(`/properties?newProperty=${currentNewProperty}&location=costa-del-sol`);
        } else {
            // Comportamiento normal
            searchByZone('costa-del-sol');
            navigate('/properties?zone=costa-del-sol');
        }
    };

    const handleViewCostaBlancaProperties = () => {
        const currentNewProperty = searchParams.get('newProperty');
        if (currentNewProperty) {
            // Si estamos en una página de newProperty, combinar filtros
            searchByNewProperty(currentNewProperty, 'costa-blanca');
            navigate(`/properties?newProperty=${currentNewProperty}&location=costa-blanca`);
        } else {
            // Comportamiento normal
            searchByZone('costa-blanca');
            navigate('/properties?zone=costa-blanca');
        }
    };

    const handleViewInvestmentOpportunities = () => {
        searchByNewProperty('inversion');
        navigate('/properties?newProperty=inversion');
    };

    const handleViewPreconstruction = () => {
        searchByNewProperty('preconstruccion');
        navigate('/properties?newProperty=preconstruccion');
    };
    return (
        <section id="properties-section" className="bg-white py-8 md:py-16 px-4 md:px-8">
            <div className="max-w-[95%] md:max-w-[95%] lg:max-w-[85%] mx-auto">
                {/* Header */}
                <div ref={sectionRef} className="text-center py-6 md:py-12 w-[85%] scroll-reveal mx-auto">
                    <div className="flex items-center justify-center mb-4 md:mb-6">
                        <span className="text-red-500 text-xl md:text-2xl mr-2 animate-float">📍</span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 text-center animate-revealFromBottom">
                            Propiedades por zonas exclusivas
                        </h2>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-8 md:mb-12 text-sm md:text-base px-4 animate-fadeInUp delay-300">
                        Elige la ubicación que más se adapta a tu estilo de vida o tus objetivos de inversión.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-16 py-6 md:py-12">
                    {/* Madrid */}
                    <div 
                        ref={(el) => cardsRef.current[0] = el}
                        className="group relative overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300 rounded-lg scroll-reveal hover-lift animate-shimmer"
                    >
                        <div className="relative">
                            <img
                                src={`${import.meta.env.BASE_URL}images/sales.png`}
                                alt="Madrid - Lujo urbano y conexiones globales"
                                className="w-full object-cover image-hover-smooth"
                            />
                        </div>
                        <div className="px-8 md:px-4 md:px-6 py-6 md:py-8 bg-white">
                            <span className="text-gray-400 mb-2 text-lg md:text-sm">Obra nueva</span>
                            <h3 className="text-gray-900 text-lg md:text-lg font-semibold mb-4">Madrid – Lujo urbano y conexiones globales</h3>
                            <button
                                onClick={handleViewMadridProperties}
                                className="cursor-pointer border border-[#0E0E0E] text-[#0E0E0E] font-bold px-4 md:px-6 py-2 rounded text-md md:text-sm hover:bg-[#0E0E0E] hover:text-white transition-colors flex items-center w-full md:w-auto justify-center md:justify-start"
                            >
                                <span className="truncate">Ver Propiedades</span>
                                <span className="ml-2">→</span>
                            </button>
                        </div>
                    </div>
                    <div 
                        ref={(el) => cardsRef.current[1] = el}
                        className="group relative overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300 rounded-lg scroll-reveal hover-lift animate-shimmer"
                    >
                        <div className="relative">
                            <img
                                src={`${import.meta.env.BASE_URL}images/rent.png`}
                                alt="Costa del Sol - Vida premium frente al mar"
                                className="w-full object-cover image-hover-smooth"
                            />
                        </div>
                        <div className="px-8 md:px-4 md:px-6 py-6 md:py-8 bg-white">
                            <span className="text-gray-400 text-lg md:text-sm">Obra nueva</span>
                            <h3 className="text-gray-900 text-lg md:text-lg font-semibold mb-4">Costa del Sol – Vida premium frente al mar</h3>
                            <button
                                onClick={handleViewCostaDelSolProperties}
                                className="cursor-pointer border border-[#0E0E0E] text-[#0E0E0E] font-bold px-4 md:px-6 py-2 rounded text-md md:text-sm hover:bg-[#0E0E0E] hover:text-white transition-colors flex items-center w-full md:w-auto justify-center md:justify-start"
                            >
                                <span className="truncate">Ver Propiedades</span>
                                <span className="ml-2">→</span>
                            </button>
                        </div>
                    </div>
                    <div 
                        ref={(el) => cardsRef.current[2] = el}
                        className="group relative overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300 rounded-lg scroll-reveal hover-lift animate-shimmer"
                    >
                        <div className="relative">
                            <img
                                src={`${import.meta.env.BASE_URL}images/rent.png`}
                                alt="Florida - Inversión y estilo de vida"
                                className="w-full object-cover image-hover-smooth"
                            />
                        </div>
                        <div className="px-8 md:px-4 md:px-6 py-6 md:py-8 bg-white">
                            <span className="text-gray-400 mb-2 text-lg md:text-sm">Obra nueva</span>
                            <h3 className="text-gray-900 text-lg md:text-lg font-semibold mb-4">Costa Blanca – Tranquilidad mediterránea</h3>
                            <button
                                onClick={handleViewCostaBlancaProperties}
                                className="cursor-pointer border border-[#0E0E0E] text-[#0E0E0E] font-bold px-4 md:px-6 py-2 rounded text-md md:text-sm hover:bg-[#0E0E0E] hover:text-white transition-colors flex items-center w-full md:w-auto justify-center md:justify-start"
                            >
                                <span className="truncate">Ver Propiedades</span>
                                <span className="ml-2">→</span>
                            </button>
                        </div>
                    </div>
                    <div 
                        ref={(el) => cardsRef.current[3] = el}
                        className="group relative overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300 rounded-lg scroll-reveal hover-lift animate-shimmer"
                    >
                        <div className="relative">
                            <img
                                src={`${import.meta.env.BASE_URL}images/sales.png`}
                                alt="Oportunidades de Inversión - Rentabilidad garantizada"
                                className="w-full object-cover image-hover-smooth"
                            />
                        </div>
                        <div className="px-8 md:px-4 md:px-6 py-6 md:py-8 bg-white">
                            <span className="text-gray-400 mb-2 text-lg md:text-sm">Inversión</span>
                            <h3 className="text-gray-900 text-lg md:text-lg font-semibold mb-4">Oportunidades de Inversión – Rentabilidad garantizada</h3>
                            <button
                                onClick={handleViewInvestmentOpportunities}
                                className="cursor-pointer border border-[#0E0E0E] text-[#0E0E0E] font-bold px-4 md:px-6 py-2 rounded text-md md:text-sm hover:bg-[#0E0E0E] hover:text-white transition-colors flex items-center w-full md:w-auto justify-center md:justify-start"
                            >
                                <span className="truncate">Ver Propiedades</span>
                                <span className="ml-2">→</span>
                            </button>
                        </div>
                    </div>
                    <div 
                        ref={(el) => cardsRef.current[4] = el}
                        className="group relative overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300 rounded-lg scroll-reveal hover-lift animate-shimmer"
                    >
                        <div className="relative">
                            <img
                                src={`${import.meta.env.BASE_URL}images/rent.png`}
                                alt="Preconstrucción - Proyectos exclusivos"
                                className="w-full object-cover image-hover-smooth"
                            />
                        </div>
                        <div className="px-8 md:px-4 md:px-6 py-6 md:py-8 bg-white">
                            <span className="text-gray-400 mb-2 text-lg md:text-sm">Preconstrucción</span>
                            <h3 className="text-gray-900 text-lg md:text-lg font-semibold mb-4">Preconstrucción – Proyectos exclusivos</h3>
                            <button
                                onClick={handleViewPreconstruction}
                                className="cursor-pointer border border-[#0E0E0E] text-[#0E0E0E] font-bold px-4 md:px-6 py-2 rounded text-md md:text-sm hover:bg-[#0E0E0E] hover:text-white transition-colors flex items-center w-full md:w-auto justify-center md:justify-start"
                            >
                                <span className="truncate">Ver Propiedades</span>
                                <span className="ml-2">→</span>
                            </button>
                        </div>
                    </div>
                </div>
                

            </div>
        </section>
    );
};