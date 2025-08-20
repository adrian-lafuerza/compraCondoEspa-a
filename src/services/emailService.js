import emailjs from '@emailjs/browser';
import { useState } from 'react';

// Configuración de EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

// Inicializar EmailJS
const initEmailJS = () => {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
};

// Función para enviar email de contacto
export const sendContactEmail = async (formData) => {
  try {
    // Inicializar EmailJS si no se ha hecho
    initEmailJS();

    // Preparar los datos del template
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      location: formData.location || 'No especificada',
      message: formData.message,
      to_name: 'Equipo de CompraCondoEspaña',
      reply_to: formData.email,
      // Información adicional para el template
      current_date: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      contact_type: 'Formulario de Contacto Principal',
      to_email: import.meta.env.VITE_COMPANY_EMAIL || 'info@compracondoespana.com'
    };

    // Enviar el email
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Email enviado exitosamente:', response);
    return {
      success: true,
      message: '¡Mensaje enviado correctamente! Te contactaremos pronto.',
      data: response
    };

  } catch (error) {
    console.error('Error al enviar email:', error);
    return {
      success: false,
      message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
      error: error.message
    };
  }
};

// Función para validar los datos del formulario
export const validateContactForm = (formData) => {
  const errors = {};

  // Validar nombre
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.email = 'Por favor, ingresa un email válido';
  }

  // Validar mensaje
  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'El mensaje debe tener al menos 10 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Hook personalizado para manejar el formulario de contacto
export const useContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const submitForm = async (formData) => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    // Validar formulario
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setStatus({
        type: 'error',
        message: Object.values(validation.errors)[0]
      });
      setIsLoading(false);
      return { success: false, errors: validation.errors };
    }

    // Enviar email
    const result = await sendContactEmail(formData);
    
    setStatus({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
    
    setIsLoading(false);
    return result;
  };

  const clearStatus = () => {
    setStatus({ type: '', message: '' });
  };

  return {
    submitForm,
    isLoading,
    status,
    clearStatus
  };
};

export default {
  sendContactEmail,
  validateContactForm,
  useContactForm
};