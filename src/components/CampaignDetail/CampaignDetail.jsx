import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import mailchimpService from '../../services/mailchimpService';

const CampaignDetail = ({ campaign, isOpen, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solo cargar contenido si:
    // 1. El modal está abierto
    // 2. Hay una campaña válida
    // 3. No hay contenido cargado o el contenido no corresponde a la campaña actual
    // 4. No está cargando actualmente
    if (isOpen && campaign && !loading && 
        (!content || content.campaignId !== campaign.id)) {
      loadCampaignContent();
    }
  }, [isOpen, campaign, content, loading]);

  const loadCampaignContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mailchimpService.getCampaignContent(campaign.id);
      if (response.success) {
        setContent(response.data);
      } else {
        setError('No se pudo cargar el contenido de la campaña');
      }
    } catch (err) {
      setError('Error al cargar el contenido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'preview', label: 'Vista Previa', icon: '👁️' },
    { id: 'stats', label: 'Estadísticas', icon: '📊' },
    { id: 'images', label: 'Imágenes', icon: '🖼️' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden glass-effect"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{campaign.title}</h2>
                <p className="text-indigo-100 mb-3">{campaign.subject}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)} bg-opacity-20 text-white`}>
                    {campaign.status}
                  </span>
                  <span>{formatDate(campaign.send_time || campaign.create_time)}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar contenido</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={loadCampaignContent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {/* Vista Previa */}
                {activeTab === 'preview' && content && (
                  <div className="space-y-6">
                    {content.html ? (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="font-medium text-gray-900">Contenido HTML</h4>
                        </div>
                        <div 
                          className="p-4 blog-content"
                          dangerouslySetInnerHTML={{ __html: content.html }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No hay contenido HTML disponible
                      </div>
                    )}
                  </div>
                )}

                {/* Estadísticas */}
                {activeTab === 'stats' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {campaign.emailsSent?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-blue-800">Emails Enviados</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {campaign.report_summary?.opens?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-green-800">Aperturas</div>
                      <div className="text-xs text-green-600 mt-1">
                        {((campaign.openRate || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {campaign.report_summary?.clicks?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-purple-800">Clics</div>
                      <div className="text-xs text-purple-600 mt-1">
                        {((campaign.clickRate || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {campaign.webId || 'N/A'}
                      </div>
                      <div className="text-sm text-orange-800">ID Web</div>
                    </div>
                  </div>
                )}

                {/* Imágenes */}
                {activeTab === 'images' && content && (
                  <div className="space-y-6">
                    {content.images && content.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {content.images.map((image, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.alt || `Imagen ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-3">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {image.alt || `Imagen ${index + 1}`}
                              </p>
                              {image.title && (
                                <p className="text-xs text-gray-500 truncate">{image.title}</p>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                {image.width}x{image.height}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No se encontraron imágenes en esta campaña
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              ID: {campaign.id}
            </div>
            <div className="flex gap-3">
              {campaign.archiveUrl && (
                <a
                  href={campaign.archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Ver Archivo
                </a>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CampaignDetail;