/**
 * []� CONFIGURACIÓN DE COLORES PROFESIONALES
 * Exportable para componentes Angular
 * Paleta: Índigo #4F46E5, Púrpura #A855F7, Rosa #EC4899
 */

export const coloresInnoAd = {
  // COLORES PRIMARIOS
  indigo: '#4F46E5',
  indigoLight: '#6366F1',
  indigoDark: '#4338CA',
  
  // COLORES SECUNDARIOS
  purple: '#A855F7',
  purpleLight: '#C084FC',
  purpleDark: '#9333EA',
  
  // COLORES DE ACENTO
  pink: '#EC4899',
  pinkLight: '#F472B6',
  pinkDark: '#DB2777',
  
  // ESCALA DE GRISES
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // FONDOS OSCUROS (Dark Mode)
  darkBg: '#0F172A',
  darkSurface: '#1E293B',
  darkSurfaceAlt: '#334155',
  
  // ESTADOS
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // GRADIENTES
  gradientPrincipal: 'linear-gradient(135deg, #4F46E5 0%, #A855F7 50%, #EC4899 100%)',
  gradientSecondary: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
  gradientFondo: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
  
  // SOMBRAS NEON
  sombra: {
    indigo: '0 0 20px rgba(79, 70, 229, 0.6)',
    purple: '0 0 20px rgba(168, 85, 247, 0.6)',
    pink: '0 0 20px rgba(236, 72, 153, 0.6)',
  },
  
  // SOMBRAS ESTÁNDAR
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
};

/**
 * TRANSICIONES PROFESIONALES
 */
export const transiciones = {
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
  suave: 'all 300ms ease-out',
};

/**
 * ESPACIADO ESTANDARIZADO
 */
export const espaciado = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
};

/**
 * BORDER RADIUS
 */
export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

/**
 * ANIMACIONES KEYFRAMES
 */
export const animaciones = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideInDown: `
    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  
  slideInUp: `
    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  
  slideInRight: `
    @keyframes slideInRight {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  
  gradientFlow: `
    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
};

/**
 * CLASES DE UTILIDAD PARA COMPONENTES
 */
export const utilidades = {
  // Flexbox
  flexCenter: 'display: flex; justify-content: center; align-items: center;',
  flexBetween: 'display: flex; justify-content: space-between; align-items: center;',
  flexColumn: 'display: flex; flex-direction: column;',
  
  // Grid
  gridAuto: 'display: grid; grid-auto-flow: dense;',
  
  // Texto
  textTruncate: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
  textCenter: 'text-align: center;',
  textBold: 'font-weight: 700;',
  
  // Posición
  absoluteFull: 'position: absolute; top: 0; left: 0; right: 0; bottom: 0;',
  fixedFull: 'position: fixed; top: 0; left: 0; right: 0; bottom: 0;',
  
  // Visibilidad
  hidden: 'display: none;',
  invisible: 'visibility: hidden;',
};

/**
 * ESTILOS DE BOTÓN REUTILIZABLES
 */
export const estilosBotones = {
  base: `
    border: none;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 0.75rem;
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  `,
  
  primario: `
    background: linear-gradient(135deg, #4F46E5 0%, #A855F7 100%);
    color: #FFFFFF;
    box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 25px 35px -5px rgba(79, 70, 229, 0.4);
    }
  `,
  
  secundario: `
    background: transparent;
    color: #A855F7;
    border: 2px solid #A855F7;
    
    &:hover {
      background: rgba(168, 85, 247, 0.15);
      border-color: #EC4899;
      color: #EC4899;
      transform: translateY(-2px);
    }
  `,
  
  outline: `
    background: transparent;
    border: 2px solid currentColor;
    color: #94A3B8;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #E2E8F0;
    }
  `,
  
  ghost: `
    background: transparent;
    border: none;
    color: #94A3B8;
    
    &:hover {
      color: #E2E8F0;
      background: rgba(255, 255, 255, 0.05);
    }
  `,
  
  success: `
    background: #10B981;
    color: #FFFFFF;
    
    &:hover {
      background: #059669;
    }
  `,
  
  error: `
    background: #EF4444;
    color: #FFFFFF;
    
    &:hover {
      background: #DC2626;
    }
  `,
  
  disabled: `
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
    }
  `,
};

/**
 * BREAKPOINTS RESPONSIVOS
 */
export const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1920px',
};

/**
 * TEMAS PREDEFINIDOS
 */
export const temas = {
  light: {
    bg: '#FFFFFF',
    text: '#111827',
    border: '#E5E7EB',
  },
  dark: {
    bg: '#0F172A',
    text: '#E2E8F0',
    border: '#334155',
  },
  premium: {
    bg: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    text: '#CBD5E1',
    border: 'rgba(148, 163, 184, 0.2)',
  },
};
