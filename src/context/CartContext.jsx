import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { calculateCartTotals } from '../utils/pricing.js';

const STORAGE_KEY = 'catalogo_cart_v1';
const CartContext = createContext(null);

/** Clave estable por producto + combinación de variantes, sin importar el orden de los grupos. */
export function lineKey(productId, selection = {}) {
  const parts = Object.keys(selection)
    .sort()
    .map((k) => `${k}=${selection[k]}`);
  return `${productId}|${parts.join('&')}`;
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.product.id, action.selection);
      const existing = state.find((i) => i.key === key);
      if (existing) {
        return state.map((i) =>
          i.key === key ? { ...i, product: action.product, quantity: i.quantity + action.quantity } : i
        );
      }
      return [...state, { key, product: action.product, selection: action.selection, quantity: action.quantity }];
    }
    case 'setQty':
      return state
        .map((i) => (i.key === action.key ? { ...i, quantity: Math.max(0, action.quantity) } : i))
        .filter((i) => i.quantity > 0);
    case 'remove':
      return state.filter((i) => i.key !== action.key);
    case 'sync':
      // Actualiza precios/promos con el catálogo vigente y quita productos que ya no existen.
      return state
        .map((i) => {
          const fresh = action.products.find((p) => String(p.id) === String(i.product.id));
          return fresh ? { ...i, product: fresh } : null;
        })
        .filter(Boolean);
    case 'clear':
      return [];
    default:
      return state;
  }
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* sin almacenamiento: el carrito vive solo en memoria */
    }
  }, [items]);

  const add = useCallback((product, selection, quantity = 1) => dispatch({ type: 'add', product, selection, quantity }), []);
  const setQuantity = useCallback((key, quantity) => dispatch({ type: 'setQty', key, quantity }), []);
  const remove = useCallback((key) => dispatch({ type: 'remove', key }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const sync = useCallback((products) => dispatch({ type: 'sync', products }), []);

  const totals = useMemo(() => calculateCartTotals(items), [items]);

  const value = useMemo(
    () => ({ items, totals, add, setQuantity, remove, clear, sync }),
    [items, totals, add, setQuantity, remove, clear, sync]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
