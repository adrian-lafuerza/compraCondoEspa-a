const FilterSidebar = ({ localFilters, handleFilterChange, handleClearFilters }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 lg:sticky lg:top-4 w-full">
      <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 text-center lg:text-left">FILTROS DE BÚSQUEDA</h3>

      {/* Precio */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Min €"
            value={localFilters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
          />
          <input
            type="text"
            placeholder="Max €"
            value={localFilters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
          />
        </div>
      </div>

      {/* Superficie */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Superficie (m²)</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Min m²"
            value={localFilters.minSize}
            onChange={(e) => handleFilterChange('minSize', e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-0"
          />
          <input
            type="text"
            placeholder="Max m²"
            value={localFilters.maxSize}
            onChange={(e) => handleFilterChange('maxSize', e.target.value)}
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