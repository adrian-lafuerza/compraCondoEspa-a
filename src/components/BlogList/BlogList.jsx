import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlogCard from '../BlogCard/BlogCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const BlogList = ({ campaigns, loading, onCampaignClick, onLoadMore, hasMore, totalItems }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);

  useEffect(() => {
    let filtered = [...campaigns];

    // Aplicar filtros
    if (filter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filter);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.send_time || a.create_time);
          const dateB = new Date(b.send_time || b.create_time);
          return dateB - dateA; // Más reciente primero
        case 'opens':
          return (b.report_summary?.opens || 0) - (a.report_summary?.opens || 0);
        case 'clicks':
          return (b.report_summary?.clicks || 0) - (a.report_summary?.clicks || 0);
        case 'title':
          const titleA = a.subject_line || a.settings?.subject_line || '';
          const titleB = b.subject_line || b.settings?.subject_line || '';
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });

    setFilteredCampaigns(filtered);
  }, [campaigns, filter, sortBy]);

  const filterOptions = [
    { value: 'all', label: 'Todas', count: campaigns.length },
    { value: 'sent', label: 'Enviadas', count: campaigns.filter(c => c.status === 'sent').length },
    { value: 'draft', label: 'Borradores', count: campaigns.filter(c => c.status === 'draft').length },
    { value: 'scheduled', label: 'Programadas', count: campaigns.filter(c => c.status === 'scheduled').length }
  ];

  const sortOptions = [
    { value: 'date', label: 'Fecha' },
    { value: 'opens', label: 'Aperturas' },
    { value: 'clicks', label: 'Clics' },
    { value: 'title', label: 'Título' }
  ];

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de filtrado y ordenamiento */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filter === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredCampaigns.length} de {totalItems || campaigns.length} campañas
        </div>
      </div>

      {/* Grid de campañas */}
      <AnimatePresence mode="wait">
        {filteredCampaigns.length > 0 ? (
          <motion.div
            key="campaigns-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid blog-grid"
          >
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard
                  campaign={campaign}
                  onClick={onCampaignClick}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-campaigns"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron campañas
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No hay campañas disponibles en este momento.'
                : `No hay campañas con el estado "${filterOptions.find(f => f.value === filter)?.label}".`
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de cargar más */}
      {hasMore && filteredCampaigns.length > 0 && (
        <div className="text-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium btn-hover-effect"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="blog-spinner"></div>
                Cargando...
              </div>
            ) : (
              'Cargar más campañas'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;