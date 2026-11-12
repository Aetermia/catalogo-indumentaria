import ProductCard from './ProductCard.jsx';
import './ProductGrid.css';

export default function ProductGrid({ products, status, error, onRetry, onSelect, onResetFilter, filtered }) {
  if (status === 'loading') {
    return (
      <div className="grid" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Cargando catálogo</span>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="grid__placeholder" aria-hidden="true">
            <div className="grid__placeholder-img" />
            <div className="grid__placeholder-line" />
            <div className="grid__placeholder-line grid__placeholder-line--short" />
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="grid-state" role="alert">
        <p className="grid-state__title">No pudimos cargar el catálogo.</p>
        <p className="grid-state__text">{error}</p>
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="grid-state">
        <p className="grid-state__title">
          {filtered ? 'No hay prendas en esta categoría por ahora.' : 'Todavía no hay prendas publicadas.'}
        </p>
        {filtered && (
          <button type="button" className="btn btn--ghost" onClick={onResetFilter}>
            Ver toda la colección
          </button>
        )}
      </div>
    );
  }

  return (
    <ul className="grid" role="list">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} index={i + 1} onSelect={onSelect} priority={i < 2} />
        </li>
      ))}
    </ul>
  );
}
