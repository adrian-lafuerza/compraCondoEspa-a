import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCampaignCache } from '../../context/CampaignCacheContext';

const CampaignDetailPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getCampaignById, loading, error } = useCampaignCache();
  const [campaign, setCampaign] = useState(location.state?.campaign || null);
  const [isLoading, setIsLoading] = useState(!location.state?.campaign);

  useEffect(() => {
    const fetchCampaign = async () => {
      // Si ya tenemos los datos de la campaña desde la navegación, no necesitamos hacer la consulta
      if (campaign) {
        setIsLoading(false);
        return;
      }

      if (!campaignId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await getCampaignById(campaignId);
        
        if (response && response.success && response.data) {
          setCampaign(response.data);
        }
      } catch (err) {
        console.error('Error al cargar campaña:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, getCampaignById, campaign]);

  // Scroll al inicio cuando se carga la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [campaignId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando campaña...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-8">
        <h2 className="text-red-600 text-2xl font-semibold mb-4">Error al cargar la campaña</h2>
        <p className="text-gray-500 mb-8">{error || 'Campaña no encontrada'}</p>
        <button 
          onClick={() => navigate('/project')} 
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
        >
          Volver a proyectos
        </button>
      </div>
    );
  }

  // Obtener datos de la campaña
  const campaignTitle = campaign.settings?.subject_line || campaign.subject_line || 'Sin título';
  const campaignPreview = campaign.settings?.preview_text || campaign.preview_text || '';
  const campaignImages = campaign.images || [];
  const campaignDescriptions = campaign.descriptions || [];
  const sendTime = campaign.send_time ? new Date(campaign.send_time).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;
  const fromName = campaign.settings?.from_name || campaign.from_name || 'Ruben Alfonso';
  
  // Imagen principal (primera imagen disponible)
  const mainImage = campaignImages.length > 0 ? campaignImages[0] : null;

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header con botón de regreso */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => navigate('/blog')} 
            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
          >
            ← Volver a Historias
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Título y metadatos */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {campaignTitle}
          </h1>
          <div className="flex justify-center items-center">
            <img 
              src={`${import.meta.env.BASE_URL}images/RUBEN FOTO 1.png`}
              alt="Ruben Alfonso" 
              className="w-18 h-18 rounded-full mr-3 object-cover border border-gray-700"
            />

            <span className="text-lg">Ruben Alfonso</span>
          </div>
        </div>

        {/* Imagen principal */}
         {mainImage && (
           <div className="mb-8 text-center">
             <img
               src={campaign?.images?.length > 1 ? campaign.images[2].url : campaign.images[1].url}
               alt={mainImage.alt || campaignTitle}
               className="w-full h-auto rounded-lg shadow-lg max-h object-cover mx-auto"
               onError={(e) => {
                 e.target.style.display = 'none';
               }}
             />
           </div>
         )}

        {/* Contenido del artículo */}
        <div className="max-w-4xl mx-auto text-lg leading-relaxed">
          {/* Preview text como introducción */}
          {campaignPreview && (
            <div className="text-xl text-gray-600 mb-8 leading-relaxed font-light text-center italic">
              {campaignPreview}
            </div>
          )}

          {/* Descripciones de la campaña */}
          {campaignDescriptions.length > 0 ? (
            <div className="mb-8">
              {campaignDescriptions
                .filter((description) => {
                  const text = typeof description === 'string' ? description : description.text || '';
                  return !text.toLowerCase().includes('view email in browser') && 
                         !text.toLowerCase().includes('update your preferences');
                })
                .map((description, index) => (
                  <div key={index} className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {typeof description === 'string' ? description : description.text || ''}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-gray-600 leading-relaxed">
              <p className="mb-6 text-gray-700">
                En los últimos años, Miami ha dejado de ser solo un destino turístico para
                convertirse en una meca de capitales internacionales. Desde empresarios
                latinoamericanos buscando estabilidad, hasta fondos europeos diversificando
                portafolios, todos convergen en algo: Miami ofrece una combinación única de
                seguridad jurídica, beneficios fiscales, infraestructura moderna y calidad de vida.
              </p>
              <p className="mb-6 text-gray-700">
                Esta transformación no es casualidad. La ciudad ha implementado políticas
                estratégicas que la posicionan como un hub financiero global, atrayendo
                inversiones que superan los miles de millones de dólares anuales.
              </p>
              <p className="mb-6 text-gray-700">
                Para los inversionistas inmobiliarios, esto representa una oportunidad
                excepcional. El mercado residencial de lujo continúa en expansión,
                impulsado por la demanda internacional y la escasez de inventario en
                ubicaciones premium.
              </p>
            </div>
          )}

          {/* Galería de imágenes adicionales */}
           {campaignImages.length > 1 && (
             <div className="mt-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                 {campaignImages.slice(1).map((image, index) => (
                   <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 transform transition-transform">
                     <img
                       src={image.url}
                       alt={image.alt || `Imagen ${index + 2}`}
                       className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                       onError={(e) => {
                         e.target.style.display = 'none';
                       }}
                     />
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default CampaignDetailPage;