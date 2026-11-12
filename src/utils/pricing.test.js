// Ejecutar con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotals, calculateLineTotal, getUnitPricing, getPriceRange } from './pricing.js';
import { buildOrderMessage } from './whatsapp.js';

const remera2x1 = {
  nombre: 'Remera',
  precio: 28000,
  descuento_porcentaje: 0,
  tipo_promocion: '2X1',
  variantes: [{ grupo: 'Talle', opciones: [{ nombre: 'M', descripcion: '', precio: null }, { nombre: 'XXL', descripcion: '', precio: 31000 }] }],
};
const hoodie20 = {
  nombre: 'Hoodie',
  precio: 62000,
  descuento_porcentaje: 20,
  tipo_promocion: 'NONE',
  variantes: [{ grupo: 'Talle', opciones: [{ nombre: 'M', precio: null }, { nombre: 'XL', precio: 66000 }] }],
};
const buzo2da = { nombre: 'Buzo', precio: 48000, descuento_porcentaje: 0, tipo_promocion: '2DA_UNIDAD_DESCUENTO', descuento_segunda_unidad: 50, variantes: [] };

test('precio de variante reemplaza al base y luego aplica % OFF', () => {
  assert.equal(getUnitPricing(hoodie20, { Talle: 'M' }).unitFinalPrice, 49600);
  assert.equal(getUnitPricing(hoodie20, { Talle: 'XL' }).unitFinalPrice, 52800);
  assert.equal(getUnitPricing(hoodie20, { nombre: 'XL', precio: 66000 }).basePrice, 66000);
  assert.equal(getUnitPricing(hoodie20).basePrice, 62000);
});

test('2x1 cobra ceil(q/2)', () => {
  assert.equal(calculateLineTotal(remera2x1, { Talle: 'M' }, 2).lineTotal, 28000);
  assert.equal(calculateLineTotal(remera2x1, { Talle: 'M' }, 3).lineTotal, 56000);
  assert.equal(calculateLineTotal(remera2x1, { Talle: 'M' }, 3).lineDiscount, 28000);
  assert.equal(calculateLineTotal(remera2x1, { Talle: 'XXL' }, 1).lineTotal, 31000);
});

test('2da unidad con descuento por par completo', () => {
  assert.equal(calculateLineTotal(buzo2da, {}, 1).lineTotal, 48000);
  assert.equal(calculateLineTotal(buzo2da, {}, 2).lineTotal, 72000);
  assert.equal(calculateLineTotal(buzo2da, {}, 3).lineTotal, 120000);
});

test('totales del carrito y mensaje de WhatsApp coinciden', () => {
  const items = [
    { product: remera2x1, selection: { Talle: 'M' }, quantity: 2 },
    { product: remera2x1, selection: { Talle: 'XXL' }, quantity: 3 },
    { product: hoodie20, selection: { Talle: 'XL' }, quantity: 1 },
  ];
  const t = calculateCartTotals(items);
  // 2 x 28000 = 56000 -> 28000 ; 3 x 31000 = 93000 -> 62000 ; 66000 -> 52800
  assert.equal(t.subtotalBase, 215000);
  assert.equal(t.finalTotal, 142800);
  assert.equal(t.totalDiscount, 72200);

  const msg = buildOrderMessage({
    items,
    customer: { nombre: 'Ana Pérez', entrega: 'envio', direccion: 'Av. Corrientes 1234', pago: 'transferencia' },
    config: {
      marca: 'Tienda',
      entrega: [{ id: 'envio', label: 'Envío a domicilio' }],
      mediosDePago: [{ id: 'transferencia', label: 'Transferencia' }],
    },
  });
  assert.match(msg, /Subtotal: \$ 215\.000/);
  assert.match(msg, /Descuentos: -\$ 72\.200/);
  assert.match(msg, /\*Total: \$ 142\.800\*/);
  assert.match(msg, /Promo 20% OFF: -\$ 13\.200/);
  assert.match(msg, /Dirección: Av\. Corrientes 1234/);
  assert.ok(!msg.includes(String.fromCharCode(0x2014)));
});

test('rango de precios ignora el base si todas las opciones tienen precio', () => {
  const r = getPriceRange(hoodie20);
  assert.equal(r.minBase, 62000);
  assert.equal(r.maxBase, 66000);
  assert.equal(r.varies, true);
});
