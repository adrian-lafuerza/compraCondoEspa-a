import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon, ShareIcon, MapPinIcon, HomeIcon, Square3Stack3DIcon, Square2StackIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useProperty } from '../../context/PropertyContext';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadPropertyById, currentProperty, loading, error } = useProperty();


  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: false,
    building: false,
    equipment: false
  });



  useEffect(() => {
    // Scroll al inicio
    window.scrollTo(0, 0);

    // Cargar propiedad por ID solo si:
    // 1. Hay un ID válido
    // 2. No está cargando actualmente
    // 3. No hay una propiedad actual o la propiedad actual no coincide con el ID
    if (id && !loading && (!currentProperty || 
        (currentProperty.propertyId !== id && 
         currentProperty.propertyId !== parseInt(id) &&
         currentProperty.id !== id &&
         currentProperty.id !== parseInt(id)))) {
      loadPropertyById(id);
    }
  }, [id, loading, loadPropertyById]); // Optimizado: solo dependencias esenciales

  const nextImage = useCallback(() => {
    if (currentProperty?.images) {
      setCurrentImageIndex((prev) =>
        prev === currentProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [currentProperty?.images]);

  const prevImage = useCallback(() => {
    if (currentProperty?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? currentProperty.images.length - 1 : prev - 1
      );
    }
  }, [currentProperty?.images]);

  const openModal = useCallback((index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar la propiedad</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => loadPropertyById(id)}
                className="cursor-pointer w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => navigate('/properties')}
                className="cursor-pointer w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver a propiedades
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProperty && !loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Propiedad no encontrada</h2>
            <p className="text-gray-600 mb-6">La propiedad que buscas no existe o ha sido eliminada.</p>
            <div className="space-y-3">
              <button
                onClick={() => loadPropertyById(id)}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar de nuevo
              </button>
              <button
                onClick={() => navigate('/properties')}
                className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver a propiedades
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const property = currentProperty;

  return (
    <div className="md:max-w-[65vw] mx-auto min-h-screen bg-gray-50 animate-fadeIn pb-4">
      {/* Header con navegación */}
      <div className="sticky top-0 z-10">
        <div className="max-w-7xl py-4">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer group flex items-center text-gray-600 hover:text-blue-600 transition-all duration-300 bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium">Volver atrás</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        {/* Galería de imágenes responsiva */}
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Imagen principal grande */}
            <div className="relative cursor-pointer overflow-hidden group bg-gray-200 max-h-[560px]" onClick={() => openModal(0)}>
              <img
                src={property?.images?.[0]?.url}
                alt={property?.images?.[0]?.label}
                className="w-full h-full max-h-[560px] object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Error loading main image
                  e.target.style.display = 'none';
                }}
                
              />
            </div>

            {/* Grid de imágenes pequeñas */}
            <div className="grid grid-cols-3 grid-rows-1 md:grid-rows-2 gap-2">
              {property?.images?.slice(1, 7).map((image, index) => {
                // En móvil solo mostrar 3 imágenes (slice 1,4), en desktop mostrar 6 (slice 1,7)
                if (index >= 3) {
                  return (
                    <div
                      key={image.imageId}
                      className="hidden md:block relative cursor-pointer overflow-hidden group bg-gray-200 max-h-[275px]"
                      onClick={() => openModal(index + 1)}
                    >
                      <img
                        src={image.url}
                        alt={image.label}
                        className="w-full h-full max-h-[275px] object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Error loading image
                          e.target.style.display = 'none';
                        }}
  
                      />
                      {index === 5 && property?.images?.length > 7 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold z-20">
                          +{property.images.length - 7} más
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={index + 1}
                    className="relative cursor-pointer overflow-hidden group bg-gray-200 max-h-[275px]"
                    onClick={() => openModal(index + 1)}
                  >
                    <img
                      src={image.url}
                      alt={image.label}
                      className="w-full h-full max-h-[275px] object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Error loading image
                        e.target.style.display = 'none';
                      }}

                    />
                    {index === 2 && property?.images?.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-sm md:text-xl font-bold md:hidden z-20">
                        +{property.images.length - 4} más
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>


      </div>
      {/* Card de información de la propiedad */}
      <div className="bg-white rounded-lg shadow-lg sm:p-6 lg:p-12 mb-4">
        {/* Layout principal de dos columnas desde el inicio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Columna izquierda - Contenido principal */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Piso en {property?.address?.town}</h1>
                <div className='flex flex-col sm:flex-row gap-2 sm:gap-4'>
                  <p className="text-lg sm:text-xl mb-2 sm:mb-4">{typeof property?.operation?.price === 'number' ? `${property?.operation?.price.toLocaleString()} €` : property?.operation?.price}</p>
                  <p className="text-lg sm:text-xl mb-2 sm:mb-4">{property?.reference}</p>
                  <div className='flex items-center'>
                    <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-2 sm:mb-4" />
                    <p className="text-lg sm:text-xl mb-2 sm:mb-4">{property?.features?.areaConstructed}m²</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-lg sm:text-xl">Calle de {property?.address?.streetName}</span>
                </div>
              </div>
            </div>

            {/* Características principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 lg:p-8 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Square2StackIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{property?.features?.areaConstructed}</p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase">m² construidos</p>
              </div>
              <div className="text-center">
                <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{property?.features?.rooms}</p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase">Habitaciones</p>
              </div>
              <div className="text-center">
                <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{property?.features?.rooms}</p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase">Habitaciones</p>
              </div>
              <div className="text-center">
                <Square3Stack3DIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{property?.features?.bathroomNumber}</p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase">Baños</p>
              </div>
            </div>

            {/* Descripción */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Descripcion</h2>

            {
              property?.descriptions?.length && property?.descriptions?.map((description, index) => {

                return (
                  <div key={index} className="mb-6 sm:mb-8">
                    <p className="text-gray-500 leading-relaxed text-base sm:text-lg">{description.text}</p>
                  </div>
                )
              })
            }

            {/* Secciones expandibles */}
            <div className="space-y-1">
              {/* Características básicas */}
              <div className="overflow-hidden">
                <button
                  className="cursor-pointer w-full py-4 text-left flex items-center justify-between bg-white transition-colors"
                  onClick={() => toggleSection('basic')}
                >
                  <span className="font-semibold text-lg sm:text-xl text-gray-900">Características básicas</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`expandable-content ${expandedSections.basic ? 'expanded' : ''} px-4 sm:px-6 bg-gray-50 border-t border-gray-200`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-8">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo</span>
                      <span className="text-gray-900 font-medium">Piso</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Superficie construida</span>
                      <span className="text-gray-900 font-medium">{property?.features?.areaConstructed} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificación energética</span>
                      <span className="text-gray-900 font-medium">{property?.features?.energyCertificateRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado</span>
                      <span className="text-gray-900 font-medium">{property?.features?.conservation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edificio */}
              <div className="overflow-hidden">
                <button
                  className="cursor-pointer w-full py-4 text-left flex items-center justify-between bg-white transition-colors"
                  onClick={() => toggleSection('building')}
                >
                  <span className="font-semibold text-lg sm:text-xl text-gray-900">Edificio</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.building ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`expandable-content ${expandedSections.building ? 'expanded' : ''} px-4 sm:px-6 bg-gray-50 border-t border-gray-200`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-8">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planta</span>
                      <span className="text-gray-900 font-medium">2ª</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ascensor</span>
                      <span className="text-gray-900 font-medium">Sí</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gastos de comunidad</span>
                      <span className="text-gray-900 font-medium">178€/mes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado de ocupación</span>
                      <span className="text-gray-900 font-medium">Libre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo de ventanas</span>
                      <span className="text-gray-900 font-medium">Interior</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ático</span>
                      <span className="text-gray-900 font-medium">No</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dúplex</span>
                      <span className="text-gray-900 font-medium">No</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipamiento */}
              <div className="overflow-hidden">
                <button
                  className="cursor-pointer w-full py-4 text-left flex items-center justify-between bg-white transition-colors"
                  onClick={() => toggleSection('equipment')}
                >
                  <span className="font-semibold text-lg sm:text-xl text-gray-900">Equipamiento</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSections.equipment ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`expandable-content ${expandedSections.equipment ? 'expanded' : ''} px-4 sm:px-6 bg-gray-50 border-t border-gray-200`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-8">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aire acondicionado</span>
                      <span className="text-gray-900 font-medium">Sí</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calefacción</span>
                      <span className="text-gray-900 font-medium">Central</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cocina</span>
                      <span className="text-gray-900 font-medium">Equipada</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Armarios</span>
                      <span className="text-gray-900 font-medium">Empotrados</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Suelos</span>
                      <span className="text-gray-900 font-medium">Parquet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ventanas</span>
                      <span className="text-gray-900 font-medium">Aluminio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de WhatsApp - Arriba de la card */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="bg-[#0E0E0E] rounded-full p-3 sm:p-4 mb-4 sm:mb-6">
              <button className="cursor-pointer w-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
                Hablemos ahora por WhatsApp
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </button>
            </div>

            {/* Formulario y botones de compartir - Card de contacto */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 h-full flex flex-col lg:sticky lg:top-4 z-50">
              {/* Formulario de contacto */}
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">¿QUIERES SABER MÁS?</h3>
                <form className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      placeholder="Tu nombre..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="Tu teléfono..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                    <textarea
                      rows="4"
                      placeholder="Tu mensaje, indica por favor la calle de la propiedad que quieras consultar..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    ></textarea>
                  </div>
                  <button
                    className="cursor-pointer font-work-sans bg-white border-2 border-[#0E0E0E] text-[#0E0E0E] px-4 sm:px-6 md:px-8 py-2 sm:py-3 hover:bg-[#0E0E0E] hover:text-white transition-all duration-300 font-medium text-sm sm:text-base"
                  >
                    Contactar
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modal de galería de imágenes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center animate-fadeIn">
          <div className="relative w-full h-full max-w-7xl p-4 flex flex-col">
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              className="cursor-pointer absolute top-4 right-4 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 backdrop-blur-sm rounded-full p-3 transition-all duration-300 border border-white border-opacity-20"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>

            {/* Imagen del modal */}
            <div className="relative flex-1 flex items-center justify-center">
              <div className="relative max-w-full max-h-full">
                <img
                  key={currentImageIndex} // Key para forzar re-render y animación
                  src={currentProperty?.images?.[currentImageIndex]?.url}
                  alt={`Vista ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[85vh] object-contain mx-auto transition-all duration-500 ease-in-out transform animate-fadeInScale"
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))'
                  }}
                />

                {/* Navegación del modal - Solo mostrar si hay más de una imagen */}
                {currentProperty?.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 backdrop-blur-sm rounded-full p-4 transition-all duration-300 border border-white border-opacity-20 hover:scale-110"
                    >
                      <ChevronLeftIcon className="h-8 w-8 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 backdrop-blur-sm rounded-full p-4 transition-all duration-300 border border-white border-opacity-20 hover:scale-110"
                    >
                      <ChevronRightIcon className="h-8 w-8 text-white" />
                    </button>
                  </>
                )}

                {/* Indicador de imagen del modal */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white border-opacity-20">
                  <span className="text-sm font-medium">
                    {currentImageIndex + 1} / {currentProperty?.images?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Miniaturas en el modal - Solo mostrar si hay más de una imagen */}
            {currentProperty?.images?.length > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-3 overflow-x-auto max-w-full px-4 py-2">
                  {currentProperty?.images?.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${index === currentImageIndex
                        ? 'border-white shadow-lg shadow-white/25'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image?.url}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;