const BlogCard = ({ campaign, onClick }) => {
  
  
  const handleClick = () => {
    if (onClick) {
      onClick(campaign);
    }
  };

  // Obtener el título de la campaña
  const getCampaignTitle = () => {
    return campaign.subject_line || campaign.settings?.subject_line || campaign.title || campaign.settings?.title || 'Sin título';
  };

  return (
    <article
      className=" overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleClick}
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={campaign?.images?.length > 1 ? campaign.images[2].url : campaign.images[1].url}
          alt={campaign.images && campaign.images.length > 0 ? campaign.images[0].alt : getCampaignTitle()}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen falla al cargar
            e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop';
          }}
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h4 className="text-base font-semibold text-gray-800 mb-2">
          {getCampaignTitle()}
        </h4>
      </div>
    </article>
  );
};

export default BlogCard;