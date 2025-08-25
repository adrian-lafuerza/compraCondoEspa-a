import { useInstagram } from '../../context/InstagramContext';
import { useState, useEffect, useRef, useCallback } from 'react';

const ConnectSection = () => {
  const { instagramPosts, loading, error, refetch } = useInstagram();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef(null);
  const startPosRef = useRef(0);
  const currentTranslateRef = useRef(0);

  const getVisibleItems = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };

  const [visibleItems, setVisibleItems] = useState(getVisibleItems());

  const handleNavigation = useCallback((newIndex) => {
    const maxIndex = Math.max(0, instagramPosts.length - 1);
    const clampedIndex = Math.max(0, Math.min(maxIndex, newIndex));
    setCurrentIndex(clampedIndex);
    currentTranslateRef.current = -clampedIndex * (100 / visibleItems);
  }, [instagramPosts.length, visibleItems]);

  // Drag functionality
  const handleDragStart = useCallback((clientX) => {
    setIsDragging(true);
    setDragStart(clientX);
    startPosRef.current = currentTranslateRef.current;
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'none';
    }
  }, []);

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging) return;
    
    const diff = clientX - dragStart;
    const containerWidth = carouselRef.current?.offsetWidth || 1;
    const dragPercentage = (diff / containerWidth) * 100;
    
    setDragOffset(dragPercentage);
    
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(${startPosRef.current + dragPercentage}%)`;
    }
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'transform 0.3s ease-out';
    }
    
    // Determine if we should move to next/previous slide
    const threshold = 50; // pixels
    const containerWidth = carouselRef.current?.offsetWidth || 1;
    const dragDistance = Math.abs(dragOffset * containerWidth / 100);
    
    if (dragDistance > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        // Dragged right, go to previous
        handleNavigation(currentIndex - 1);
      } else if (dragOffset < 0 && currentIndex < instagramPosts.length - 1) {
        // Dragged left, go to next
        handleNavigation(currentIndex + 1);
      } else {
        // Snap back to current position
        if (carouselRef.current) {
          carouselRef.current.style.transform = `translateX(${currentTranslateRef.current}%)`;
        }
      }
    } else {
      // Snap back to current position
      if (carouselRef.current) {
        carouselRef.current.style.transform = `translateX(${currentTranslateRef.current}%)`;
      }
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, currentIndex, instagramPosts.length, handleNavigation]);

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Global mouse events for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Update transform when currentIndex changes
  useEffect(() => {
    if (!isDragging && carouselRef.current) {
      currentTranslateRef.current = -currentIndex * (100 / visibleItems);
      carouselRef.current.style.transform = `translateX(${currentTranslateRef.current}%)`;
    }
  }, [currentIndex, visibleItems, isDragging]);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="font-poppins text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-8 md:mb-8 tracking-wide lg:leading-[60px] sm:leading-[30px]">
            Conecta conmigo y descubre más<br className="hidden md:block" />
            <span className="md:hidden font-poppins"> </span>contenido sobre el mercado<br className="hidden md:block" />
            <span className="md:hidden font-poppins"> </span>inmobiliario
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
            <div className="overflow-hidden px-4 md:px-6 lg:px-8">
              <div
                ref={carouselRef}
                className={`flex transition-transform duration-500 ease-in-out ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} py-10`}
                style={{
                  transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onDragStart={(e) => e.preventDefault()}
              >
                {instagramPosts.map((item, index) => (
                  <div
                    key={item.id}
                    className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 md:px-3 lg:px-4"
                  >
                    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 transform select-none">
                      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                        <iframe
                          src={item.embedUrl}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          allowtransparency="true"
                          allow="encrypted-media"
                          title={`Instagram post ${item.id}`}
                          className="w-full h-full pointer-events-none"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {instagramPosts.length > 1 && (
              <div className="flex lg:justify-start md:justify-center space-x-3 md:space-x-4">
                <button
                  onClick={() => handleNavigation(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="cursor-pointer group hover:-translate-y-1 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
                >
                  <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-16 lg:h-16">
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 66 66"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full transition-all duration-300"
                    >
                      <circle
                        cx="33"
                        cy="33"
                        r="32.5"
                        fill="transparent"
                        stroke="black"
                        className="group-hover:fill-black disabled:group-hover:fill-transparent"
                      />
                      <path
                        d="M22.2929 33.7071C21.9024 33.3166 21.9024 32.6834 22.2929 32.2929L28.6569 25.9289C29.0474 25.5384 29.6805 25.5384 30.0711 25.9289C30.4616 26.3195 30.4616 26.9526 30.0711 27.3431L24.4142 33L30.0711 38.6569C30.4616 39.0474 30.4616 39.6805 30.0711 40.0711C29.6805 40.4616 29.0474 40.4616 28.6569 40.0711L22.2929 33.7071ZM43 33V34H23V33V32H43V33Z"
                        fill="black"
                        className="group-hover:fill-white disabled:group-hover:fill-black"
                      />
                    </svg>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigation(currentIndex + 1)}
                  disabled={currentIndex >= instagramPosts.length - 1}
                  className="cursor-pointer group hover:-translate-y-1 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
                >
                  <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-16 lg:h-16">
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 66 66"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full transition-all duration-300"
                    >
                      <circle
                        cx="33"
                        cy="33"
                        r="32.5"
                        fill="transparent"
                        stroke="black"
                        className="group-hover:fill-black disabled:group-hover:fill-transparent"
                      />
                      <path
                        d="M42.7071 33.7071C43.0976 33.3166 43.0976 32.6834 42.7071 32.2929L36.3431 25.9289C35.9526 25.5384 35.3195 25.5384 34.9289 25.9289C34.5384 26.3195 34.5384 26.9526 34.9289 27.3431L40.5858 33L34.9289 38.6569C34.5384 39.0474 34.5384 39.6805 34.9289 40.0711C35.3195 40.4616 35.9526 40.4616 36.3431 40.0711L42.7071 33.7071ZM23 33V34H42V33V32H23V33Z"
                        fill="black"
                        className="group-hover:fill-white disabled:group-hover:fill-black"
                      />
                    </svg>
                  </div>
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