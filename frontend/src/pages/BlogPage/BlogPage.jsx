import { useState, useEffect } from 'react';
import BlogCard from '../../components/BlogCard/BlogCard';
import { mailchimpService } from '../../services/mailchimpService';

const BlogPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar campañas
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar getCampaigns directamente para obtener los datos actualizados
      const response = await mailchimpService.getCampaigns({ 
        status: 'sent',
        count: 3
      });

      let campaignsList = response.campaigns || [];
      
      // Ordenar por fecha más reciente primero
      campaignsList = campaignsList.sort((a, b) => {
        const dateA = new Date(a.create_time || a.createTime || 0);
        const dateB = new Date(b.create_time || b.createTime || 0);
        return dateB - dateA; // Orden descendente (más reciente primero)
      });

      setCampaigns(campaignsList);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      console.error('Error details:', err.message);
      setError(`Error al cargar las campañas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  const handleCampaignClick = (campaign) => {
    // Redirigir al enlace de Mailchimp
    if (campaign.archive_url) {
      window.open(campaign.archive_url, '_blank');
    } else if (campaign.long_archive_url) {
      window.open(campaign.long_archive_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando campañas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Últimos Historios
          </h1>
          <p className="text-gray-600">
            Todo el valor que no queremos que te pierdas
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Grid de campañas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <BlogCard
              key={campaign.id}
              campaign={campaign}
              onClick={handleCampaignClick}
            />
          ))}
        </div>

        {/* Mensaje si no hay campañas */}
        {!loading && campaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay campañas disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;