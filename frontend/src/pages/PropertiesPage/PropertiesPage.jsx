import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProperty } from '../../context/PropertyContext';
import PropertiesHeroSection from './components/PropertiesHeroSection';
import FilterSidebar from './components/FilterSidebar';
import PropertyCard from './components/PropertyCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    properties,
    loading,
    error,
    loadProperties,
    searchByLocation,
    searchByZone,
    filters,
    updateFilters,
    hasAttemptedLoad
  } = useProperty();
  const [title, setTitle] = useState('')
  const [lastSearchParams, setLastSearchParams] = useState('')
  const functionsRef = useRef({ searchByLocation, searchByZone, loadProperties })
  
  // Actualizar las funciones en el ref cuando cambien
  useEffect(() => {
    functionsRef.current = { searchByLocation, searchByZone, loadProperties };
  }, [searchByLocation, searchByZone, loadProperties]);

  // Estado local para filtros de la UI
  const [localFilters, setLocalFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    rooms: '',
    bathrooms: '',
    sortByPrice: ''
  });

  // Función para manejar cambios en filtros
  const handleFilterChange = useCallback((filterName, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Estado para las propiedades filtradas
  const [filteredProperties, setFilteredProperties] = useState(properties || []);

  // Debounced filters para evitar llamadas API frecuentes
  const [debouncedFilters, setDebouncedFilters] = useState(localFilters);

  // useEffect para debouncing de filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(localFilters);
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [localFilters]);

  // Función para filtrar propiedades localmente
  const filterPropertiesLocally = useCallback((propertiesToFilter, filters) => {
    if (!propertiesToFilter || propertiesToFilter.length === 0) {
      return [];
    }
    
    const filtered = propertiesToFilter.filter(property => {
      
      // Filtro por localidad
      if (filters.location && filters.location !== '') {
        const propertyLocation = property.location?.toLowerCase() || '';
        const propertyZone = property.zone?.toLowerCase() || '';
        const propertyAddress = property.address?.streetName?.toLowerCase() || '';
        
        const searchLocation = filters.location.toLowerCase();
        
        // Mapear localidades según la fuente de datos
        let locationMatch = false;
        
        if (searchLocation === 'costa-blanca') {
          locationMatch = propertyZone.includes('costa-blanca') || propertyZone.includes('costa blanca') || 
                         propertyLocation.includes('alicante') || propertyLocation.includes('valencia') ||
                         propertyAddress.includes('alicante') || propertyAddress.includes('valencia');
        } else if (searchLocation === 'costa-del-sol') {
          locationMatch = propertyZone.includes('costa-del-sol') || propertyZone.includes('costa del sol') ||
                         propertyLocation.includes('málaga') || propertyLocation.includes('malaga') ||
                         propertyAddress.includes('málaga') || propertyAddress.includes('malaga');
        } else if (searchLocation === 'madrid') {
          locationMatch = propertyLocation.includes('madrid') || propertyAddress.includes('madrid');
        }
        
        if (!locationMatch) {
          return false;
        }
      }
      
      // Filtro por precio mínimo
      if (filters.minPrice && filters.minPrice !== '') {
        const minPrice = parseFloat(filters.minPrice);
        if (!isNaN(minPrice) && property.operation.price < minPrice) {
          return false;
        }
      }
      
      // Filtro por precio máximo
      if (filters.maxPrice && filters.maxPrice !== '') {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice) && property.operation.price > maxPrice) {
          return false;
        }
      }
      
      // Filtro por tamaño mínimo
      if (filters.minSize && filters.minSize !== '') {
        const minSize = parseFloat(filters.minSize);
        if (!isNaN(minSize) && property.features.areaConstructed < minSize) {
          return false;
        }
      }
      
      // Filtro por tamaño máximo
      if (filters.maxSize && filters.maxSize !== '') {
        const maxSize = parseFloat(filters.maxSize);
        if (!isNaN(maxSize) && property.features.areaConstructed > maxSize) {
          return false;
        }
      }
      
      // Filtro por número de habitaciones
      if (filters.rooms && filters.rooms !== '' && property.features.rooms !== parseInt(filters.rooms)) {
        return false;
      }
      
      // Filtro por número de baños
      if (filters.bathrooms && filters.bathrooms !== '' && property.features.bathroomNumber !== parseInt(filters.bathrooms)) {
        return false;
      }
      
      return true;
    });
    
    // Aplicar ordenamiento por precio si está seleccionado
    if (filters.sortByPrice) {
      if (filters.sortByPrice === 'highest') {
        filtered.sort((a, b) => b.operation.price - a.operation.price);
      } else if (filters.sortByPrice === 'lowest') {
        filtered.sort((a, b) => a.operation.price - b.operation.price);
      }
    }
    
    return filtered;
  }, []);



  // useEffect para aplicar filtros localmente cuando cambien los filtros o las propiedades
  useEffect(() => {
    // Asegurar que tenemos propiedades para filtrar
    if (!properties || properties.length === 0) {
      setFilteredProperties([]);
      return;
    }
    
    const hasFilters = Object.values(debouncedFilters).some(value => value !== '' && value !== null && value !== undefined);
    
    if (hasFilters) {
      const filtered = filterPropertiesLocally(properties, debouncedFilters);
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [debouncedFilters, properties]); // Ejecutar cuando cambien los filtros con debounce o las propiedades

  useEffect(() => {
    // Scroll automático al top cuando se accede a la página
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cargar propiedades basado en parámetros de URL
    const locationParam = searchParams.get('location');
    const zoneParam = searchParams.get('zone');
    
    console.log('PropertiesPage: locationParam =', locationParam);
    console.log('PropertiesPage: zoneParam =', zoneParam);
    
    // Crear una clave única para los parámetros actuales
    const currentParamsKey = `${locationParam || ''}-${zoneParam || ''}`;
    
    console.log('PropertiesPage useEffect: Parámetros actuales:', currentParamsKey);
    console.log('PropertiesPage useEffect: Últimos parámetros:', lastSearchParams);
    
    // Solo evitar ejecución si es exactamente la misma carga inicial Y no hay cambio de tipo de parámetro
    const hasLocationParam = !!locationParam;
    const hasZoneParam = !!zoneParam;
    const lastHadLocation = lastSearchParams.includes('-') ? lastSearchParams.split('-')[0] !== '' : false;
    const lastHadZone = lastSearchParams.includes('-') ? lastSearchParams.split('-')[1] !== '' : false;
    
    // Permitir ejecución si:
    // 1. Los parámetros han cambiado
    // 2. Hay cambio de tipo (de zone a location o viceversa)
    // 3. Es la primera carga
    const shouldExecute = lastSearchParams !== currentParamsKey || 
                         hasLocationParam !== lastHadLocation || 
                         hasZoneParam !== lastHadZone || 
                         lastSearchParams === '';
    
    if (!shouldExecute) {
      console.log('PropertiesPage useEffect: Parámetros no han cambiado, saltando');
      return;
    }
    
    // Actualizar los últimos parámetros de búsqueda
    console.log('PropertiesPage useEffect: Ejecutando carga de propiedades...');
    setLastSearchParams(currentParamsKey);

    if (locationParam) {
      // Verificar si el parámetro location es realmente una zona
      const zoneValues = ['costa-blanca', 'costa-del-sol', 'barcelona', 'inversion', 'preconstruccion'];
      
      if (zoneValues.includes(locationParam)) {
        // Es una zona, usar searchByZone
        console.log('PropertiesPage useEffect: Loading location as zone', locationParam);
        console.log('PropertiesPage: functionsRef.current =', functionsRef.current);
        console.log('PropertiesPage: searchByZone function =', functionsRef.current.searchByZone);
        functionsRef.current.searchByZone(locationParam);
        
        const zoneMapping = {
          'barcelona': 'Barcelona',
          'costa-del-sol': 'Costa del Sol',
          'costa-blanca': 'Costa Blanca',
          'inversion': 'Inversión',
          'preconstruccion': 'Preconstrucción'
        };
        setTitle(zoneMapping[locationParam] || locationParam);
      } else {
        // Es una ubicación real, usar searchByLocation
        console.log('PropertiesPage useEffect: Loading location', locationParam);
        console.log('PropertiesPage: functionsRef.current =', functionsRef.current);
        console.log('PropertiesPage: searchByLocation function =', functionsRef.current.searchByLocation);
        functionsRef.current.searchByLocation(locationParam);
        // Mapear títulos para ubicaciones específicas
        const locationMapping = {
          'madrid': 'Madrid'
        };
        setTitle(locationMapping[locationParam] || locationParam.charAt(0).toUpperCase() + locationParam.slice(1));
      }
    } else if (zoneParam) {
      // Si hay un parámetro de zona en la URL, buscar por esa zona
      console.log('PropertiesPage useEffect: Loading zone', zoneParam);
      console.log('PropertiesPage: functionsRef.current =', functionsRef.current);
      console.log('PropertiesPage: searchByZone function =', functionsRef.current.searchByZone);
      functionsRef.current.searchByZone(zoneParam);
      const zoneMapping = {
        'barcelona': 'Barcelona',
        'costa-del-sol': 'Costa del Sol',
        'costa-blanca': 'Costa Blanca',
        'inversion': 'Inversión',
        'preconstruccion': 'Preconstrucción'
      };

      const propertyZone = zoneMapping[zoneParam];
      setTitle(propertyZone)
    } else if (properties.length === 0 && !hasAttemptedLoad) {
      // Si no hay parámetros, no hay propiedades cargadas y no se ha intentado cargar
      console.log('PropertiesPage useEffect: Loading all properties');
      functionsRef.current.loadProperties();
      setTitle('Todas las Propiedades');
    } else if (!locationParam && !zoneParam) {
      // Si no hay parámetros de URL, establecer título por defecto
      setTitle('Todas las Propiedades');
    }
    

  }, [searchParams]); // Solo depende de searchParams para detectar cambios de URL

  // Función para limpiar filtros
  const handleClearFilters = useCallback(() => {
    setLocalFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: '',
      rooms: '',
      bathrooms: '',
      sortByPrice: ''
    });
    // Los filtros se limpiarán automáticamente por el useEffect
    // que mostrará todas las propiedades cuando no hay filtros
  }, []);

  // Función para recargar propiedades respetando el contexto actual
  const handleReloadProperties = useCallback(() => {
    const locationParam = searchParams.get('location');
    const zoneParam = searchParams.get('zone');

    if (locationParam) {
      const zoneValues = ['costa-blanca', 'costa-del-sol', 'barcelona', 'inversion', 'preconstruccion'];
      if (zoneValues.includes(locationParam)) {
        searchByZone(locationParam);
      } else {
        searchByLocation(locationParam);
      }
    } else if (zoneParam) {
      searchByZone(zoneParam);
    } else {
      loadProperties();
    }
  }, [searchParams, searchByLocation, searchByZone, loadProperties]);
  

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <PropertiesHeroSection title={title} />

      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Sección de propiedades con filtros */}
      <div className="bg-gray-50 min-h-[40vh] animate-slideUp">
        <div className="xl:max-w-[80%] lg:max-w-[90%] md:max-w-[100%] sm:max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Sidebar de filtros */}
            <div className="w-full lg:w-[25%] lg:flex-shrink-0 order-1">
              <FilterSidebar
                localFilters={localFilters}
                handleFilterChange={handleFilterChange}
                handleClearFilters={handleClearFilters}
                setLocalFilters={setLocalFilters}
              />
            </div>

            {/* Área principal de propiedades */}
            <div className="flex-1 animate-slideInRight order-2">
              <div className="mb-4 lg:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 animate-fadeInUp text-center lg:text-left">
                  {filteredProperties?.length > 0 ? filteredProperties?.length : 0} Resultados encontrados
                </h2>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8 lg:py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {error && (
                <div className="text-center py-8 lg:py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-base lg:text-lg font-semibold text-red-800 mb-2">Error al cargar propiedades</h3>
                    <button
                      onClick={handleReloadProperties}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && (
                <div className="space-y-4 lg:space-y-6">
                  {(() => {
                    console.log('Rendering properties. Filtered:', filteredProperties.length, 'Total:', properties.length);
                    console.log('Loading:', loading, 'Error:', error);
                    return null;
                  })()}
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property, index) => (
                      <PropertyCard key={property.propertyId} property={property} index={index} />
                    ))
                  ) : (
                    <div className="text-center py-8 lg:py-12">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 lg:p-6 max-w-md mx-auto">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-2">No se encontraron propiedades</h3>
                        <p className="text-gray-600 text-sm mb-4">No hay propiedades disponibles con los filtros actuales.</p>
                        <button
                          onClick={handleReloadProperties}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Recargar propiedades
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;