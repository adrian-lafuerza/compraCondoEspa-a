import { useEffect, useRef, useState } from 'react'
import { useContactForm } from '../../services/emailService'
import FacebookIcon from '../../assets/facebook-icon.svg';
import InstagramIcon from '../../assets/instagram-icon.svg';
import LinkedInIcon from '../../assets/linkedin-icon.svg';
import XIcon from '../../assets/x-icon.svg'
import YoutubeIcon from '../../assets/youtube-icon.svg'
import WhatsappIcon from '../../assets/whatsapp-icon.svg'

const ContactSection = () => {
    const sectionRef = useRef(null)
    const headerRef = useRef(null)
    const containerRef = useRef(null)
    const leftColumnRef = useRef(null)
    const rightColumnRef = useRef(null)

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        location: '',
        message: ''
    })

    // Hook personalizado para manejar el envío
    const { submitForm, isLoading, status, clearStatus } = useContactForm()

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Limpiar mensajes de estado cuando el usuario empiece a escribir
        if (status.message) {
            clearStatus()
        }
    }

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await submitForm(formData)

        if (result.success) {
            // Limpiar formulario si el envío fue exitoso
            setFormData({
                name: '',
                email: '',
                location: '',
                message: ''
            })
        }
    }

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

        const elements = [headerRef.current, containerRef.current, leftColumnRef.current, rightColumnRef.current]
        elements.forEach(el => {
            if (el) observer.observe(el)
        })

        return () => {
            elements.forEach(el => {
                if (el) observer.unobserve(el)
            })
        }
    }, [])

        const socialLinks = [
        {
            href: "https://www.facebook.com/wwwrubenalfonsocom/?_rdr",
            icon: FacebookIcon,
            label: "Síguenos en Facebook - Rubén Alfonso Real Estate",
            title: "Facebook - Propiedades en Miami y España",
            alt: "Facebook - Rubén Alfonso Real Estate"
        },
        {
            href: "https://x.com/RUBENALFONSOG",
            icon: XIcon,
            label: "Siguenos en X - Comprando con España",
            title: "X - Inversiones inmobiliarias Miami-España",
            alt: "X - Comprando con España"
        },
        {
            href: "https://www.instagram.com/comprandoconespana/",
            icon: InstagramIcon,
            label: "Síguenos en Instagram - Comprando con España",
            title: "Instagram - Inversiones inmobiliarias Miami-España",
            alt: "Instagram - Comprando con España"
        },
        {
            href: "https://www.youtube.com/@RUBENALFONSOREALTOR",
            icon: YoutubeIcon,
            label: "Ver canal en YouTube - Rubén Alfonso",
            title: "YouTube - Inversiones inmobiliarias Miami-España",
            alt: "YouTube - Comprando con España"
        },
        {
            href: "https://www.linkedin.com/in/ruben-alfonso-7143334/",
            icon: LinkedInIcon,
            label: "Conéctate en LinkedIn - Rubén Alfonso",
            title: "LinkedIn - Perfil profesional inmobiliario",
            alt: "LinkedIn - Rubén Alfonso"
        },
        {
            href: "https://wa.me/17862282670",
            icon: WhatsappIcon,
            label: "Conéctate en WhatsApp - Rubén Alfonso",
            title: "WhatsApp - Inversiones inmobiliarias Miami-España",
            alt: "WhatsApp - Comprando con España"
        },
    ];

    return (
        <section ref={sectionRef} className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
            {/* Fondo dividido horizontal - mitad superior blanco, mitad inferior gris */}
            <div className="absolute inset-0">
                <div className="h-1/2 w-full bg-white"></div>
                <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gray-100"></div>
            </div>

            <div className="relative z-10 max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-8 md:mb-12 lg:mb-16 scroll-reveal animate-fadeInUp">
                    <div className="flex flex-col md:flex-row items-center justify-center mb-4 md:mb-6">
                        <div className="text-blue-600 mr-0 md:mr-3 mb-2 md:mb-0">
                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 text-center">
                            ¿Te interesa alguna propiedad o quieres saber más?
                        </h2>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
                        Dinos si estás buscando vivienda, inversión o ambas. Te responderemos personalmente con opciones reales, sin compromiso.
                    </p>
                </div>

                {/* Contact Form Container */}
                <div ref={containerRef} className="bg-white rounded-xl md:rounded-2xl shadow-2xl py-8 md:py-16 lg:py-24 px-4 md:px-8 lg:px-12 xl:px-20 max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center scroll-reveal animate-fadeInUp delay-200 hover-lift">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 w-full">
                        {/* Left Column - Contact Info */}
                        <div ref={leftColumnRef} className="flex flex-col justify-center scroll-reveal animate-slideInLeft delay-400">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
                                Hablemos sobre tu proyecto
                            </h3>

                            {/* Contact Details */}
                            <div className="space-y-6 md:space-y-8 lg:space-y-12 mb-8 md:mb-12 lg:mb-16">
                                <div className="flex items-start">
                                    <div className="bg-gray-900 rounded-lg p-2 md:p-3 mr-3 md:mr-4 lg:mr-6 flex-shrink-0">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-500 mb-1">Address:</p>
                                        <p className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">Miami, Florida, Estados Unidos</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-purple-100 rounded-lg p-2 md:p-3 mr-3 md:mr-4 lg:mr-6 flex-shrink-0">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-500 mb-1">Mi Email</p>
                                        <p className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">ralfonso@compracondomiami.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-purple-100 rounded-lg p-2 md:p-3 mr-3 md:mr-4 lg:mr-6 flex-shrink-0">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-500 mb-1">Llámame</p>
                                        <p className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">+34.644.973.877</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="flex space-x-3 md:space-x-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.href}
                                        href={social.href}
                                        title={social.title}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gray-900 p-2 md:p-3 rounded-lg hover:bg-gray-800 transition-colors hover-lift animate-float"
                                        aria-label={social.label}
                                    >
                                        <img
                                            src={social.icon}
                                            alt={social.alt}
                                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 filter brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all duration-300"
                                            aria-hidden="true"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div ref={rightColumnRef} className="flex flex-col justify-center scroll-reveal animate-slideInRight delay-600">
                            {/* Mensaje de estado */}
                            {status.message && (
                                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${status.type === 'success'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nombre*"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-0 py-2 md:py-3 border-0 border-b border-gray-300 bg-transparent focus:border-blue-500 outline-none transition-all duration-300 ease-in-out focus:scale-105 text-sm md:text-base disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email*"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-0 py-2 md:py-3 border-0 border-b border-gray-300 bg-transparent focus:border-blue-500 outline-none transition-all duration-300 ease-in-out focus:scale-105 text-sm md:text-base disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Ubicación"
                                        disabled={isLoading}
                                        className="w-full px-0 py-2 md:py-3 border-0 border-b border-gray-300 bg-transparent focus:border-blue-500 outline-none transition-all duration-300 ease-in-out focus:scale-105 text-sm md:text-base disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Mensaje*"
                                        rows={4}
                                        required
                                        disabled={isLoading}
                                        className="w-full px-0 py-2 md:py-3 border-0 border-b border-gray-300 bg-transparent focus:border-blue-500 outline-none resize-none transition-all duration-300 ease-in-out focus:scale-105 text-sm md:text-base disabled:opacity-50"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !formData.name || !formData.email || !formData.message}

                                    className={`cursor-pointer px-6 md:px-8 py-2 md:py-3 rounded-lg transition-colors flex items-center justify-center md:justify-start w-full md:w-auto text-sm md:text-base hover-lift animate-buttonPulse ${isLoading || !formData.name || !formData.email || !formData.message
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            Enviar
                                            <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M18.3393 7.32013L4.33927 0.320128C3.78676 0.0451374 3.16289 -0.0527612 2.55271 0.03978C1.94252 0.132321 1.37573 0.410798 0.929602 0.837244C0.483474 1.26369 0.179724 1.81735 0.0597636 2.42274C-0.0601964 3.02813 0.00947219 3.65578 0.259271 4.22013L2.65927 9.59013C2.71373 9.71996 2.74177 9.85934 2.74177 10.0001C2.74177 10.1409 2.71373 10.2803 2.65927 10.4101L0.259271 15.7801C0.055971 16.2368 -0.0299735 16.7371 0.00924794 17.2355C0.0484693 17.7339 0.211613 18.2145 0.483853 18.6338C0.756092 19.0531 1.1288 19.3977 1.56809 19.6363C2.00739 19.875 2.49935 20 2.99927 20.0001C3.4675 19.9955 3.92876 19.8861 4.34927 19.6801L18.3493 12.6801C18.8459 12.4303 19.2633 12.0474 19.555 11.5742C19.8466 11.101 20.0011 10.556 20.0011 10.0001C20.0011 9.44424 19.8466 8.89928 19.555 8.42605C19.2633 7.95282 18.8459 7.56994 18.3493 7.32013H18.3393ZM17.4493 10.8901L3.44927 17.8901C3.26543 17.9784 3.059 18.0084 2.85766 17.976C2.65631 17.9436 2.46968 17.8504 2.32278 17.709C2.17589 17.5675 2.07575 17.3845 2.0358 17.1846C1.99585 16.9846 2.018 16.7772 2.09927 16.5901L4.48927 11.2201C4.52021 11.1484 4.54692 11.075 4.56927 11.0001H11.4593C11.7245 11.0001 11.9788 10.8948 12.1664 10.7072C12.3539 10.5197 12.4593 10.2653 12.4593 10.0001C12.4593 9.73491 12.3539 9.48056 12.1664 9.29302C11.9788 9.10549 11.7245 9.00013 11.4593 9.00013H4.56927C4.54692 8.9253 4.52021 8.85184 4.48927 8.78013L2.09927 3.41013C2.018 3.22309 1.99585 3.01568 2.0358 2.8157C2.07575 2.61572 2.17589 2.43273 2.32278 2.29128C2.46968 2.14982 2.65631 2.05666 2.85766 2.02428C3.059 1.9919 3.26543 2.02186 3.44927 2.11013L17.4493 9.11013C17.6131 9.19405 17.7505 9.32154 17.8465 9.47857C17.9425 9.63561 17.9933 9.81608 17.9933 10.0001C17.9933 10.1842 17.9425 10.3647 17.8465 10.5217C17.7505 10.6787 17.6131 10.8062 17.4493 10.8901Z" fill="white" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection