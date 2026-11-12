// Iconos de trazo fino (1.5px) dibujados para esta plantilla. Decorativos: aria-hidden.
const base = { className: 'icon', viewBox: '0 0 24 24', 'aria-hidden': true, focusable: 'false' };

export const BagIcon = () => (
  <svg {...base}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);
export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const MinusIcon = () => (
  <svg {...base}>
    <path d="M6 12h12" />
  </svg>
);
export const PlusIcon = () => (
  <svg {...base}>
    <path d="M6 12h12M12 6v12" />
  </svg>
);
export const RulerIcon = () => (
  <svg {...base}>
    <path d="M3 9h18v6H3z" />
    <path d="M7 9v3M11 9v3M15 9v3M19 9v2" />
  </svg>
);
export const ChevronIcon = ({ dir = 'right' }) => (
  <svg {...base} style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const WhatsAppIcon = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12.04 2a9.9 9.9 0 0 0-8.45 15.06L2.5 21.5l4.56-1.07A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-2.7.64.66-2.63-.2-.32a8.2 8.2 0 1 1 6.72 3.64Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.21.88 2.39 1 2.55.13.17 1.74 2.66 4.22 3.73.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.17-.47-.29Z"
    />
  </svg>
);
