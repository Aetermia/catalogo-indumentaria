import { calculateCartTotals, describeSelection, formatMoney, getPromoLabels } from './pricing.js';

/** Mensaje de pedido. Usa el mismo motor de precios que el carrito, así los números coinciden. */
export function buildOrderMessage({ items, customer, config }) {
  const totals = calculateCartTotals(items);
  const entrega = config.entrega.find((e) => e.id === customer.entrega)?.label || customer.entrega;
  const pago = config.mediosDePago.find((m) => m.id === customer.pago)?.label || customer.pago;

  const lines = [`Hola ${config.marca}, quiero hacer este pedido:`, ''];

  totals.lines.forEach(({ product, selection, pricing }) => {
    lines.push(`• *${product.nombre}*`);
    const variant = describeSelection(product, selection);
    if (variant) lines.push(`  ${variant}`);
    lines.push(`  Cantidad: ${pricing.quantity} x ${formatMoney(pricing.basePrice)}`);
    if (pricing.lineDiscount > 0) {
      const promos = getPromoLabels(product).join(' + ');
      lines.push(`  Promo ${promos}: -${formatMoney(pricing.lineDiscount)}`);
    }
    lines.push(`  Subtotal: ${formatMoney(pricing.lineTotal)}`);
    lines.push('');
  });

  lines.push(`Subtotal: ${formatMoney(totals.subtotalBase)}`);
  if (totals.totalDiscount > 0) lines.push(`Descuentos: -${formatMoney(totals.totalDiscount)}`);
  lines.push(`*Total: ${formatMoney(totals.finalTotal)}*`);
  lines.push('');
  lines.push('*Mis datos*');
  lines.push(`Nombre: ${customer.nombre.trim()}`);
  lines.push(`Entrega: ${entrega}`);
  if (customer.entrega === 'envio') lines.push(`Dirección: ${customer.direccion.trim()}`);
  lines.push(`Pago: ${pago}`);

  return lines.join('\n');
}

export function buildWhatsAppLink(phone, text) {
  const digits = String(phone).replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
