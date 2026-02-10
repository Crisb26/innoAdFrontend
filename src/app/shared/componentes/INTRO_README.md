Uso rápido de la guía (Intro.js)

- Componente: `app-intro-boton`
  - Selector: `<app-intro-boton [steps] [containerSelector]>`
  - `steps` (opcional): array de pasos compatible con Intro.js. Si se provee, se usa directamente.
  - `containerSelector` (opcional): selector CSS del contenedor donde buscar elementos con `data-intro`.

- Forma declarativa (sin `steps`): añadir atributos `data-intro="Tu texto"` a los elementos del DOM que quieras explicar.
  - Ejemplo: `<button data-intro="Crea una nueva campaña">Nueva Campaña</button>`

- Comportamiento:
  - Si `steps` está presente, se inicia la guía con esos pasos.
  - Si no, el botón buscará elementos con `data-intro` dentro del `containerSelector` o en `document.body`.
  - Si no hay pasos, mostrará un mensaje informativo.

- Integración segura: el servicio `GuiaServicio` carga intro.js dinámicamente desde unpkg y gestiona la inicialización.

Notas:
- Añade `app-intro-boton` en los componentes donde quieras que el usuario pueda abrir la guía.
- Mantén textos cortos y claros en `data-intro`. Usa `data-intro-position` si quieres sugerir la posición del tooltip.
