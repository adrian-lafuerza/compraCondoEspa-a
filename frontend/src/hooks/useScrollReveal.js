import { useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Hook personalizado para animaciones de scroll reveal con framer-motion
 * @param {Object} options - Opciones de configuración
 * @param {number} options.threshold - Porcentaje del elemento que debe estar visible (0-1)
 * @param {boolean} options.once - Si la animación debe ejecutarse solo una vez
 * @param {string} options.margin - Margen para activar la animación
 * @returns {Object} - Ref del elemento y estado de visibilidad
 */
const useScrollReveal = (options = {}) => {
  const {
    threshold = 0.1,
    once = true,
    margin = '0px 0px -100px 0px'
  } = options;

  const ref = useRef(null);
  const isInView = useInView(ref, {
    threshold,
    once,
    margin
  });

  return { ref, isInView };
};

export default useScrollReveal;