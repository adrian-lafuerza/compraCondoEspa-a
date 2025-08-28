import { useNavigate, useSearchParams } from 'react-router-dom';

const FilterSidebar = ({ localFilters, handleFilterChange, handleClearFilters }) => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Obtener el valor actual del select basado en los parámetros de la URL
  const getCurrentLocationValue = () => {
    let locationParam = searchParams.get('location');
    let zoneParam = searchParams.get('zone');

    if (locationParam === 'madrid') {
      locationParam = 'Madrid';
    } else if (zoneParam === 'costa-blanca') {
      zoneParam = 'Costa Blanca';
    } else if (zoneParam === 'costa-del-sol') {
      zoneParam = 'Costa del Sol';
    } else {
      zoneParam = 'Elige una opcion'
    }

    const zone = {
      'Costa del Sol': 'costa-del-sol',
      'Costa Blanca': 'costa-blanca',
      'Madrid': 'madrid',
      'Elige una opcion': 'Elige una opcion'
    }

    if (locationParam) {
      return zone[locationParam];
    } else if (zoneParam) {
      return zone[zoneParam];;
    }
    return '';
  };

  console.log('searchParams', searchParams.get('newProperty'));


  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 lg:sticky lg:top-4 w-full">
      <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 text-center lg:text-left">FILTROS DE BÚSQUEDA</h3>

      {/* Localidad */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Localidad</label>
        <select
          value={getCurrentLocationValue()}
          onChange={(e) => {
            const selectedLocation = e.target.value;

            if (selectedLocation) {
              // Limpiar filtros locales antes de navegar
              // handleClearFilters();

              // Solo navegar - el useEffect de PropertiesPage se encargará de la llamada API

              if (searchParams.get('newProperty') !== null) {
                navigate(`/properties?newProperty=${searchParams.get('newProperty')}&location=${selectedLocation}`);
              } else if (selectedLocation === 'madrid') {
                navigate('/properties?location=madrid');
              } else if (selectedLocation === 'costa-blanca') {
                navigate('/properties?zone=costa-blanca');
              } else if (selectedLocation === 'costa-del-sol') {
                navigate('/properties?zone=costa-del-sol');
              }

            } else {
              // Si no hay selección, actualizar el filtro normalmente
              handleFilterChange('location', selectedLocation);
            }
          }}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option disabled value="Elige una opcion">Elige una opcion</option>
          <option value="costa-blanca">Costa Blanca</option>
          <option value="costa-del-sol">Costa del Sol</option>
          <option value="madrid">Madrid</option>
        </select>
      </div>

      {/* Precio */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
        <div className="flex flex-row gap-2">
          <input
            type="number"
            placeholder="Min €"
            value={localFilters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            min="0"
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
          />
          <input
            type="number"
            placeholder="Max €"
            value={localFilters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            min="0"
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
          />
        </div>
      </div>

      {/* Superficie */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Superficie (m²)</label>
        <div className="flex flex-row gap-2">
          <input
            type="number"
            placeholder="Min m²"
            value={localFilters.minSize}
            onChange={(e) => handleFilterChange('minSize', e.target.value)}
            min="0"
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
          />
          <input
            type="number"
            placeholder="Max m²"
            value={localFilters.maxSize}
            onChange={(e) => handleFilterChange('maxSize', e.target.value)}
            min="0"
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
          />
        </div>
      </div>

      {/* Habitaciones */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
        <select
          value={localFilters.rooms}
          onChange={(e) => handleFilterChange('rooms', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
        >
          <option value="">Cualquiera</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </div>

      {/* Baños */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
        <select
          value={localFilters.bathrooms}
          onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
        >
          <option value="">Cualquiera</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3+</option>
        </select>
      </div>

      {/* Tipo de Operación */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Operación</label>
        <select
          value={localFilters.operationType || ''}
          onChange={(e) => handleFilterChange('operationType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Cualquiera</option>
          <option value="sell">Venta</option>
          <option value="rent">Alquiler</option>
        </select>
      </div>

      {/* Ordenamiento por precio */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por precio</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.sortByPrice === 'highest'}
              onChange={(e) => {
                if (e.target.checked) {
                  handleFilterChange('sortByPrice', 'highest');
                } else {
                  handleFilterChange('sortByPrice', '');
                }
              }}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Precio más alto</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.sortByPrice === 'lowest'}
              onChange={(e) => {
                if (e.target.checked) {
                  handleFilterChange('sortByPrice', 'lowest');
                } else {
                  handleFilterChange('sortByPrice', '');
                }
              }}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Precio más bajo</span>
          </label>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="mt-4">
        <button
          onClick={handleClearFilters}
          className="cursor-pointer w-full bg-gray-300 text-gray-700 py-2 lg:py-3 px-4 rounded-md hover:bg-gray-400 transition-colors duration-300 font-medium text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;