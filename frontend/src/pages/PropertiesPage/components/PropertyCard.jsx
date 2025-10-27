import { useNavigate, useLocation } from 'react-router-dom';

const PropertyCard = ({ property, index }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = () => {
    navigate(`/property/${property.propertyId}`, {
      state: {
        fromSearch: location.search
      }
    });
  };


  

  return (
    <div
      className="font-space-grotesk bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-auto sm:h-[600px] lg:h-[280px]"
      onClick={handleCardClick}
    >
      <div className="flex flex-col lg:flex-row h-full">
        {/* Imagen de la propiedad */}
        <div className="relative w-full lg:w-[35%] flex-shrink-0 overflow-hidden h-[200px] sm:h-[280px] lg:h-full">
          <img
            src={property?.images?.length > 0 ? property?.images[0]?.url : 'https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/ae/4a/bd/${property?.propertyId}.jpg'}
            alt={property?.reference || 'Propiedad'}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Contenido de la card */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 lg:p-4 min-h-[150px] sm:min-h-[170px] lg:h-full">
          <div className="flex-1 space-y-3">
            {/* Título y precio */}
            <h3 className="font-space-grotesk text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 line-clamp-2 leading-tight">
              {`Piso en calle ${property?.address?.streetName}` || 'Dirección no disponible'}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <p className="text-xl sm:text-2xl lg:text-xl text-gray-600">
                {property?.operation?.price ? `${property?.operation?.price.toLocaleString()} €` : 'Precio a consultar'}
              </p>
              <p className="text-sm lg:text-xl text-gray-600">
                Ref: {property?.reference || 'N/A'}
              </p>
            </div>
            {/* Descripción */}
            {property?.descriptions?.map((item, index) => (
              <p key={index} className="text-gray-600 text-sm lg:text-md leading-relaxed line-clamp-2">
                {item.text || item}
              </p>
            ))}
          </div>
          {/* Características */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 text-sm lg:text-sm text-gray-600 mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center">
                <svg className="w-4 h-4 lg:w-4 lg:h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                <span className="font-medium">{property?.features?.rooms || 'N/A'}</span>
                <span className="ml-0.5">hab.</span>
              </div>
              <div className="flex items-center sm:hidden">
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2h6v4H7V6zm8 8v2h1v-2h-1zm-2-2H4v2h9v-2z" clipRule="evenodd"></path>
                </svg>
                <span className="font-medium">{property?.features?.bathroomNumber || 'N/A'}</span>
                <span className="ml-0.5">baños</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center">
              <svg className="w-4 h-4 lg:w-4 lg:h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2h6v4H7V6zm8 8v2h1v-2h-1zm-2-2H4v2h9v-2z" clipRule="evenodd"></path>
              </svg>
              <span className="font-medium">{property?.features?.bathroomNumber || 'N/A'}</span>
              <span className="ml-0.5">baños</span>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center">
                <svg className="w-4 h-4 lg:w-4 lg:h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"></path>
                </svg>
                <span className="font-medium">{property.features?.areaConstructed || 'N/A'}</span>
                <span className="ml-0.5">m²</span>
              </div>
              <span className="text-blue-600 font-medium text-xs sm:text-sm bg-blue-50 px-2 py-1 rounded-full sm:hidden">Exclusiva</span>
            </div>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="hidden sm:inline text-blue-600 font-medium text-sm lg:text-sm bg-blue-50 px-2 py-1 rounded-full">Exclusiva</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;