/**
 * Variantes de animación predefinidas para framer-motion
 */

// Animaciones de entrada desde diferentes direcciones
export const slideInVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInFromBottom = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInFromTop = {
  hidden: { opacity: 0, y: -60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Animaciones de escala
export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const bounceInVariants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.68, -0.55, 0.265, 1.55]
    }
  }
};

// Animaciones de fade
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

// Animaciones de rotación
export const rotateInVariants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Animaciones de contenedor para stagger
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Animaciones de elementos hijo para stagger
export const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Animaciones de hover
export const hoverVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  },
  tap: {
    scale: 0.95
  }
};

export const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Animaciones de parallax
export const parallaxVariants = {
  animate: {
    y: [0, -50],
    transition: {
      duration: 1,
      ease: 'linear'
    }
  }
};

// Animaciones de texto
export const textRevealVariants = {
  hidden: {
    opacity: 0,
    y: 100
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Animaciones de contador
export const counterVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};