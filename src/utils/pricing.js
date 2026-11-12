// Fuente única de precios. Funciones puras: sin estado, sin DOM.
// Orden de cálculo: precio de variante ?? precio base -> descuento % -> promo por volumen.

export const PROMO = {
  NONE: 'NONE',
  TWO_FOR_ONE: '2X1',
  SECOND_UNIT: '2DA_UNIDAD_DESCUENTO',
};

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const pct = (n) => Math.min(100, Math.max(0, Number(n) || 0));

/** Opciones elegidas, en el orden de los grupos del producto. */
export function getSelectedOptions(product, selection = {}) {
  const groups = Array.isArray(product?.variantes) ? product.variantes : [];
  return groups
    .map((g) => {
      const option = g.opciones?.find((o) => o.nombre === selection?.[g.grupo]);
      return option ? { grupo: g.grupo, ...option } : null;
    })
    .filter(Boolean);
}

/**
 * Precio base de la combinación elegida. Si varias opciones tienen precio propio,
 * gana la del último grupo (ej. Talle define precio, Color no lo pisa salvo que tenga uno).
 * `selectedVariant` puede ser un mapa { Talle: 'M' } o una opción suelta { precio }.
 */
export function getBasePrice(product, selectedVariant) {
  const fallback = Number(product?.precio) || 0;
  if (!selectedVariant) return fallback;
  const isSingleOption = typeof selectedVariant.nombre === 'string' && 'precio' in selectedVariant;
  if (isSingleOption) {
    return Number(selectedVariant.precio) > 0 ? Number(selectedVariant.precio) : fallback;
  }
  const priced = getSelectedOptions(product, selectedVariant).filter((o) => Number(o.precio) > 0);
  return priced.length ? Number(priced[priced.length - 1].precio) : fallback;
}

/** Precio unitario con el descuento directo aplicado. */
export function getUnitPricing(product, selectedVariant) {
  const basePrice = round2(getBasePrice(product, selectedVariant));
  const discountPct = pct(product?.descuento_porcentaje);
  const unitFinalPrice = round2(basePrice * (1 - discountPct / 100));
  return {
    basePrice,
    discountPct,
    unitFinalPrice,
    unitDiscount: round2(basePrice - unitFinalPrice),
    hasDirectDiscount: discountPct > 0,
  };
}

/** Rango de precios finales por unidad considerando todas las variantes con precio propio. */
export function getPriceRange(product) {
  const discountPct = pct(product?.descuento_porcentaje);
  const prices = new Set([Number(product?.precio) || 0]);
  (product?.variantes || []).forEach((g) =>
    g.opciones?.forEach((o) => {
      if (Number(o.precio) > 0) prices.add(Number(o.precio));
    })
  );
  // Si todas las opciones de algún grupo tienen precio propio, el precio base nunca se usa.
  const fullyPriced = (product?.variantes || []).some(
    (g) => g.opciones?.length && g.opciones.every((o) => Number(o.precio) > 0)
  );
  if (fullyPriced) prices.delete(Number(product?.precio) || 0);
  const list = [...prices].filter((p) => p > 0);
  const minBase = list.length ? Math.min(...list) : 0;
  const maxBase = list.length ? Math.max(...list) : 0;
  return {
    minBase,
    maxBase,
    minFinal: round2(minBase * (1 - discountPct / 100)),
    maxFinal: round2(maxBase * (1 - discountPct / 100)),
    varies: minBase !== maxBase,
  };
}

export function getPromoType(product) {
  const t = String(product?.tipo_promocion || PROMO.NONE).toUpperCase();
  if (t === PROMO.SECOND_UNIT && pct(product?.descuento_segunda_unidad) === 0) return PROMO.NONE;
  return Object.values(PROMO).includes(t) ? t : PROMO.NONE;
}

/** Etiquetas cortas de oferta, en el orden en que se aplican. */
export function getPromoLabels(product) {
  const labels = [];
  const d = pct(product?.descuento_porcentaje);
  if (d > 0) labels.push(`${d}% OFF`);
  const type = getPromoType(product);
  if (type === PROMO.TWO_FOR_ONE) labels.push('2x1');
  if (type === PROMO.SECOND_UNIT) labels.push(`2da al ${pct(product.descuento_segunda_unidad)}%`);
  return labels;
}

/** Explicación larga de la promo por volumen, para modal y carrito. */
export function getPromoDescription(product) {
  const type = getPromoType(product);
  if (type === PROMO.TWO_FOR_ONE) return 'Llevás 2 y pagás 1. Se aplica por cada par de la misma variante.';
  if (type === PROMO.SECOND_UNIT) {
    return `La segunda unidad tiene ${pct(product.descuento_segunda_unidad)}% de descuento. Se aplica por cada par de la misma variante.`;
  }
  return '';
}

/** Total de una línea del carrito. */
export function calculateLineTotal(product, selectedVariant, quantity) {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const unit = getUnitPricing(product, selectedVariant);
  const type = getPromoType(product);

  const lineBase = round2(unit.basePrice * qty);
  const afterDirect = round2(unit.unitFinalPrice * qty);
  let lineTotal = afterDirect;

  if (type === PROMO.TWO_FOR_ONE) {
    lineTotal = round2(Math.ceil(qty / 2) * unit.unitFinalPrice);
  } else if (type === PROMO.SECOND_UNIT) {
    const pairs = Math.floor(qty / 2);
    lineTotal = round2(afterDirect - pairs * unit.unitFinalPrice * (pct(product.descuento_segunda_unidad) / 100));
  }

  const directDiscount = round2(lineBase - afterDirect);
  const promoDiscount = round2(afterDirect - lineTotal);

  return {
    quantity: qty,
    ...unit,
    promoType: type,
    promoApplied: promoDiscount > 0,
    lineBase,
    lineTotal,
    directDiscount,
    promoDiscount,
    lineDiscount: round2(lineBase - lineTotal),
  };
}

/** Totales del carrito. items: [{ product, selection, quantity }] */
export function calculateCartTotals(items = []) {
  const lines = items.map((it) => ({ ...it, pricing: calculateLineTotal(it.product, it.selection, it.quantity) }));
  const subtotalBase = round2(lines.reduce((s, l) => s + l.pricing.lineBase, 0));
  const finalTotal = round2(lines.reduce((s, l) => s + l.pricing.lineTotal, 0));
  return {
    lines,
    subtotalBase,
    directDiscount: round2(lines.reduce((s, l) => s + l.pricing.directDiscount, 0)),
    promoDiscount: round2(lines.reduce((s, l) => s + l.pricing.promoDiscount, 0)),
    totalDiscount: round2(subtotalBase - finalTotal),
    finalTotal,
    units: lines.reduce((s, l) => s + l.pricing.quantity, 0),
  };
}

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(value, formatter = moneyFormatter) {
  return formatter.format(Number(value) || 0).replace(/ /g, ' ');
}

/** Texto de la variante elegida: "Talle M (54 x 72 cm) · Color Negro" */
export function describeSelection(product, selection) {
  return getSelectedOptions(product, selection)
    .map((o) => `${o.grupo} ${o.nombre}${o.descripcion ? ` (${o.descripcion})` : ''}`)
    .join(' · ');
}
