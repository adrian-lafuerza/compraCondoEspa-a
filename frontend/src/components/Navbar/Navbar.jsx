import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Logo from '../../assets/logo.png'
import FacebookIcon from '../../assets/facebook-icon.svg'
import InstagramIcon from '../../assets/instagram-icon.svg'
import LinkedInIcon from '../../assets/linkedin-icon.svg'
import BehanceIcon from '../../assets/behance-icon.svg'
import DribbbleIcon from '../../assets/dribbble-icon.svg'

export const Navbar = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-[#0E0E0E] text-white border-b border-white">
            <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-[90%]">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to='/'>
                        <img className="w-18 h-16 md:max-w-[89px] md:max-h-[60px]" src={Logo} alt='logo' />
                    </Link>
                </div>

                {/* Hamburger Menu Button - Visible on mobile */}
                <button
                    onClick={toggleMenu}
                    className="cursor-pointer md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>

                {/* Desktop Menu - Hidden on mobile */}
                <div className="hidden md:flex items-center space-x-2 md:space-x-4">
                    {/* Social Media Icons - Always visible */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <a href="https://www.facebook.com/wwwrubenalfonsocom/?_rdr" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={FacebookIcon} alt="Facebook" className="w-4 h-4 md:w-5 md:h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                        <a href="https://www.instagram.com/comprandoconespana/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={DribbbleIcon} alt="Dribbble" className="w-4 h-4 md:w-5 md:h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                        <a href="https://www.instagram.com/comprandoconespana/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={InstagramIcon} alt="Instagram" className="w-4 h-4 md:w-5 md:h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                        <a href="https://www.linkedin.com/in/ruben-alfonso-7143334/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={LinkedInIcon} alt="Linkedin" className="w-4 h-4 md:w-5 md:h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                        <a href="https://www.behance.net/rubendario" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={BehanceIcon} alt="Behance" className="w-4 h-4 md:w-5 md:h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                    </div>

                    {/* Contact Info - Hidden on mobile */}
                    <div className="hidden lg:flex items-center space-x-4 text-sm">
                        <span>Miami: <a href="tel:+17862282670" className="hover:text-gray-300 transition-colors">+17862282670</a></span>
                        <a href="mailto:raftonsa@compracondomiami.com" className="hover:text-gray-300 transition-colors">raftonsa@compracondomiami.com</a>
                    </div>

                    {/* Location Links - Hidden on small screens */}
                    <div className="hidden md:flex items-center space-x-3 text-sm">
                        <a href="#" className="hover:text-gray-300 transition-colors">España</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Miami</a>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Toggleable */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-6 py-4 bg-[#0E0E0E] border-t border-gray-700">
                    {/* Social Media Icons */}
                    <div className="flex justify-center items-center space-x-4 mb-4">
                        <a href="https://www.facebook.com/profile.php?id=61566828486192" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={FacebookIcon} alt="Facebook" className="w-5 h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                        <a href="https://www.instagram.com/comprandoconespana/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={InstagramIcon} alt="Instagram" className="w-5 h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                        <a href="https://www.linkedin.com/in/ruben-dario-rivas-torres-b8b8b8b8/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={LinkedInIcon} alt="LinkedIn" className="w-5 h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                        <a href="https://www.behance.net/rubendario" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group">
                            <img src={BehanceIcon} alt="Behance" className="w-5 h-5 group-hover:filter group-hover:brightness-0 transition-all duration-300" />
                        </a>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center space-y-2 text-sm mb-4">
                        <div>Miami: <a href="tel:+17862282670" className="hover:text-gray-300 transition-colors">+17862282670</a></div>
                        <div><a href="mailto:raftonsa@compracondomiami.com" className="hover:text-gray-300 transition-colors">raftonsa@compracondomiami.com</a></div>
                    </div>

                    {/* Location Links */}
                    <div className="flex justify-center items-center space-x-6 text-sm">
                        <a href="#" className="hover:text-gray-300 transition-colors">España</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Miami</a>
                    </div>
                </div>
            </div>
        </nav>
    )
}
