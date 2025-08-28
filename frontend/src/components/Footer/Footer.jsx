import { motion } from 'framer-motion';
import Logo from '../../assets/footer-ruben.png';
import LogoExp from '../../assets/footer-exp.png';
import FooterSvg from '../../assets/footer.svg';
import FacebookIcon from '../../assets/facebook-icon.svg';
import InstagramIcon from '../../assets/instagram-icon.svg';
import LinkedInIcon from '../../assets/linkedin-icon.svg';
import XIcon from '../../assets/x-icon.svg'
import YoutubeIcon from '../../assets/youtube-icon.svg'
import WhatsappIcon from '../../assets/whatsapp-icon.svg'
import useScrollReveal from '../../hooks/useScrollReveal';
import {
    containerVariants,
} from '../../utils/motionVariants';

const Footer = () => {
    const { ref: footerRef, isInView: footerInView } = useScrollReveal({ threshold: 0.1 });
    const { ref: logoRef, isInView: logoInView } = useScrollReveal({ threshold: 0.2 });
    const { ref: socialRef, isInView: socialInView } = useScrollReveal({ threshold: 0.3 });
    const { ref: navRef, isInView: navInView } = useScrollReveal({ threshold: 0.2 });
    const { ref: svgRef, isInView: svgInView } = useScrollReveal({ threshold: 0.1 });

    // Variantes para los logos
    const logoVariants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.9
        },
        visible: (index) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                delay: index * 0.2,
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
                delay: 0.3 + (index * 0.1),
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        })
    };

    // Variantes para enlaces de navegación
    const navLinkVariants = {
        hidden: {
            opacity: 0,
            y: 20
        },
        visible: (index) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                delay: 0.5 + (index * 0.1),
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        })
    };

    // Variantes para la imagen SVG
    const svgVariants = {
        hidden: {
            opacity: 0,
            x: 100,
            scale: 0.8
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

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
        <motion.footer
            ref={footerRef}
            className="relative bg-gray-100 overflow-hidden"
            role="contentinfo"
            aria-label="Información de contacto y enlaces del sitio"
            initial="hidden"
            animate={footerInView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <motion.div
                className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-24 py-8 lg:py-12"
                variants={containerVariants}
            >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-8 lg:gap-16">
                    {/* Contenido Principal del Footer */}
                    <div className="flex-shrink-0 flex flex-col justify-between h-full w-full lg:w-auto">
                        {/* Logos de la Empresa */}
                        <motion.div
                            ref={logoRef}
                            className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 mb-6 lg:mb-8"
                            initial="hidden"
                            animate={logoInView ? "visible" : "hidden"}
                            variants={containerVariants}
                        >
                            <motion.img
                                src={Logo}
                                alt="Rubén Alfonso Real Estate Group - Logo principal"
                                className="h-12 md:h-16 lg:h-20 w-auto"
                                loading="lazy"
                                width="auto"
                                height="80"
                                variants={logoVariants}
                                custom={0}
                                whileHover={{
                                    scale: 1.05,
                                    rotate: [0, -2, 2, 0],
                                    transition: { duration: 0.5 }
                                }}
                            />
                            <motion.img
                                src={LogoExp}
                                alt="Rubén Alfonso Real Estate Group - Logo experiencia"
                                className="h-6 md:h-8 lg:h-10 w-auto"
                                loading="lazy"
                                width="auto"
                                height="40"
                                variants={logoVariants}
                                custom={1}
                                whileHover={{
                                    scale: 1.1,
                                    y: -5,
                                    transition: { duration: 0.3 }
                                }}
                            />
                        </motion.div>

                        {/* Redes Sociales */}
                        <motion.div
                            ref={socialRef}
                            className="mb-6 lg:mb-8"
                            initial="hidden"
                            animate={socialInView ? "visible" : "hidden"}
                            variants={containerVariants}
                        >
                            <h3 className="text-sm font-medium text-gray-600 sr-only">Síguenos en redes sociales</h3>
                            <motion.div
                                className="flex flex-wrap gap-2 sm:gap-3 md:gap-4"
                                variants={containerVariants}
                            >
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={social.href}
                                        href={social.href}
                                        title={social.title}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group bg-black text-white p-2 sm:p-3 md:p-4 rounded-xl hover:bg-white hover:text-black transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        aria-label={social.label}
                                        variants={socialIconVariants}
                                        custom={index}
                                        whileHover={{
                                            y: -8,
                                            scale: 1.1,
                                            rotate: [0, -10, 10, 0],
                                            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                                            transition: { duration: 0.3 }
                                        }}
                                        whileTap={{
                                            scale: 0.9,
                                            transition: { duration: 0.1 }
                                        }}
                                    >
                                        <motion.img
                                            src={social.icon}
                                            alt={social.alt}
                                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 filter brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all duration-300"
                                            aria-hidden="true"
                                            whileHover={{
                                                rotate: 360,
                                                transition: { duration: 0.6 }
                                            }}
                                        />
                                    </motion.a>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Enlaces de Navegación - Alineados al final */}
                        <motion.nav
                            ref={navRef}
                            className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 md:gap-6"
                            aria-label="Enlaces de navegación del footer"
                            initial="visible"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.a
                                href='https://www.wowwebgroup.com/'
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group mt-4 inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-800 to-black text-white text-xs sm:text-sm font-medium rounded-lg hover:from-black hover:to-gray-800 transition-all duration-300 transform shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                aria-label='Designed and Developed by Wowwebgroup'
                                variants={navLinkVariants}
                                style={{
                                    transformStyle: "preserve-3d",
                                    perspective: "1000px",
                                    boxShadow: "20px 20px 40px rgba(0,0,0,0.3)",
                                }}
                                animate={{
                                     y: [0, -15, 0],
                                     rotateX: [0, 8, 0],
                                     rotateY: [0, -5, 0],
                                     scale: [1, 1.02, 1],
                                     transition: {
                                         duration: 2.8,
                                         repeat: Infinity,
                                         ease: "easeInOut"
                                     }
                                 }}
                                whileHover={{
                                    scale: 1.08,
                                    y: -12,
                                    rotateX: 10,
                                    rotateY: -5,
                                    transition: {
                                        duration: 0.3,
                                        ease: [0.25, 0.46, 0.45, 0.94]
                                    }
                                }}
                                whileTap={{
                                    scale: 0.95,
                                    rotateX: -5,
                                    transition: { duration: 0.1 }
                                }}
                            >
                                <span className="group-hover:text-gray-100 transition-colors duration-300">
                                    Designed & Developed by <span className="font-semibold">Wowwebgroup</span>
                                </span>
                            </motion.a>
                        </motion.nav>
                    </div>

                    {/* Imagen SVG del Footer */}
                    <motion.div
                        ref={svgRef}
                        className="flex-grow relative flex justify-center lg:justify-end mt-6 lg:mt-0"
                        initial="hidden"
                        animate={svgInView ? "visible" : "hidden"}
                        variants={svgVariants}
                    >
                        <motion.img
                            src={FooterSvg}
                            alt="Ilustración decorativa de edificios de Miami"
                            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl 2xl:max-w-4xl h-auto object-contain lg:scale-110"
                            loading="lazy"
                            width="800"
                            height="600"
                            whileHover={{
                                scale: 1.05,
                                y: -10,
                                transition: {
                                    duration: 0.4,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }
                            }}
                            animate={{
                                y: [0, -10, 0],
                                transition: {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }}
                        />
                    </motion.div>
                </div>
            </motion.div>
        </motion.footer>
    );
};

export default Footer;