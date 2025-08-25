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
                    <div className="w-full flex flex-col justify-center min-h-[60vh]">
                        <h1 
                            className="font-work-sans font-bold text-white leading-tight mb-6 sm:mb-8 animate-heroFadeIn"
                            style={{
                                fontSize: 'clamp(2.5rem, 8vw, 6rem)'
                            }}
                        >
                            <div>Encuentra tu</div>
                            <div>propiedad perfecta</div>
                            <div>en España</div>
                        </h1>
                        
                        <div 
                            className="text-white/90 leading-relaxed mb-6 sm:mb-8 animate-heroSlideUp delay-200"
                            style={{
                                fontSize: 'clamp(0.875rem, 2.2vw, 1.125rem)',
                                maxWidth: 'clamp(300px, 85vw, 600px)'
                            }}
                        >
                            <div className="block">Asesoro personalmente a compradores e inversores de Latinoamérica y</div>
                            <div className="block">España que quieren proteger su patrimonio comprando en el sur de la</div>
                            <div className="block">Florida o en España.</div>
                        </div>
                        
                        <button 
                            onClick={handleExploreProperties}
                            className="cursor-pointer font-work-sans bg-[#0E0E0E] border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#0E0E0E] transition-all duration-300 font-medium animate-heroSlideUp delay-400 hover-lift animate-buttonPulse w-fit whitespace-nowrap"
                            style={{
                                fontSize: 'clamp(0.875rem, 1.8vw, 1rem)',
                                padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)'
                            }}
                        >
                            Explorar Propiedades
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};