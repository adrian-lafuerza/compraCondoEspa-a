const BlogCard = ({ campaign, onClick }) => {
  console.log(campaign);
  
  const handleClick = () => {
    if (onClick) {
      onClick(campaign);
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  // Obtener la imagen de la campaña (real o placeholder)
  const getCampaignImage = () => {
    // Prioridad 1: Usar imágenes extraídas del contenido HTML
    if (campaign.images && campaign.images.length > 0) {
      return campaign.images[0].url;
    }
    
    // Prioridad 2: Si hay thumbnail real de Mailchimp, usarlo
    if (campaign.thumbnail?.url) {
      return campaign.thumbnail.url;
    }
    
    // Prioridad 3: usar placeholder basado en el ID de la campaña
    const images = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop'
    ];
    
    // Usar el ID de la campaña para seleccionar una imagen consistente
    const index = campaign.web_id ? campaign.web_id % images.length : 0;
    return images[index];
  };

  // Obtener el texto de vista previa de la campaña
  const getPreviewText = () => {
    // Prioridad 1: Usar descripciones extraídas del contenido HTML
    if (campaign.descriptions && campaign.descriptions.length > 0) {
      // Usar la primera descripción que sea lo suficientemente larga
      const goodDescription = campaign.descriptions.find(desc => desc.length > 50);
      if (goodDescription) {
        return goodDescription.length > 150 ? goodDescription.substring(0, 150) + '...' : goodDescription;
      }
      return campaign.descriptions[0];
    }
    
    // Prioridad 2: Usar preview_text de la campaña
    if (campaign.preview_text || campaign.settings?.preview_text) {
      return campaign.preview_text || campaign.settings.preview_text;
    }
    
    // Prioridad 3: Usar subject_line
    if (campaign.subject || campaign.settings?.subject_line) {
      return campaign.subject || campaign.settings.subject_line;
    }
    
    return "¡Atención inversionistas! Este jueves 31 tienes una cita imperdible en nuestro Instagram Live 🔴 junto a Martha Ledesma y Rubén Alfredo.";
  };
  
  // Obtener el título de la campaña
  const getCampaignTitle = () => {
    return campaign.subject || campaign.settings?.subject_line || campaign.title || campaign.settings?.title || 'Sin título';
  };
  console.log(campaign);
  

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleClick}
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={campaign.images[2].url}
          alt={campaign.images && campaign.images.length > 0 ? campaign.images[0].alt : getCampaignTitle()}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen falla al cargar
            e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop';
          }}
        />
        
        {/* Overlay con información */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="text-white">
            <h3 className="text-sm font-semibold mb-1">
              {getCampaignTitle()}
            </h3>
            <div className="text-xs leading-relaxed opacity-90 line-clamp-2">
              {getPreviewText()}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h4 className="text-base font-semibold text-gray-800 mb-2">
          {getCampaignTitle()}
        </h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {getPreviewText()}
        </p>
        
        {/* Información de imágenes y descripciones */}
        {campaign.images && campaign.images.length > 0 && (
          <div className="text-xs text-green-600 mb-2">
            📷 {campaign.images.length} imagen{campaign.images.length > 1 ? 'es' : ''}
          </div>
        )}
        
        {/* Información de contacto */}
        <p className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Contacto:</span> {campaign.reply_to || campaign.settings?.reply_to || 'compracondomiami@gmail.com'}
        </p>
        
        {/* Información adicional */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-blue-600 font-medium">
            ID: {campaign.id?.substring(0, 8)}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(campaign.create_time)}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;