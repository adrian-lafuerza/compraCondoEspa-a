import { Link, useLocation } from 'react-router-dom'
import Logo from '../../assets/logo.png'
import FacebookIcon from '../../assets/Vector.svg'
import InstagramIcon from '../../assets/Vector (1).svg'
import LinkedInIcon from '../../assets/Vector (2).svg'
import BehanceIcon from '../../assets/Vector (3).svg'

export const Navbar = () => {
    const location = useLocation();

    const navLinks = [
        { path: '/', label: 'Inicio' },
        { path: '/properties', label: 'Propiedades' },
        { path: '/blog', label: 'Blog' }
    ];

    return (
        <nav className="bg-[#0E0E0E] text-white">
            <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-[90%]">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to='/'>
                        <img className="w-18 h-16 md:max-w-[89px] md:max-h-[60px]" src={Logo} alt='logo' />
                    </Link>
                </div>

                {/* Navigation Links - Hidden on mobile */}
                <div className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-medium transition-colors duration-200 hover:text-gray-300 ${
                                location.pathname === link.path 
                                    ? 'text-white border-b-2 border-white pb-1' 
                                    : 'text-gray-300'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Social Media Icons and Contact Info */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Social Media Icons - Always visible */}
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <a href="#" className="hover:opacity-80 transition-opacity">
                            <img src={FacebookIcon} alt="Facebook" className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                        <a href="#" className="hover:opacity-80 transition-opacity">
                            <img src={InstagramIcon} alt="Instagram" className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                        <a href="#" className="hover:opacity-80 transition-opacity">
                            <img src={LinkedInIcon} alt="LinkedIn" className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                        <a href="#" className="hover:opacity-80 transition-opacity">
                            <img src={BehanceIcon} alt="Behance" className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                    </div>
                    
                    {/* Contact Info - Hidden on mobile */}
                    <div className="hidden lg:flex items-center space-x-4 text-sm">
                        <span>Miami: +17862282670</span>
                        <span>raftonsa@compracondomiami.com</span>
                    </div>
                    
                    {/* Location Links - Hidden on small screens */}
                    <div className="hidden md:flex items-center space-x-3 text-sm">
                        <a href="#" className="hover:text-gray-300 transition-colors">España</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Miami</a>
                    </div>
                </div>
            </div>
        </nav>
    )
}
