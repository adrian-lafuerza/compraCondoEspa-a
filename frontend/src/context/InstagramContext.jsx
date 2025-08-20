import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { instagramService } from '../services/instagramService';

const InstagramContext = createContext();

export const useInstagram = () => {
    const context = useContext(InstagramContext);
    if (!context) {
        throw new Error('useInstagram debe ser usado dentro de InstagramProvider');
    }
    return context;
};

export const InstagramProvider = ({ children }) => {
    const [instagramPosts, setInstagramPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInstagramPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const posts = await instagramService.getAllPosts();
            setInstagramPosts(posts);
        } catch (err) {
            console.error('Error fetching Instagram posts:', err);
            setError(err.message || 'Error al cargar los posts de Instagram');
            // Fallback a datos de ejemplo si hay error
            setInstagramPosts([
                {
				id: 'default-1',
				title: 'Mi último proyecto',
				instagramUrl: 'https://www.instagram.com/reel/DIG2gOWt2lt/',
				embedUrl: 'https://www.instagram.com/reel/DIG2gOWt2lt/embed',
				description: 'Descubre mi último proyecto inmobiliario',
				isActive: true,
				order: 1
			},
			{
				id: 'default-2',
				title: 'LAY PROCENTE',
				instagramUrl: 'https://www.instagram.com/reel/DKXUPyLodQP/',
				embedUrl: 'https://www.instagram.com/reel/DKXUPyLodQP/embed',
				description: 'Consejos inmobiliarios importantes',
				isActive: true,
				order: 2
			},
			{
				id: 'default-3',
				title: 'HOY TENGO EL HONOR DE ESTAR',
				instagramUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/',
				embedUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/embed',
				description: 'Experiencias profesionales',
				isActive: true,
				order: 3
			},
			{
				id: 'default-3',
				title: 'HOY TENGO EL HONOR DE ESTAR',
				instagramUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/',
				embedUrl: 'https://www.instagram.com/reel/DKhhoIkto9G/embed',
				description: 'Experiencias profesionales',
				isActive: true,
				order: 3
			}
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstagramPosts();
    }, []);

    const value = useMemo(() => ({
        instagramPosts,
        loading,
        error,
        refetch: fetchInstagramPosts
    }), [instagramPosts, loading, error, fetchInstagramPosts]);


    return (
        <InstagramContext.Provider value={value}>
            {children}
        </InstagramContext.Provider>
    );
};

export default InstagramContext;