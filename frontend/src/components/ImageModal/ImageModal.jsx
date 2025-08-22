import { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ImageModal = ({ isOpen, images, currentIndex = 0, onClose, onNext, onPrev }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen || !images?.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="cursor-pointer absolute top-4 right-4 z-20 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
      >
        <XMarkIcon className="h-6 w-6 text-black" />
      </button>
      
      {/* Contador */}
      <div className="absolute top-4 left-4 z-20 bg-white rounded px-3 py-1">
        <span className="text-black text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Contenedor principal de imagen */}
      <div className="absolute top-50 w-full max-w-4xl mx-auto px-4">
        {/* Imagen */}
        <div className="relative w-full h-[50vh] bg-gray-100 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
          )}
          
          <img
            key={currentIndex}
            src={images[currentIndex]?.url}
            alt={`Vista ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-500 hover:scale-105 animate-in fade-in slide-in-from-right-4 duration-300"
            style={{ display: isLoading ? 'none' : 'block' }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        {/* Botones de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="cursor-pointer absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <ChevronLeftIcon className="h-6 w-6 text-black" />
            </button>
            
            <button
              onClick={onNext}
              className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <ChevronRightIcon className="h-6 w-6 text-black" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageModal;