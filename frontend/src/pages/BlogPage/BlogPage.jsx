import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../../components/BlogCard/BlogCard';
import { useCampaignCache } from '../../context/CampaignCacheContext';

const BlogPage = () => {
  const navigate = useNavigate();
  const { getCampaigns, loading: cacheLoading, error: cacheError } = useCampaignCache();
  const [campaigns, setCampaigns] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 10;
  const STORAGE_KEY = 'blog_campaigns_state';

  // Cargar estado desde sessionStorage
  const loadStateFromStorage = () => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { campaigns: savedCampaigns, totalItems: savedTotal, hasMore: savedHasMore } = JSON.parse(savedState);
        setCampaigns(savedCampaigns);
        setTotalItems(savedTotal);
        setHasMore(savedHasMore);
        return true;
      }
    } catch (err) {
      console.error('Error loading state from storage:', err);
    }
    return false;
  };

  // Guardar estado en sessionStorage
  const saveStateToStorage = (campaignsData, totalItemsData, hasMoreData) => {
    try {
      const state = {
        campaigns: campaignsData,
        totalItems: totalItemsData,
        hasMore: hasMoreData
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Error saving state to storage:', err);
    }
  };

  // Cargar campañas iniciales
  useEffect(() => {
    const hasStoredState = loadStateFromStorage();
    if (!hasStoredState) {
      loadInitialCampaigns();
    } else {
      setLoading(false);
    }
  }, []);

  const loadInitialCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar primera página desde el servidor
      const response = await getCampaigns({
        status: 'sent',
        offset: 0,
        count: ITEMS_PER_PAGE
      });

      if (response.success) {
        const newCampaigns = response.data.campaigns;
        const newTotalItems = response.data.total_items;
        const newHasMore = newCampaigns.length < newTotalItems;

        setCampaigns(newCampaigns);
        setTotalItems(newTotalItems);
        setHasMore(newHasMore);

        // Guardar estado inicial
        saveStateToStorage(newCampaigns, newTotalItems, newHasMore);
      }
    } catch (err) {
      console.error('Error loading initial campaigns:', err);
      setError(`Error al cargar las campañas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar más campañas desde el servidor
      const response = await getCampaigns({
        status: 'sent',
        offset: campaigns.length,
        count: ITEMS_PER_PAGE
      });

      if (response.success) {
        const newCampaigns = response.data.campaigns;
        // Evitar duplicados
        const existingIds = new Set(campaigns.map(c => c.id));
        const uniqueNewCampaigns = newCampaigns.filter(c => !existingIds.has(c.id));

        const updatedCampaigns = [...campaigns, ...uniqueNewCampaigns];
        const updatedHasMore = updatedCampaigns.length < response.data.total_items;

        setCampaigns(updatedCampaigns);
        setHasMore(updatedHasMore);

        // Guardar estado actualizado
        saveStateToStorage(updatedCampaigns, response.data.total_items, updatedHasMore);
      }
    } catch (err) {
      console.error('Error loading more campaigns:', err);
      setError(`Error al cargar más campañas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  const handleCampaignClick = (campaign) => {
    navigate(`/campaign/${campaign.id}`);
  };

  const handleLoadMore = () => {
    if (!loading && !cacheLoading && hasMore) {
      loadMoreCampaigns();
    }
  };

  // Las campañas ya vienen filtradas por status='sent' desde el servidor
  const sentCampaigns = campaigns;

  if ((loading || cacheLoading) && campaigns.length === 0) {
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
            Ultimas Historias
          </h1>
          <p className="text-gray-600">
            Todo el valor que no queremos que te pierdas
          </p>
        </div>

        {/* Error Message */}
        {(error || cacheError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error || cacheError}</p>
          </div>
        )}

        {/* Información de paginación */}
        {totalItems > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            Mostrando {sentCampaigns.length} de {totalItems} campañas
          </div>
        )}

        {/* Grid de campañas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {sentCampaigns.map((campaign) => (
            <BlogCard
              key={campaign.id}
              campaign={campaign}
              onClick={handleCampaignClick}
            />
          ))}
        </div>

        {/* Botón de cargar más */}
        {hasMore && sentCampaigns.length > 0 && (
          <div className="text-center pt-8">
            <button
              onClick={handleLoadMore}
              disabled={loading || cacheLoading}
              className="mx-auto cursor-pointer border border-[#0E0E0E] text-[#0E0E0E] font-bold px-4 md:px-6 py-2 rounded text-xs md:text-sm hover:bg-[#0E0E0E] hover:text-white transition-colors flex items-center w-full md:w-auto justify-center md:justify-start"
            >
              {(loading || cacheLoading) ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Cargando...
                </div>
              ) : (
                <>
                  <span className="truncate">Cargar mas</span>
                  <span className="ml-2">→</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Mensaje si no hay campañas */}
        {!loading && !cacheLoading && sentCampaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay campañas disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;