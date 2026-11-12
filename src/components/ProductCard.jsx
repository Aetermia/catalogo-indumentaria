import { formatMoney, getPriceRange, getPromoLabels } from '../utils/pricing.js';
import './ProductCard.css';

/** Talles disponibles para los chips: grupo "Talle" o, si no existe, el primero. */
export function quickSizes(product) {
  const groups = product.variantes || [];
  const group = groups.find((g) => g.grupo.toLowerCase() === 'talle') || groups[0];
  return group ? group.opciones.filter((o) => o.disponible !== false).map((o) => o.nombre) : [];
}

export default function ProductCard({ product, index, onSelect, priority }) {
  const [main, hover] = product.imagenes || [];
  const range = getPriceRange(product);
  const promos = getPromoLabels(product);
  const sizes = quickSizes(product);
  const hasDiscount = Number(product.descuento_porcentaje) > 0;

  return (
    <button type="button" className="card" onClick={() => onSelect(product)}>
      <span className="card__media">
        {main ? (
          <img
            className="card__img"
            src={main}
            alt=""
            width="900"
            height="1125"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <span className="card__noimg">Sin foto</span>
        )}
        {hover && (
          <img className="card__img card__img--hover" src={hover} alt="" width="900" height="1125" loading="lazy" decoding="async" />
        )}
        {promos.length > 0 && (
          <span className="card__badges">
            {promos.map((label) => (
              <span key={label} className="badge">
                {label}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="card__body">
        <span className="card__meta">
          <span className="num">N.º {String(index).padStart(2, '0')}</span>
          <span>{product.etiqueta || product.categoria}</span>
        </span>
        <span className="card__name">{product.nombre}</span>
        <span className="card__price num">
          {range.varies && <span className="card__from">Desde</span>}
          {hasDiscount && (
            <s className="card__old">
              <span className="visually-hidden">Antes </span>
              {formatMoney(range.minBase)}
            </s>
          )}
          <span className="card__final">{formatMoney(range.minFinal)}</span>
        </span>
        {sizes.length > 0 && (
          <span className="card__sizes">
            <span className="visually-hidden">Talles disponibles: </span>
            {sizes.map((s) => (
              <span key={s} className="card__size">
                {s}
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}
