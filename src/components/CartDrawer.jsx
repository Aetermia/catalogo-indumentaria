import { useState } from 'react';
import { config } from '../data/config.js';
import { useCart } from '../context/CartContext.jsx';
import { describeSelection, formatMoney, getPromoLabels } from '../utils/pricing.js';
import { buildOrderMessage, buildWhatsAppLink } from '../utils/whatsapp.js';
import { CloseIcon, MinusIcon, PlusIcon, WhatsAppIcon } from './Icons.jsx';
import { useModalDialog } from './useModalDialog.js';
import './CartDrawer.css';

const CUSTOMER_KEY = 'catalogo_customer_v1';

function loadCustomer() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null');
    if (saved && typeof saved === 'object') return { nombre: '', entrega: 'retiro', direccion: '', pago: 'transferencia', ...saved };
  } catch {
    /* sin datos guardados */
  }
  return { nombre: '', entrega: 'retiro', direccion: '', pago: 'transferencia' };
}

function validateCustomer(c) {
  const errors = {};
  if (c.nombre.trim().length < 3) errors.nombre = 'Escribí tu nombre y apellido.';
  if (c.entrega === 'envio' && c.direccion.trim().length < 6) errors.direccion = 'Indicá calle, número y localidad.';
  return errors;
}

export default function CartDrawer({ open, onClose }) {
  const { items, totals, setQuantity, remove, clear } = useCart();
  const ref = useModalDialog(open, onClose);
  const [customer, setCustomer] = useState(loadCustomer);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => {
    const value = e.target.value;
    setCustomer((c) => ({ ...c, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateCustomer(customer);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = e.currentTarget.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    } catch {
      /* no se recuerdan los datos */
    }
    const text = buildOrderMessage({ items, customer, config });
    window.open(buildWhatsAppLink(config.whatsapp, text), '_blank', 'noopener');
    setSent(true);
  };

  const close = () => {
    setSent(false);
    onClose();
  };

  const goToCatalog = () => {
    close();
    document.getElementById('catalogo')?.scrollIntoView();
  };

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="drawer-title">
      <div className="drawer__inner">
        <div className="drawer__head">
          <h2 id="drawer-title" className="drawer__title">
            Tu pedido <span className="num drawer__units">({totals.units})</span>
          </h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Cerrar carrito">
            <CloseIcon />
          </button>
        </div>

        {sent ? (
          <div className="drawer__state" role="status">
            <p className="drawer__state-title">Abrimos WhatsApp con tu pedido.</p>
            <p className="drawer__state-text">
              Enviá el mensaje para confirmarlo. Si WhatsApp no se abrió, revisá que el navegador no haya bloqueado la ventana.
            </p>
            <div className="drawer__state-actions">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  clear();
                  setSent(false);
                  goToCatalog();
                }}
              >
                Listo, vaciar carrito
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setSent(false)}>
                Volver al pedido
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="drawer__state">
            <p className="drawer__state-title">Tu carrito está vacío.</p>
            <p className="drawer__state-text">Elegí una prenda, el talle y la cantidad. El pedido se arma acá.</p>
            <button type="button" className="btn" onClick={goToCatalog}>
              Ver la colección
            </button>
          </div>
        ) : (
          <form className="drawer__body" onSubmit={handleSubmit} noValidate>
            <ul className="drawer__items" role="list">
              {totals.lines.map(({ key, product, selection, pricing }) => (
                <li key={key} className="line">
                  {product.imagenes?.[0] ? (
                    <img className="line__img" src={product.imagenes[0]} alt="" width="72" height="90" loading="lazy" />
                  ) : (
                    <span className="line__img" aria-hidden="true" />
                  )}
                  <div className="line__info">
                    <p className="line__name">{product.nombre}</p>
                    {describeSelection(product, selection) && <p className="line__variant">{describeSelection(product, selection)}</p>}
                    <p className="line__unit num">
                      {pricing.hasDirectDiscount && <s>{formatMoney(pricing.basePrice)}</s>} {formatMoney(pricing.unitFinalPrice)} c/u
                    </p>
                    <div className="line__row">
                      <div className="qty qty--sm" role="group" aria-label={`Cantidad de ${product.nombre}`}>
                        <button
                          type="button"
                          className="qty__btn"
                          onClick={() => setQuantity(key, pricing.quantity - 1)}
                          aria-label={pricing.quantity === 1 ? 'Quitar del carrito' : 'Restar una unidad'}
                        >
                          <MinusIcon />
                        </button>
                        <span className="qty__value num">{pricing.quantity}</span>
                        <button
                          type="button"
                          className="qty__btn"
                          onClick={() => setQuantity(key, Math.min(99, pricing.quantity + 1))}
                          aria-label="Sumar una unidad"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                      <p className="line__total num">{formatMoney(pricing.lineTotal)}</p>
                    </div>
                    {pricing.lineDiscount > 0 && (
                      <p className="line__saving num">
                        {getPromoLabels(product).join(' + ')}: ahorrás {formatMoney(pricing.lineDiscount)}
                      </p>
                    )}
                    <button type="button" className="line__remove" onClick={() => remove(key)}>
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <fieldset className="checkout">
              <legend className="checkout__legend">Datos para el pedido</legend>
              <div className="field">
                <label className="field__label" htmlFor="c-nombre">
                  Nombre completo
                </label>
                <input
                  id="c-nombre"
                  className="input"
                  autoComplete="name"
                  value={customer.nombre}
                  onChange={update('nombre')}
                  aria-invalid={Boolean(errors.nombre)}
                  aria-describedby={errors.nombre ? 'c-nombre-err' : undefined}
                />
                {errors.nombre && (
                  <p id="c-nombre-err" className="field__error">
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div className="field" role="radiogroup" aria-labelledby="c-entrega-label">
                <span id="c-entrega-label" className="field__label">
                  Entrega
                </span>
                <div className="segmented">
                  {config.entrega.map((op) => (
                    <label key={op.id} className="segmented__opt">
                      <input type="radio" name="entrega" value={op.id} checked={customer.entrega === op.id} onChange={update('entrega')} />
                      <span>{op.label}</span>
                    </label>
                  ))}
                </div>
                {customer.entrega === 'retiro' && config.direccionLocal && <p className="field__hint">{config.direccionLocal}</p>}
              </div>

              {customer.entrega === 'envio' && (
                <div className="field">
                  <label className="field__label" htmlFor="c-direccion">
                    Dirección de entrega
                  </label>
                  <input
                    id="c-direccion"
                    className="input"
                    autoComplete="street-address"
                    placeholder="Calle, número, piso, localidad"
                    value={customer.direccion}
                    onChange={update('direccion')}
                    aria-invalid={Boolean(errors.direccion)}
                    aria-describedby={errors.direccion ? 'c-direccion-err' : 'c-direccion-hint'}
                  />
                  {errors.direccion ? (
                    <p id="c-direccion-err" className="field__error">
                      {errors.direccion}
                    </p>
                  ) : (
                    <p id="c-direccion-hint" className="field__hint">
                      El costo de envío se coordina por WhatsApp.
                    </p>
                  )}
                </div>
              )}

              <div className="field">
                <label className="field__label" htmlFor="c-pago">
                  Medio de pago
                </label>
                <select id="c-pago" className="input" value={customer.pago} onChange={update('pago')}>
                  {config.mediosDePago.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <div className="drawer__foot">
              <dl className="totals num">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(totals.subtotalBase)}</dd>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="totals__saving">
                    <dt>Descuentos aplicados</dt>
                    <dd>-{formatMoney(totals.totalDiscount)}</dd>
                  </div>
                )}
                <div className="totals__final">
                  <dt>Total</dt>
                  <dd>{formatMoney(totals.finalTotal)}</dd>
                </div>
              </dl>
              <button type="submit" className="btn btn--block">
                <WhatsAppIcon size={20} />
                Enviar pedido por WhatsApp
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
