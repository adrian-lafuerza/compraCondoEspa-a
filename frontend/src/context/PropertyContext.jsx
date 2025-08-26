import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  const activeRequestRef = useRef(null);
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
   * Cargar propiedades con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda
   */
  const loadProperties = useCallback(async (filters = {}) => {
    const requestKey = `loadProperties_${JSON.stringify(filters)}`;
    
    // Prevenir llamadas duplicadas
    if (activeRequestRef.current === requestKey || loading) {
      return;
    }
    
    try {
      activeRequestRef.current = requestKey;
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);

      const response = await propertyService.getProperties(filters);

      // La respuesta viene como { success: true, data: { properties: [...] } }
      if (response && response.success && response.data && response.data.properties && Array.isArray(response.data.properties)) {
        setProperties(response.data.properties);
        setError(null);
      } else {
        throw new Error(response.message || 'Formato de respuesta inválido del servidor');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
      activeRequestRef.current = null;
    }
  }, []);

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
    const requestKey = `searchByLocation_${location}`;
    
    // Prevenir llamadas duplicadas
    if (activeRequestRef.current === requestKey || loading) {
      return;
    }
    
    try {
      activeRequestRef.current = requestKey;
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);

      // Si la ubicación es Madrid, usar Idealista
      if (location && location.toLowerCase() === 'madrid') {
        const response = await propertyService.getPropertiesByMadrid();
        
        if (response && response.success && response.data) {
          // Verificar si response.data tiene properties directamente o si es un array
          const properties = response.data.properties || (Array.isArray(response.data) ? response.data : []);
          
          if (properties && properties.length >= 0) {
            setProperties(properties);
            setError(null);
          } else {
            setProperties([]);
            setError(null);
          }
        } else {
          throw new Error(response?.message || 'Error al cargar propiedades de Madrid');
        }
      } else {
        // Para otras ubicaciones, usar el método tradicional con filtros
        const searchFilters = { ...filters, location };
        setFilters(searchFilters);
        
        // Llamar directamente al servicio en lugar de loadProperties para evitar recursión
        const response = await propertyService.getProperties(searchFilters);
        
        // La respuesta viene como { success: true, data: { properties: [...] } }
        if (response && response.success && response.data && response.data.properties && Array.isArray(response.data.properties)) {
          setProperties(response.data.properties);
          setError(null);
        } else {
          throw new Error(response.message || 'Formato de respuesta inválido del servidor');
        }
      }
    } catch (err) {
      console.error('Error searching properties by location:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
      activeRequestRef.current = null;
    }
  }, []);

  /**
   * Buscar propiedades por zona
   * @param {string} zone - Zona específica (ej: 'costa-del-sol', 'costa-blanca', 'barcelona')
   */
  const searchByZone = useCallback(async (zone) => {
    const requestKey = `searchByZone_${zone}`;
    
    // Prevenir llamadas duplicadas
    if (activeRequestRef.current === requestKey || loading) {
      return;
    }
    
    try {
      activeRequestRef.current = requestKey;
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
      activeRequestRef.current = null;
    }
  }, []);

  /**
   * Buscar propiedades por newProperty (Inversión/Preconstrucción)
   * @param {string} newProperty - Tipo de nueva propiedad ('inversion' o 'preconstruccion')
   * @param {string} location - Localidad específica (opcional)
   */
  const searchByNewProperty = useCallback(async (newProperty, location = null) => {
    const requestKey = `searchByNewProperty_${newProperty}_${location || 'all'}`;
    
    // Prevenir llamadas duplicadas
    if (activeRequestRef.current === requestKey || loading) {
      return;
    }
    
    try {
      activeRequestRef.current = requestKey;
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);

      let response;
      
      if (location) {
        // Si se especifica una localidad, usar el endpoint combinado específico
        response = await propertyService.getPropertiesByNewPropertyAndLocation(newProperty, location);
      } else {
        // Si no se especifica localidad, usar el endpoint específico
        response = await propertyService.getPropertiesByNewProperty(newProperty);
      }

      // La respuesta viene como { success: true, data: { properties: [...] } }
      if (response && response.success && response.data && response.data.properties && Array.isArray(response.data.properties)) {
        setProperties(response.data.properties);
        setError(null);
      } else {
        throw new Error(response.message || 'Formato de respuesta inválido del servidor');
      }
    } catch (err) {
      console.error('Error searching properties by newProperty:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
      activeRequestRef.current = null;
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