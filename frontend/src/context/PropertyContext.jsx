import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { propertyService } from '../services/propertyService';

const PropertyContext = createContext();

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty debe ser usado dentro de PropertyProvider');
  }
  return context;
};

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [attemptedPropertyIds, setAttemptedPropertyIds] = useState(new Set());
  const [filters, setFilters] = useState({
    location: '',
    operation: 'sale',
    propertyType: 'homes',
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    rooms: '',
    bathrooms: ''
  });

  /**
   * Cargar propiedades desde la API
   * @param {Object} searchFilters - Filtros de búsqueda
   */
  const loadProperties = useCallback(async (searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);

      // Combinar filtros actuales con los nuevos
      const finalFilters = { ...filters, ...searchFilters };

      // Obtener propiedades desde la API
      const response = await propertyService.getProperties(finalFilters);

      console.log(response);


      if (response && response) {
        // Transformar propiedades si es necesario
        setProperties(response);
        setError(null); // Limpiar errores previos en caso de éxito
      } else {
        throw new Error(response.message || 'Error al cargar propiedades');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      const errorMessage = err.message.includes('Error 500')
        ? 'Error del servidor: No se pudieron cargar las propiedades. Por favor, inténtalo más tarde.'
        : err.message;
      setError(errorMessage);
      setProperties([]); // Limpiar propiedades en caso de error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Cargar una propiedad específica por ID
   * @param {string|number} id - ID de la propiedad (propertyId)
   */
  const loadPropertyById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentProperty(null);

      console.log('🔍 Buscando propiedad con ID:', id);

      // Primero buscar en las propiedades ya cargadas
      const existingProperty = properties.find(property =>
        property.propertyId === id ||
        property.propertyId === parseInt(id) ||
        property.id === id ||
        property.id === parseInt(id)
      );

      if (existingProperty) {
        console.log('🎯 Propiedad encontrada en propiedades cargadas:', existingProperty.propertyId);
        setCurrentProperty(existingProperty);
        setError(null);
        return existingProperty;
      }

      // Verificar si ya se intentó cargar esta propiedad específica
      const normalizedId = String(id);
      if (attemptedPropertyIds.has(normalizedId)) {
        console.log('⚠️ Propiedad ya intentada anteriormente:', id);
        throw new Error(`Propiedad con ID ${id} no encontrada`);
      }

      // Marcar como intentada antes de cargar
      setAttemptedPropertyIds(prev => new Set([...prev, normalizedId]));

      // Si no está en las propiedades cargadas y no se ha intentado antes, cargar todas las propiedades
      console.log('🔍 Propiedad no encontrada en cache, cargando todas las propiedades...');
      const response = await propertyService.getProperties();
    
      if (response) {
        const transformedProperties = response.map(prop =>
          propertyService.transformProperty(prop)
        );

        // Actualizar el estado
        setProperties(transformedProperties);

        // Buscar en las propiedades recién cargadas
        const foundProperty = transformedProperties.find(property =>
          property.propertyId === id ||
          property.propertyId === parseInt(id) ||
          property.id === id ||
          property.id === parseInt(id)
        );

        if (foundProperty) {
          console.log('✅ Propiedad encontrada después de cargar:', foundProperty.propertyId);
          setCurrentProperty(foundProperty);
          setError(null);
          return foundProperty;
        }
      }

      // if (response.success && response.data && response.data.properties) {
      //   // Transformar propiedades
      //   const transformedProperties = response.data.properties.map(prop =>
      //     propertyService.transformProperty(prop)
      //   );

      //   // Actualizar el estado
      //   setProperties(transformedProperties);

      //   // Buscar en las propiedades recién cargadas
      //   const foundProperty = transformedProperties.find(property =>
      //     property.propertyId === id ||
      //     property.propertyId === parseInt(id) ||
      //     property.id === id ||
      //     property.id === parseInt(id)
      //   );

      //   if (foundProperty) {
      //     console.log('✅ Propiedad encontrada después de cargar:', foundProperty.propertyId);
      //     setCurrentProperty(foundProperty);
      //     setError(null);
      //     return foundProperty;
      //   }
      // }

      throw new Error(`Propiedad con ID ${id} no encontrada`);
    } catch (err) {
      console.error('Error loading property:', err);
      const errorMessage = err.message.includes('Error 500')
        ? `Error del servidor: No se pudo cargar la propiedad. ${err.message}`
        : err.message;
      setError(errorMessage);
      setCurrentProperty(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [properties, attemptedPropertyIds]);

  /**
   * Buscar propiedades por ubicación
   * @param {string} location - Ubicación a buscar
   */
  const searchByLocation = useCallback(async (location) => {
    try {
      console.log('PropertyContext: searchByLocation called with:', location);
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);
      
      // No limpiar propiedades anteriores hasta que lleguen las nuevas
      // setProperties([]);

      // Si la ubicación es Madrid, usar Idealista
      if (location && location.toLowerCase() === 'madrid') {
        console.log('PropertyContext: Searching Madrid properties using Idealista');
        const response = await propertyService.getPropertiesByMadrid();
        console.log('PropertyContext: Madrid API response:', response);
        
        if (response && response.success && response.data && response.data.properties) {
          console.log('PropertyContext: Setting Madrid properties:', response.data.properties.length);
          setProperties(response.data.properties);
          setError(null);
        } else {
          console.error('PropertyContext: Invalid Madrid response:', response);
          throw new Error(response.message || 'Error al cargar propiedades de Madrid');
        }
      } else {
        // Para otras ubicaciones, usar el método tradicional con filtros
        console.log('PropertyContext: Searching other location with filters');
        const searchFilters = { ...filters, location };
        setFilters(searchFilters);
        await loadProperties(searchFilters);
      }
    } catch (err) {
      console.error('Error searching properties by location:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters, loadProperties]);

  /**
   * Buscar propiedades por zona desde Contentful
   * @param {string} zone - Zona específica (ej: 'costa-del-sol', 'costa-blanca', 'barcelona')
   */
  const searchByZone = useCallback(async (zone) => {
    try {
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);

      const response = await propertyService.getPropertiesByZone(zone);

      // La respuesta viene como { success: true, data: { properties: [...] } }
      if (response && response.success && response.data && response.data.properties && Array.isArray(response.data.properties)) {
        setProperties(response.data.properties);
        setError(null);
      } else {
        throw new Error(response.message || 'Formato de respuesta inválido del servidor');
      }
    } catch (err) {
      console.error('Error searching properties by zone:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar propiedades por newProperty (Inversión/Preconstrucción) y opcionalmente por localidad
   * @param {string} newProperty - Tipo de nueva propiedad ('inversion' o 'preconstruccion')
   * @param {string} location - Localidad específica (opcional)
   */
  const searchByNewProperty = useCallback(async (newProperty, location = null) => {
    try {
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);

      console.log('PropertyContext: Searching by newProperty:', newProperty, 'and location:', location);
      const response = await propertyService.getPropertiesByNewPropertyAndLocation(newProperty, location);
      console.log('PropertyContext: Properties found:', response);

      // La respuesta viene como { success: true, data: { properties: [...] } }
      if (response && response.success && response.data && response.data.properties && Array.isArray(response.data.properties)) {
        setProperties(response.data.properties);
        setError(null);
      } else {
        throw new Error(response.message || 'Formato de respuesta inválido del servidor');
      }
    } catch (err) {
      console.error('PropertyContext: Error searching by newProperty:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar filtros de búsqueda
   * @param {Object} newFilters - Nuevos filtros
   */
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    return updatedFilters;
  }, [filters]);

  /**
   * Aplicar filtros y recargar propiedades
   * @param {Object} newFilters - Filtros a aplicar
   */
  const applyFilters = useCallback(async (newFilters = {}) => {
    const updatedFilters = updateFilters(newFilters);
    setHasAttemptedLoad(false); // Reset para permitir nueva carga con filtros
    await loadProperties(updatedFilters);
  }, [updateFilters, loadProperties]);

  /**
   * Limpiar filtros y recargar
   */
  const clearFilters = useCallback(async () => {
    const defaultFilters = {
      location: '',
      operation: 'sale',
      propertyType: 'homes',
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: '',
      rooms: '',
      bathrooms: ''
    };
    setFilters(defaultFilters);
    setHasAttemptedLoad(false); // Reset para permitir nueva carga
    await loadProperties(defaultFilters);
  }, [loadProperties]);

  // Nota: El manejo de parámetros de URL se realiza en PropertiesPage para evitar consultas duplicadas

  const value = useMemo(() => ({
    // Estado
    properties,
    loading,
    error,
    currentProperty,
    filters,
    hasAttemptedLoad,

    // Acciones
    loadProperties,
    loadPropertyById,
    searchByLocation,
    searchByZone,
    searchByNewProperty,
    updateFilters,
    applyFilters,
    clearFilters,
    setCurrentProperty,
  }), [
    properties,
    loading,
    error,
    currentProperty,
    filters,
    hasAttemptedLoad,
    loadProperties,
    loadPropertyById,
    searchByLocation,
    searchByZone,
    searchByNewProperty,
    updateFilters,
    applyFilters,
    clearFilters
  ]);

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export default PropertyProvider;