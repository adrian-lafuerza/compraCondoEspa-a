import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCampaignCache } from '../../context/CampaignCacheContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const CampaignDetailPage = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const { getCampaignById, getCampaignContent, loading: cacheLoading, error: cacheError } = useCampaignCache();
    const [campaign, setCampaign] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCampaignData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Iniciando carga de campaña:', campaignId);

            // Cargar información básica de la campaña
            console.log('📡 Obteniendo campaña por ID...');
            const campaignResponse = await getCampaignById(campaignId);
            console.log('✅ Campaña obtenida:', campaignResponse);
            
            if (campaignResponse.success) {
                setCampaign(campaignResponse.data);
            } else {
                throw new Error(campaignResponse.message || 'Error al obtener campaña');
            }

            // Cargar contenido de la campaña
            console.log('📡 Obteniendo contenido de la campaña...');
            const contentResponse = await getCampaignContent(campaignId);
            console.log('✅ Contenido obtenido:', contentResponse);
            
            if (contentResponse.success) {
                setContent(contentResponse.data);
            } else {
                throw new Error(contentResponse.message || 'Error al obtener contenido');
            }
            
            console.log('🎉 Carga completada exitosamente');
        } catch (err) {
            console.error('❌ Error loading campaign:', err);
            setError(`Error al cargar la campaña: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [campaignId, getCampaignById, getCampaignContent]);

    useEffect(() => {
        if (campaignId) {
            // Scroll hacia arriba al cargar la página
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadCampaignData();
        }
    }, [campaignId, loadCampaignData]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleGoBack = () => {
        navigate('/blog');
    };

    if (loading || cacheLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="large" />
                    <p className="mt-4 text-gray-600">Cargando campaña...</p>
                </div>
            </div>
        );
    }

    if (error || cacheError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error || cacheError}</p>
                        <button
                            onClick={handleGoBack}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                            Volver al Blog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con breadcrumbs */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                        <Link 
                            to="/blog" 
                            className="text-lg hover:text-gray-700 transition-colors duration-200"
                        >
                            Blog
                        </Link>
                        <ChevronRightIcon className="w-4 h-4" />
                    </nav>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-6xl h-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm">
                    {content ? (
                        <div className="p-6">
                            {/* Contenido HTML */}
                            {content.html && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenido</h2>
                                    <div className="campaign-content-container">
                                        <iframe
                                            srcDoc={`
                                                <!DOCTYPE html>
                                                <html>
                                                <head>
                                                    <meta charset="utf-8">
                                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                                    <style>
                                                        body {
                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                                            line-height: 1.6;
                                                            color: #374151;
                                                            margin: 0;
                                                            padding: 20px;
                                                            background: white;
                                                        }
                                                        img { max-width: 100%; height: auto; }
                                                        table { width: 100%; border-collapse: collapse; }
                                                        a { color: #3b82f6; text-decoration: none; }
                                                        a:hover { text-decoration: underline; }
                                                        h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
                                                        p { margin-bottom: 1em; }
                                                    </style>
                                                </head>
                                                <body>
                                                    ${content.html}
                                                </body>
                                                </html>
                                            `}
                                            className="w-full h-screen border-0"
                                            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                                            title="Contenido de la campaña"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Contenido de texto plano como fallback */}
                            {!content.html && content.plain_text && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenido</h2>
                                    <div className="whitespace-pre-wrap text-gray-700">
                                        {content.plain_text}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            No se pudo cargar el contenido de la campaña
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailPage;