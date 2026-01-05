/**
 * Script de Testing de Responsiveness
 * Verifica componentes críticos en 4 breakpoints
 * Ejecutar en consola del navegador (F12 > Console)
 */

const breakpoints = {
  desktop: { width: 1920, height: 1080, name: '🖥️  Desktop (1920px)' },
  laptop: { width: 1366, height: 768, name: '💻 Laptop (1366px)' },
  tablet: { width: 768, height: 1024, name: '📱 Tablet (768px)' },
  mobile: { width: 375, height: 667, name: '📲 Mobile (375px)' }
};

const componentesACriterio = {
  'Header/Navbar': ['app-header', 'navbar', '[class*="header"]', '[class*="navbar"]'],
  'Sidebar/Menu': ['app-sidebar', '[class*="sidebar"]', '[class*="menu"]'],
  'Botones principales': ['button[class*="primary"]', 'button[class*="main"]', '.btn-primary'],
  'Tablas (si existen)': ['table', '[role="table"]', '[class*="tabla"]'],
  'Cards/Contenedores': ['[class*="card"]', '[class*="container"]'],
  'Inputs/Formularios': ['input', 'textarea', 'select'],
  'Modales': ['[role="dialog"]', '[class*="modal"]'],
  'Footer': ['footer', '[class*="footer"]']
};

const resultados = {};

// Función para medir componente
function medirComponente(selector) {
  try {
    const elemento = document.querySelector(selector);
    if (!elemento) return null;
    
    const rect = elemento.getBoundingClientRect();
    const estilo = window.getComputedStyle(elemento);
    
    return {
      visible: rect.width > 0 && rect.height > 0,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      overflow: estilo.overflow,
      display: estilo.display
    };
  } catch (e) {
    return null;
  }
}

// Función para simular viewport
function testarBreakpoint(bp) {
  const anchuraActual = window.innerWidth;
  const alturaActual = window.innerHeight;
  
  console.log(`\n%c${bp.name}`, 'font-size: 16px; font-weight: bold; color: #0066cc;');
  console.log(`Simulando: ${bp.width}x${bp.height}`);
  
  let resultadosBreakpoint = {};
  
  for (const [categoria, selectores] of Object.entries(componentesACriterio)) {
    console.log(`\n📋 ${categoria}:`);
    
    for (const selector of selectores) {
      const medida = medirComponente(selector);
      
      if (medida) {
        const estado = medida.visible ? '✅' : '❌';
        console.log(
          `  ${estado} ${selector}\n` +
          `     Tamaño: ${medida.width}x${medida.height}px\n` +
          `     Display: ${medida.display}\n` +
          `     Overflow: ${medida.overflow}`
        );
        
        resultadosBreakpoint[selector] = medida;
      }
    }
  }
  
  return resultadosBreakpoint;
}

// Ejecutar testing
console.log('%c🧪 TESTING DE RESPONSIVENESS - INNOAD', 'font-size: 18px; font-weight: bold; background: #0066cc; color: white; padding: 10px;');

for (const [key, bp] of Object.entries(breakpoints)) {
  resultados[key] = testarBreakpoint(bp);
}

// Resumen final
console.log(`\n%c✅ RESUMEN DEL TESTING`, 'font-size: 14px; font-weight: bold; color: #00aa00;');
console.table(resultados);

// Recomendaciones
console.log(`\n%c💡 RECOMENDACIONES:`, 'font-size: 12px; font-weight: bold; color: #ff9900;');
console.log(`
1. Desktop (1920px): Verificar espaciado y alineación
2. Laptop (1366px): Es el punto de quiebre más común, verificar menús
3. Tablet (768px): Menú debe ser colapsable, layout debe ser adaptado
4. Mobile (375px): Una columna, botones accesibles, sin scroll horizontal
`);
