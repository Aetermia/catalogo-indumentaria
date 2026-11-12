import { useEffect, useRef } from 'react';

/**
 * Sincroniza un <dialog> nativo con un booleano de React.
 * El navegador resuelve foco atrapado, Escape y capa superior.
 * Click en el fondo (fuera del contenido) también cierra.
 */
export function useModalDialog(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    const handleClick = (e) => {
      if (e.target === dialog) onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return ref;
}
