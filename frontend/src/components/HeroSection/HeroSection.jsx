export const HeroSection = () => {
    const handleExploreProperties = () => {
        const propertiesSection = document.getElementById('properties-section');
        if (propertiesSection) {
            // Smooth scroll con easing personalizado
            const startPosition = window.pageYOffset;
            const targetPosition = propertiesSection.offsetTop - 80; // Offset para navbar
            const distance = targetPosition - startPosition;
            const duration = 1200; // Duración en ms
            let start = null;

            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            };

            const animation = (currentTime) => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const progress = Math.min(timeElapsed / duration, 1);
                const ease = easeInOutCubic(progress);
                
                window.scrollTo(0, startPosition + distance * ease);
                
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };

            requestAnimationFrame(animation);
        }
    };

    return (
        <section className="relative h-screen overflow-hidden">
            {/* Background Image */}
            <img 
                src="/images/Hero.png" 
                alt="Luxury apartment building with balconies"
                className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-black-800/60 to-transparent"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
                    <div className=" sm:max-w-[90%] md:max-w-[80%] lg:max-w-[45%]">
                        <h1 className="font-work-sans font-bold text-white leading-tight mb-8 sm:mb-8 md:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[90px] animate-heroFadeIn">
                            Encuentra tu propiedad perfecta en España
                        </h1>
                        
                        <p className="text-sm sm:text-base md:text-lg lg:text-[16px] text-white/90 leading-relaxed mb-6 sm:mb-8 max-w-full sm:max-w-2xl animate-heroSlideUp delay-200 mt-6">
                            Asesoro personalmente a compradores e inversores de Latinoamérica y España que quieren proteger su patrimonio comprando en el sur de la Florida o en España.
                        </p>
                        
                        <button 
                            onClick={handleExploreProperties}
                            className="cursor-pointer font-work-sans bg-[#0E0E0E] border-2 border-white text-white px-2 sm:px-6 md:px-6 py-2 sm:py-3 rounded-lg hover:bg-white hover:text-[#0E0E0E] transition-all duration-300 font-medium text-[16px] sm:text-base animate-heroSlideUp delay-400 hover-lift animate-buttonPulse"
                        >
                            Explorar Propiedades
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};