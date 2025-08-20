import Logo from '../../assets/footer-ruben.svg';
import LogoExp from '../../assets/footer-exp.svg';
import FooterSvg from '../../assets/footer.svg';

const Footer = () => {
    return (
        <footer className="relative p-4 md:p-6 overflow-hidden">
            {/* SVG Buildings Background */}
            {/* Content Container */}
            <div className="relative flex lg:flex-row z-10 px-4 sm:px-6 lg:px-8 py-8 md:py-18 w-full">
                {/* Main Footer Content */}
                <div className="w-full lg:max-w-[50%] mb-8 lg:mb-0">
                    {/* Logo and Company Info */}
                    <div className="">
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
                        <div className="pt-2 md:pt-4">
                            <div className="flex flex-col items-start">
                                <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
                                    <a href="#" className="bg-gray-900 text-white p-2 md:p-4 rounded-lg hover:bg-blue-600 transition-colors">
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="bg-gray-900 text-white p-2 md:p-4 rounded-lg hover:bg-blue-600 transition-colors">
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="bg-gray-900 text-white p-2 md:p-4 rounded-lg hover:bg-blue-600 transition-colors">
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.143 0 2.063.925 2.063 2.063 0 1.139-.92 2.065-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="bg-gray-900 text-white p-2 md:p-4 rounded-lg hover:bg-blue-600 transition-colors">
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full lg:max-w-[70%] flex lg:justify-end lg:relative lg:mx-12'>
                    <img
                        src={FooterSvg}
                        alt="Footer decoration"
                        className="w-full max-w-sm sm:max-w-md lg:max-w-none lg:absolute lg:top-0 lg:right-0 lg:bottom-0 lg:h-[120%] lg:w-auto object-contain lg:scale-125"
                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;