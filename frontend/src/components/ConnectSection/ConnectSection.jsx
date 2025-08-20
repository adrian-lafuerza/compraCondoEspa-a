import { useInstagram } from '../../context/InstagramContext';
import { useState, useEffect } from 'react';

const ConnectSection = () => {
  const { instagramPosts, loading, error, refetch } = useInstagram();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNavigation = (newIndex) => {
    setCurrentIndex(newIndex);
  };

  const getVisibleItems = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };

  const [visibleItems, setVisibleItems] = useState(getVisibleItems());

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            Conecta conmigo y descubre más<br className="hidden md:block" />
            <span className="md:hidden"> </span>contenido sobre el mercado<br className="hidden md:block" />
            <span className="md:hidden"> </span>inmobiliario
          </h2>
          <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-4">
            Publicamos oportunidades en tiempo real, consejos para compradores
            internacionales y casos de éxito.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              <p className="text-sm">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Reintentar conexión
              </button>
            </div>
          )}
        </div>
        {loading && (
          <div className="flex justify-center items-center py-12 md:py-16 lg:py-20">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600 text-sm md:text-base">Cargando contenido...</span>
          </div>
        )}
        {!loading && (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`
                }}
              >
                {instagramPosts.map((item, index) => (
                  <div 
                    key={item.id}
                    className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 md:px-3 lg:px-4"
                  >
                    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 transform">
                      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                        <iframe
                          src={item.embedUrl}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          allowTransparency="true"
                          allow="encrypted-media"
                          title={`Instagram post ${item.id}`}
                          className="w-full h-full"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {instagramPosts.length > visibleItems && (
              <div className="flex lg:justify-start md:justify-center mt-6 md:mt-8 space-x-3 md:space-x-4">
                <button
                   onClick={() => handleNavigation(Math.max(0, currentIndex - 1))}
                   disabled={currentIndex === 0}
                   className="cursor-pointer bg-[#0E0E0E] text-white px-4 md:px-6 py-3 md:py-4 rounded-full hover:-translate-y-1 hover:shadow-lg disabled:bg-white disabled:border disabled:border-[#0E0E0E] disabled:text-[#0E0E0E] disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300 text-xl md:text-2xl lg:text-3xl font-bold"
                 >
                   ←
                 </button>
                 <button
                   onClick={() => handleNavigation(Math.min(instagramPosts.length - visibleItems, currentIndex + 1))}
                   disabled={currentIndex >= instagramPosts.length - visibleItems}
                   className="cursor-pointer bg-[#0E0E0E] text-white px-4 md:px-6 py-3 md:py-4 rounded-full hover:-translate-y-1 hover:shadow-lg disabled:bg-white disabled:border disabled:border-[#0E0E0E] disabled:text-[#0E0E0E] disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300 text-xl md:text-2xl lg:text-3xl font-bold"
                 >
                   →
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ConnectSection;