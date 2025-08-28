import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ customItems = [] }) => {
  const location = useLocation();
  
  // Generar breadcrumbs automáticamente basado en la ruta actual
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [
      {
        label: 'Inicio',
        path: '/',
        icon: <HomeIcon className="h-4 w-4" />
      }
    ];

    // Si hay elementos personalizados, usarlos en lugar de generar automáticamente
    if (customItems.length > 0) {
      return [...breadcrumbs, ...customItems];
    }

    // Generar breadcrumbs automáticamente
    pathnames.forEach((pathname, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      
      let label = pathname;
      
      // Personalizar etiquetas según la ruta
      switch (pathname) {
        case 'properties':
          label = 'Propiedades';
          break;
        case 'property':
          label = 'Detalle de Propiedad';
          break;
        case 'blog':
          label = 'Blog';
          break;
        default:
          // Si es un ID numérico, no mostrarlo como breadcrumb
          if (/^\d+$/.test(pathname)) {
            return;
          }
          label = pathname.charAt(0).toUpperCase() + pathname.slice(1);
      }
      
      breadcrumbs.push({
        label,
        path: routeTo
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className={` ${location.pathname === '/properties' ? 'md:max-w-[90%] px-4 sm:px-6 lg:px-8' : 'md:max-w-[100%]'} sm:max-w-[100%] mx-auto py-4 `}>
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li key={breadcrumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                )}
                
                {isLast ? (
                  <span className="flex items-center text-gray-600 font-medium">
                    {breadcrumb.icon && <span className="mr-1">{breadcrumb.icon}</span>}
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    to={breadcrumb.path}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
                  >
                    {breadcrumb.icon && <span className="mr-1">{breadcrumb.icon}</span>}
                    {breadcrumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;