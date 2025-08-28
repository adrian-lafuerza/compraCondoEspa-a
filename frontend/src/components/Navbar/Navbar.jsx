import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '../../assets/logo.png'
import FacebookIcon from '../../assets/facebook-icon.svg'
import InstagramIcon from '../../assets/instagram-icon.svg'
import LinkedInIcon from '../../assets/linkedin-icon.svg'
import XIcon from '../../assets/x-icon.svg'
import YoutubeIcon from '../../assets/youtube-icon.svg'
import WhatsappIcon from '../../assets/whatsapp-icon.svg'
import useScrollReveal from '../../hooks/useScrollReveal'
import {
    slideInFromRight,
    containerVariants,
} from '../../utils/motionVariants'

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { ref: navRef, isInView: navInView } = useScrollReveal({ threshold: 0.1 });

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Variantes para el logo
    const logoVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            rotate: -10
        },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    // Variantes para el menú hamburguesa
    const hamburgerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                delay: 0.3
            }
        }
    };

    // Variantes para las líneas del hamburger
    const lineVariants = {
        closed: {
            rotate: 0,
            y: 0,
            opacity: 1
        },
        open: (custom) => ({
            rotate: custom.rotate,
            y: custom.y,
            opacity: custom.opacity,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        })
    };

    // Variantes para iconos sociales
    const socialIconVariants = {
        hidden: {
            opacity: 0,
            scale: 0,
            rotate: -180
        },
        visible: (index) => ({
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                duration: 0.5,
                delay: 0.4 + (index * 0.1),
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        })
    };

    // Variantes para el menú móvil
    const mobileMenuVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        },
        visible: {
            opacity: 1,
            height: 'auto',
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const mobileItemVariants = {
        hidden: {
            opacity: 0,
            y: -20,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <motion.header
            role="banner"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2
            }}
        >
            <motion.nav
                ref={navRef}
                className="bg-[#0E0E0E] text-white border-b border-white"
                role="navigation"
                aria-label="Navegación principal"
                initial="hidden"
                animate={navInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-[90%]">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center"
                        variants={logoVariants}
                    >
                        <motion.a
                            href="/"
                            aria-label="Ir a página principal - Rubén Alfonso Real Estate Miami"
                            whileHover={{
                                scale: 1.05,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{
                                scale: 0.95,
                                transition: { duration: 0.1 }
                            }}
                        >
                            <motion.img
                                className="w-18 h-16 md:max-w-[89px] md:max-h-[60px]"
                                src={Logo}
                                alt="Rubén Alfonso - Agente inmobiliario especializado en propiedades de Miami y España"
                                title="Rubén Alfonso Real Estate - Tu experto en inversiones inmobiliarias"
                                loading="eager"
                                whileHover={{
                                    rotate: [0, -5, 5, 0],
                                    transition: { duration: 0.5 }
                                }}
                            />
                        </motion.a>
                    </motion.div>

                    {/* Hamburger Menu Button - Visible on mobile */}
                    <motion.button
                        onClick={toggleMenu}
                        className="cursor-pointer md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
                        aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                        type="button"
                        variants={hamburgerVariants}
                        whileHover={{
                            scale: 1.1,
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{
                            scale: 0.9,
                            transition: { duration: 0.1 }
                        }}
                    >
                        <motion.span
                            className="block w-6 h-0.5 bg-white"
                            variants={lineVariants}
                            animate={isMenuOpen ? "open" : "closed"}
                            custom={{ rotate: 45, y: 8, opacity: 1 }}
                        />
                        <motion.span
                            className="block w-6 h-0.5 bg-white"
                            variants={lineVariants}
                            animate={isMenuOpen ? "open" : "closed"}
                            custom={{ rotate: 0, y: 0, opacity: 0 }}
                        />
                        <motion.span
                            className="block w-6 h-0.5 bg-white"
                            variants={lineVariants}
                            animate={isMenuOpen ? "open" : "closed"}
                            custom={{ rotate: -45, y: -8, opacity: 1 }}
                        />
                    </motion.button>

                    {/* Desktop Menu - Hidden on mobile */}
                    <motion.div
                        className="hidden md:flex items-center space-x-2 md:space-x-4"
                        variants={containerVariants}
                    >
                        {/* Social Media Icons - Always visible */}
                        <motion.div
                            className="flex items-center space-x-3 md:space-x-4"
                            role="list"
                            aria-label="Redes sociales"
                            variants={containerVariants}
                        >
                            {[
                                {
                                    href: "https://www.facebook.com/rubenalfonsogroup",
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
                                    href: "https://www.instagram.com/rubenalfonsorealtor/",
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
                                    href: "https://wa.me/+17862823870",
                                    icon: WhatsappIcon,
                                    label: "Conéctate en WhatsApp - Rubén Alfonso",
                                    title: "WhatsApp - Inversiones inmobiliarias Miami-España",
                                    alt: "WhatsApp - Comprando con España"
                                },
                            ].map((social, index) => (
                                <motion.a
                                    key={social.href}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 transform group"
                                    aria-label={social.label}
                                    title={social.title}
                                    variants={socialIconVariants}
                                    custom={index}
                                    whileHover={{
                                        y: -4,
                                        scale: 1.1,
                                        boxShadow: "0 10px 25px rgba(255,255,255,0.1)",
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{
                                        scale: 0.9,
                                        transition: { duration: 0.1 }
                                    }}
                                >
                                    <motion.img
                                        src={social.icon}
                                        alt={social.alt}
                                        className="w-4 h-4 md:w-5 md:h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300"
                                        loading="lazy"
                                        whileHover={{
                                            rotate: [0, -10, 10, 0],
                                            transition: { duration: 0.4 }
                                        }}
                                    />
                                </motion.a>
                            ))}
                        </motion.div>

                        {/* Contact Info - Hidden on mobile */}
                        <motion.div
                            className="hidden lg:flex items-center space-x-4 text-sm"
                            role="contentinfo"
                            aria-label="Información de contacto"
                            variants={slideInFromRight}
                        >
                            <motion.span
                                className="hover:text-gray-300 transition-colors duration-200"
                                whileHover={{
                                    scale: 1.05,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                Miami:
                                <motion.a
                                    href="tel:+17862823870"
                                    className="hover:text-gray-300 transition-colors"
                                    aria-label="Llamar a oficina de Miami"
                                    title="Contacto directo Miami - Rubén Alfonso"
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    +1 (786) 282-3870
                                </motion.a>
                            </motion.span>
                            <motion.a
                                href="mailto:raftonsa@compracondomiami.com"
                                className="hover:text-gray-300 transition-colors duration-200"
                                aria-label="Enviar email a Rubén Alfonso"
                                title="Email - Consultas inmobiliarias Miami"
                                whileHover={{
                                    scale: 1.05,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                raftonsa@compracondomiami.com
                            </motion.a>
                        </motion.div>

                        {/* Location Links - Hidden on small screens */}
                        <motion.nav
                            className="hidden md:flex items-center space-x-3 text-sm"
                            aria-label="Ubicaciones de servicio"
                            variants={slideInFromRight}
                        >
                            {[
                                { href: "https://www.compracondomiami.com/", label: "Miami", ariaLabel: "Servicios inmobiliarios en Miami", title: "Propiedades e inversiones en Miami" }
                            ].map((location, index) => (
                                <motion.a
                                    key={location.href}
                                    href={location.href}
                                    className="hover:text-gray-300 transition-colors duration-200"
                                    aria-label={location.ariaLabel}
                                    title={location.title}
                                    whileHover={{
                                        scale: 1.1,
                                        y: -2,
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                        transition: { duration: 0.1 }
                                    }}
                                >
                                    {location.label}
                                </motion.a>
                            ))}
                        </motion.nav>
                    </motion.div>
                </div>

                {/* Mobile Menu - Toggleable */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            id="mobile-menu"
                            className="md:hidden overflow-hidden"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <motion.div
                                className="px-6 py-4 bg-[#0E0E0E] border-t border-gray-700"
                                variants={containerVariants}
                            >
                                {/* Social Media Icons */}
                                <motion.div
                                    className="flex justify-center items-center space-x-4 mb-4"
                                    role="list"
                                    aria-label="Redes sociales"
                                    variants={mobileItemVariants}
                                >
                                    {[
                                        {
                                            href: "https://www.facebook.com/rubenalfonsogroup",
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
                                            href: "https://www.instagram.com/rubenalfonsorealtor/",
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
                                            href: "https://wa.me/+17862823870",
                                            icon: WhatsappIcon,
                                            label: "Conéctate en WhatsApp - Rubén Alfonso",
                                            title: "WhatsApp - Inversiones inmobiliarias Miami-España",
                                            alt: "WhatsApp - Comprando con España"
                                        },
                                    ].map((social, index) => (
                                        <motion.a
                                            key={social.href}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 transform group"
                                            aria-label={social.label}
                                            title={social.title}
                                            whileHover={{
                                                y: -4,
                                                scale: 1.1,
                                                boxShadow: "0 10px 25px rgba(255,255,255,0.1)",
                                                transition: { duration: 0.2 }
                                            }}
                                            whileTap={{
                                                scale: 0.9,
                                                transition: { duration: 0.1 }
                                            }}
                                        >
                                            <motion.img
                                                src={social.icon}
                                                alt={social.alt}
                                                className="w-5 h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300"
                                                loading="lazy"
                                                whileHover={{
                                                    rotate: 360,
                                                    transition: { duration: 0.5 }
                                                }}
                                            />
                                        </motion.a>
                                    ))}
                                </motion.div>

                                {/* Contact Info */}
                                <motion.div
                                    className="text-center space-y-2 text-sm mb-4"
                                    role="contentinfo"
                                    aria-label="Información de contacto"
                                    variants={mobileItemVariants}
                                >
                                    <motion.div
                                        whileHover={{
                                            scale: 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        Miami:
                                        <motion.a
                                            href="tel:+17862823870"
                                            className="hover:text-gray-300 transition-colors duration-200"
                                            aria-label="Llamar a oficina de Miami"
                                            title="Contacto directo Miami"
                                            whileHover={{
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            +1 (786) 282-3870
                                        </motion.a>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{
                                            scale: 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <motion.a
                                            href="mailto:raftonsa@compracondomiami.com"
                                            className="hover:text-gray-300 transition-colors duration-200"
                                            aria-label="Enviar email a Rubén Alfonso"
                                            title="Email para consultas"
                                            whileHover={{
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            raftonsa@compracondomiami.com
                                        </motion.a>
                                    </motion.div>
                                </motion.div>

                                {/* Location Links */}
                                <motion.nav
                                    className="flex justify-center items-center space-x-6 text-sm"
                                    aria-label="Ubicaciones de servicio"
                                    variants={mobileItemVariants}
                                >
                                    {[
                                        { href: "https://www.compracondomiami.com/", label: "Miami", ariaLabel: "Servicios inmobiliarios en Miami", title: "Propiedades en Miami" }
                                    ].map((location) => (
                                        <motion.a
                                            key={location.href}
                                            href={location.href}
                                            className="hover:text-gray-300 transition-colors duration-200"
                                            aria-label={location.ariaLabel}
                                            title={location.title}
                                            whileHover={{
                                                scale: 1.1,
                                                y: -2,
                                                transition: { duration: 0.2 }
                                            }}
                                            whileTap={{
                                                scale: 0.95,
                                                transition: { duration: 0.1 }
                                            }}
                                        >
                                            {location.label}
                                        </motion.a>
                                    ))}
                                </motion.nav>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </motion.header>
    )
}
