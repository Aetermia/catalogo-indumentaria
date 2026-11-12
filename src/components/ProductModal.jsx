import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import {
  calculateLineTotal,
  formatMoney,
  getPromoDescription,
  getPromoLabels,
  getSelectedOptions,
} from '../utils/pricing.js';
import { CloseIcon, MinusIcon, PlusIcon, RulerIcon } from './Icons.jsx';
import SizeGuideModal from './SizeGuideModal.jsx';
import { useModalDialog } from './useModalDialog.js';
import './ProductModal.css';

/** Preselecciona solo los grupos con una única opción disponible. El talle se elige a conciencia. */
function initialSelection(product) {
  const sel = {};
  (product?.variantes || []).forEach((g) => {
    const available = g.opciones.filter((o) => o.disponible !== false);
    if (available.length === 1) sel[g.grupo] = available[0].nombre;
  });
  return sel;
}

function ProductDetail({ product, onClose, onAdded }) {
  const { add } = useCart();
  const [selection, setSelection] = useState(() => initialSelection(product));
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  const images = product.imagenes?.length ? product.imagenes : [];
  const groups = product.variantes || [];
  const missing = groups.filter((g) => !selection[g.grupo]).map((g) => g.grupo);
  const pricing = useMemo(() => calculateLineTotal(product, selection, quantity), [product, selection, quantity]);
  const unitOnly = useMemo(() => calculateLineTotal(product, selection, 1), [product, selection]);
  const promos = getPromoLabels(product);
  const promoText = getPromoDescription(product);
  const selectedOptions = getSelectedOptions(product, selection);
  const talleGroup = groups.find((g) => g.grupo.toLowerCase() === 'talle');
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  const choose = (grupo, nombre) => {
    setSelection((s) => ({ ...s, [grupo]: nombre }));
    setShowMissing(false);
  };

  const handleAdd = () => {
    if (missing.length) {
      setShowMissing(true);
      return;
    }
    add(product, selection, quantity);
    onAdded();
  };

  return (
    <>
      <div className="pm">
        <button type="button" className="icon-btn pm__close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </button>

        <div className="pm__gallery">
          <div className="pm__main">
            {images.length ? (
              <img
                src={images[imageIndex]}
                alt={`${product.nombre}, foto ${imageIndex + 1} de ${images.length}`}
                width="900"
                height="1125"
              />
            ) : (
              <span className="pm__noimg">Sin foto</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="pm__thumbs" role="group" aria-label="Fotos del producto">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className="pm__thumb"
                  aria-pressed={i === imageIndex}
                  aria-label={`Ver foto ${i + 1}`}
                  onClick={() => setImageIndex(i)}
                >
                  <img src={src} alt="" width="90" height="112" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pm__info">
          <p className="pm__cat">{product.etiqueta ? `${product.categoria} · ${product.etiqueta}` : product.categoria}</p>
          <h2 id="pm-title" className="pm__title">
            {product.nombre}
          </h2>

          <div className="pm__price num" aria-live="polite">
            {unitOnly.hasDirectDiscount && (
              <s className="pm__old">
                <span className="visually-hidden">Antes </span>
                {formatMoney(unitOnly.basePrice)}
              </s>
            )}
            <span className="pm__final">{formatMoney(unitOnly.unitFinalPrice)}</span>
            {promos.map((l) => (
              <span key={l} className="badge badge--outline">
                {l}
              </span>
            ))}
          </div>
          {promoText && <p className="pm__promo">{promoText}</p>}

          {product.descripcion && <p className="pm__desc">{product.descripcion}</p>}

          {groups.map((g) => {
            const current = g.opciones.find((o) => o.nombre === selection[g.grupo]);
            const isMissing = showMissing && !current;
            return (
              <fieldset key={g.grupo} className="pm__group" aria-describedby={isMissing ? `miss-${g.grupo}` : undefined}>
                <legend className="pm__legend">
                  <span>{g.grupo}</span>
                  {g === talleGroup && (
                    <button type="button" className="pm__guide" onClick={() => setGuideOpen(true)}>
                      <RulerIcon />
                      Guía de talles
                    </button>
                  )}
                </legend>
                <div className="pm__options">
                  {g.opciones.map((o) => {
                    const off = o.disponible === false;
                    return (
                      <button
                        key={o.nombre}
                        type="button"
                        className="pm__option"
                        aria-pressed={selection[g.grupo] === o.nombre}
                        disabled={off}
                        onClick={() => choose(g.grupo, o.nombre)}
                        title={off ? 'Sin stock' : o.descripcion || undefined}
                      >
                        {o.nombre}
                        {off && <span className="visually-hidden"> (sin stock)</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="pm__option-detail num">
                  {current
                    ? `${g.grupo} ${current.nombre}${current.descripcion ? ` · ${current.descripcion}` : ''}${
                        Number(current.precio) > 0 ? ` · ${formatMoney(current.precio)}` : ''
                      }`
                    : `Elegí ${g.grupo.toLowerCase()}.`}
                </p>
                {isMissing && (
                  <p id={`miss-${g.grupo}`} className="field__error">
                    Falta elegir {g.grupo.toLowerCase()}.
                  </p>
                )}
              </fieldset>
            );
          })}

          <div className="pm__buy">
            <div className="qty" role="group" aria-label="Cantidad">
              <button
                type="button"
                className="qty__btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Restar una unidad"
              >
                <MinusIcon />
              </button>
              <span className="qty__value num" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="qty__btn"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Sumar una unidad"
              >
                <PlusIcon />
              </button>
            </div>
            <button type="button" className="btn pm__add" onClick={handleAdd}>
              {missing.length ? `Elegí ${missing[0].toLowerCase()}` : 'Agregar al carrito'}
            </button>
          </div>

          <dl className="pm__summary num" aria-live="polite">
            <div>
              <dt>Total por {quantity} {quantity === 1 ? 'unidad' : 'unidades'}</dt>
              <dd>{formatMoney(pricing.lineTotal)}</dd>
            </div>
            {pricing.lineDiscount > 0 && (
              <div className="pm__saving">
                <dt>Ahorrás</dt>
                <dd>{formatMoney(pricing.lineDiscount)}</dd>
              </div>
            )}
            {selectedOptions.length > 0 && missing.length === 0 && (
              <div className="pm__sel">
                <dt className="visually-hidden">Selección</dt>
                <dd>{selectedOptions.map((o) => `${o.grupo} ${o.nombre}`).join(' · ')}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      <SizeGuideModal
        open={guideOpen}
        onClose={closeGuide}
        categoria={product.categoria}
        highlight={talleGroup ? selection[talleGroup.grupo] : undefined}
      />
    </>
  );
}

export default function ProductModal({ product, onClose, onAdded }) {
  const [shown, setShown] = useState(product);
  useEffect(() => {
    if (product) setShown(product);
  }, [product]);

  const ref = useModalDialog(Boolean(product), onClose);

  return (
    <dialog ref={ref} className="pm-dialog" aria-labelledby="pm-title">
      {product && shown && <ProductDetail key={shown.id} product={shown} onClose={onClose} onAdded={onAdded} />}
    </dialog>
  );
}
