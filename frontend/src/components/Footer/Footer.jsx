import Logo from '../../assets/footer-ruben.png';
import LogoExp from '../../assets/footer-exp.png';
import FooterSvg from '../../assets/footer.svg';
import FacebookIcon from '../../assets/facebook-icon.svg';
import InstagramIcon from '../../assets/instagram-icon.svg';
import LinkedInIcon from '../../assets/linkedin-icon.svg';
import BehanceIcon from '../../assets/behance-icon.svg';
import DribbbleIcon from '../../assets/dribbble-icon.svg';

const Footer = () => {
    return (
        <footer className="relative bg-gray-100 p-4 md:p-6 overflow-hidden">
            {/* SVG Buildings Background */}
            {/* Content Container */}
            <div className="relative flex flex-col lg:flex-row z-10 px-4 sm:px-6 lg:px-8 py-8 md:py-18 w-full">
                {/* Main Footer Content */}
                <div className="w-full lg:max-w-[50%] mb-8 lg:mb-0">
                    {/* Logo and Company Info */}
                    <div className="flex flex-col items-start justify-between mt-18">
                        <div className='flex flex-col sm:flex-row items-start sm:items-end mb-4'>
                            <img
                                src={Logo}
                                alt="Rubén Alfonso Real Estate Group"
                                className="h-12 md:h-18 w-auto mb-2 sm:mb-4"
                            />
                            <img
                                src={LogoExp}
                                alt="Rubén Alfonso Real Estate Group"
                                className="h-6 md:h-8 w-auto sm:mx-4 mb-2 sm:mb-4"
                            />
                        </div>
                        
                        {/* Navigation Links - First in mobile */}
                        <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base mb-6 order-1 lg:order-2">
                            <a href="/" className="text-gray-700 hover:text-black transition-colors duration-300 font-medium">Home</a>
                            <a href="/about" className="text-gray-700 hover:text-black transition-colors duration-300 font-medium">About</a>
                            <a href="/services" className="text-gray-700 hover:text-black transition-colors duration-300 font-medium">Services</a>
                            <a href="/process" className="text-gray-700 hover:text-black transition-colors duration-300 font-medium">Process</a>
                            <a href="/portfolio" className="text-gray-700 hover:text-black transition-colors duration-300 font-medium">Portfolio</a>
                            <a href="/blog" className="text-gray-700 hover:text-black transition-colors duration-300 font-medium">Blog</a>
                        </div>
                        
                        <div className="flex flex-col items-start justify-around order-2 lg:order-1">
                            {/* Social Media Icons - Same order as navbar */}
                            <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
                                <a href="https://www.facebook.com/wwwrubenalfonsocom/?_rdr" target="_blank" rel="noopener noreferrer" className="group bg-black text-white p-2 md:p-3 rounded-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
                                    <img src={FacebookIcon} alt="Facebook" className="w-4 h-4 md:w-5 md:h-5 filter brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all duration-300" />
                                </a>
                                <a href="https://www.instagram.com/comprandoconespana/" target="_blank" rel="noopener noreferrer" className="group bg-black text-white p-2 md:p-3 rounded-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
                                    <img src={DribbbleIcon} alt="Dribbble" className="w-4 h-4 md:w-5 md:h-5 filter brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all duration-300" />
                                </a>
                                <a href="https://www.instagram.com/rubenalfonsorealtor" target="_blank" rel="noopener noreferrer" className="group bg-black text-white p-2 md:p-3 rounded-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
                                    <img src={InstagramIcon} alt="Instagram" className="w-4 h-4 md:w-5 md:h-5 filter brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all duration-300" />
                                </a>
                                <a href="https://www.linkedin.com/in/ruben-alfonso-7143334/" target="_blank" rel="noopener noreferrer" className="group bg-black text-white p-2 md:p-3 rounded-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
                                    <img src={LinkedInIcon} alt="Linkedin" className="w-4 h-4 md:w-5 md:h-5 filter brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all duration-300" />
                                </a>
                                <a href="https://www.behance.net/rubendario" target="_blank" rel="noopener noreferrer" className="group bg-black text-white p-2 md:p-3 rounded-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
                                    <img src={BehanceIcon} alt="Behance" className="w-4 h-4 md:w-5 md:h-5 filter brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all duration-300" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer Image - Last in mobile, full width */}
                <div className='w-full lg:max-w-[70%] flex lg:justify-end lg:relative lg:mx-12 mb-4 order-3'>
                    <img
                        src={FooterSvg}
                        alt="Footer decoration"
                        className="w-full lg:max-w-none lg:absolute lg:top-0 lg:right-0 lg:bottom-0 lg:h-[120%] lg:w-auto object-contain lg:scale-125"
                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;