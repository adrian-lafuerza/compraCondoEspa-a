import React, { useRef, useEffect } from 'react';

import StarIcon from '../../assets/Star.svg'
import YoutubeButton from '../../assets/youtube-button.svg'


const OportunitiesSection = () => {
    const sectionRef = useRef(null)
    const bannerRef = useRef(null)
    const cardRef = useRef(null)
    const textRef = useRef(null)
    const imageRef = useRef(null)


    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed')
                }
            })
        }, observerOptions)

        const elements = [bannerRef.current, cardRef.current, textRef.current, imageRef.current]
        elements.forEach(el => {
            if (el) observer.observe(el)
        })

        return () => {
            elements.forEach(el => {
                if (el) observer.unobserve(el)
            })
        }
    }, [])



    const handleScrollToProperties = () => {
        const propertiesSection = document.getElementById('properties-section');
        if (propertiesSection) {
            propertiesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <section ref={sectionRef}>
            {/* Banner superior */}

            {/* Marquee infinito - Fuera del contenedor para ocupar todo el ancho */}
            <div
                className="w-full bg-black py-8 my-20"
            >
                <div
                    className="marquee"
                >
                    <div className="marquee__content font-gothic-a1 ">
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">Tu puerta de entrada a las mejores oportunidades inmobiliarias en EE.UU. y España</span>
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">★</span>
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">Tu puerta de entrada a las mejores oportunidades inmobiliarias en EE.UU. y España</span>
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">★</span>
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">Tu puerta de entrada a las mejores oportunidades inmobiliarias en EE.UU. y España</span>
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">★</span>
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">Tu puerta de entrada a las mejores oportunidades inmobiliarias en EE.UU. y España</span>
                        <span className="text-white text-xl md:text-2xl font-bold mx-4 md:mx-4 whitespace-nowrap">★</span>
                    </div>
                </div>
            </div>

            {/* Card de Inversiones */}
            <div className="py-8 md:py-16 lg:py-20 px-4 md:px-8">
                <div className="max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
                    <div ref={cardRef} className="bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden scroll-reveal animate-fadeInUp hover-lift">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] p-4 md:p-6 lg:p-8">
                            {/* Contenido de texto */}
                            <div ref={textRef} className="p-6 md:p-8 lg:p-12 xl:p-24 flex flex-col justify-center scroll-reveal animate-slideInLeft delay-200">
                                <div className="">
                                    <div className='flex'>
                                        <h2 className="font-work-sans text-xl md:text-2xl lg:text-4xl xl:text-4xl font-bold text-gray-900 mb-4 md:mb-6 lg:mb-8">

                                            🏠 Inversiones inteligentes en propiedades españolas
                                        </h2></div>
                                    <p className="text-gray-600 mb-6 md:mb-8 lg:mb-10 leading-relaxed text-sm md:text-base lg:text-lg">
                                        Si estás buscando propiedades que generen ingresos desde el primer mes, con bajo riesgo y alto retorno, esta sección es para ti.
                                    </p>
                                </div>

                                <div className="space-y-3 md:space-y-4 lg:space-y-5 mb-6 md:mb-8 lg:mb-10">
                                    <div className="flex items-center">
                                        <span className="text-green-500 mr-3 md:mr-4 text-lg md:text-xl">✓</span>
                                        <span className="text-gray-700 text-sm md:text-base lg:text-lg font-bold">Inversiones desde 100.000 €</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-green-500 mr-3 md:mr-4 text-lg md:text-xl">✓</span>
                                        <span className="text-gray-700 text-sm md:text-base lg:text-lg font-bold">Rentabilidad desde el 7% anual</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-green-500 mr-3 md:mr-4 text-lg md:text-xl">✓</span>
                                        <span className="text-gray-700 text-sm md:text-base lg:text-lg font-bold">Gestión incluida (ideal para Airbnb o alquiler estable)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-green-500 mr-3 md:mr-4 text-lg md:text-xl mb-4">✓</span>
                                        <span className="text-gray-700 text-sm md:text-base lg:text-lg font-bold">Acompañamiento legal y fiscal completo</span>
                                    </div>
                                    <button onClick={handleScrollToProperties} className="cursor-pointer border border-[#0E0E0E] text-[#0E0E0E] font-bold px-4 md:px-6 py-3 md:py-4 rounded text-xs md:text-sm hover:bg-[#0E0E0E] hover:text-white transition-colors flex items-center justify-center md:justify-start w-full md:w-auto hover-lift animate-buttonPulse">
                                        Ver Propiedades
                                        <span className="ml-2">→</span>
                                    </button>
                                </div>
                            </div>

                            {/* Imagen de Ruben */}
                            <div ref={imageRef} className="relative flex items-stretch p-8 md:p-6 lg:p-8 h-full scroll-reveal animate-slideInRight delay-400">
                                <div className="w-full max-w-lg mx-auto flex flex-col h-full">
                                    <div className="relative flex-1">
                                        {/* Marco negro grueso */}
                                        <div className="bg-black p-3 md:p-4 rounded-lg h-full flex flex-col">
                                            {/* Logo RA en esquina superior izquierda */}
                                            <div className="absolute top-3 md:top-4 lg:top-6 left-3 md:left-4 lg:left-6 z-10">
                                                <div className="text-white">
                                                    <div className="text-lg md:text-xl lg:text-2xl font-bold">RA</div>
                                                    <div className="text-xs opacity-80">RUBEN ALVAREZ</div>
                                                    <div className="text-xs opacity-60">REAL ESTATE GROUP</div>
                                                </div>
                                            </div>

                                            {/* Imagen container con altura completa */}
                                            <div className="flex-1 relative bg-gray-800 overflow-hidden">
                                                <img
                                                    src={`${import.meta.env.BASE_URL}images/RUBEN FOTO 1.png`}
                                                    alt="Ruben Alvarez"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Botón de YouTube posicionado mitad dentro y mitad fuera */}
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                                                <div className="cursor-pointer hover:scale-110 transition-all duration-300">
                                                    <img
                                                        src={YoutubeButton}
                                                        alt="Play video"
                                                        className="w-28 h-28"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OportunitiesSection