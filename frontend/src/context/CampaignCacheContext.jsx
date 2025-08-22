import React, { createContext, useContext, useState, useCallback } from 'react';
import { mailchimpService } from '../services/mailchimpService';

const CampaignCacheContext = createContext();

export const useCampaignCache = () => {
    const context = useContext(CampaignCacheContext);
    if (!context) {
        throw new Error('useCampaignCache must be used within a CampaignCacheProvider');
    }
    return context;
};

export const CampaignCacheProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función simplificada para obtener campañas - sin caché
    const getCampaigns = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await mailchimpService.getCampaigns(params);
            
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Error al obtener campañas');
            }
        } catch (err) {
            console.error('Error fetching campaigns:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Función simplificada para obtener una campaña por ID - sin caché
    const getCampaignById = useCallback(async (campaignId) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await mailchimpService.getCampaignById(campaignId);
            
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Error al obtener campaña');
            }
        } catch (err) {
            console.error('Error fetching campaign by ID:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Función simplificada para obtener el contenido de una campaña - sin caché
    const getCampaignContent = useCallback(async (campaignId) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await mailchimpService.getCampaignContent(campaignId);
            
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Error al obtener contenido de campaña');
            }
        } catch (err) {
            console.error('Error fetching campaign content:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para limpiar errores
    const clearError = () => {
        setError(null);
    };

    const value = {
        // Estados
        loading,
        error,
        
        // Funciones
        getCampaigns,
        getCampaignById,
        getCampaignContent,
        clearError
    };

    return (
        <CampaignCacheContext.Provider value={value}>
            {children}
        </CampaignCacheContext.Provider>
    );
};

export default CampaignCacheContext;