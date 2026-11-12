// Configuración de marca. Es lo único que cambia entre clientes, junto con catalog.js.

export const config = {
  marca: 'Pampa Studio',
  // [DATO REAL] Bajada de marca: reemplazar por la descripción real del cliente.
  bajada: 'Básicos de algodón, denim y abrigo para todos los días.',

  // Número en formato internacional sin "+", espacios ni guiones.
  // [DATO REAL] Reemplazar por el WhatsApp de la tienda antes de publicar.
  whatsapp: '5491100000000',
  mensajeConsulta: 'Hola, tengo una consulta sobre la colección.',

  // [DATO REAL] Completar o dejar vacío para ocultar.
  instagram: '',
  direccionLocal: 'Retiro a coordinar por WhatsApp',
  horario: 'Lunes a viernes de 10 a 18 h',

  moneda: { codigo: 'ARS', locale: 'es-AR' },

  temporada: 'Otoño-Invierno 2026',

  entrega: [
    { id: 'retiro', label: 'Retiro en local' },
    { id: 'envio', label: 'Envío a domicilio' },
  ],

  mediosDePago: [
    { id: 'transferencia', label: 'Transferencia' },
    { id: 'efectivo', label: 'Efectivo' },
    { id: 'mercadopago', label: 'Mercado Pago' },
  ],

  // Credenciales que solo funcionan en modo demo (sin backend).
  demoAdmin: { usuario: 'demo', password: 'demo1234' },

  // Guía de talles base. Cada producto usa la tabla según su categoría.
  guiaTalles: {
    superior: {
      titulo: 'Remeras, buzos, camisas y camperas',
      columnas: ['Talle', 'Ancho de pecho', 'Largo total', 'Largo de manga'],
      filas: [
        ['S', '52 cm', '70 cm', '60 cm'],
        ['M', '54 cm', '72 cm', '62 cm'],
        ['L', '57 cm', '74 cm', '63 cm'],
        ['XL', '60 cm', '76 cm', '64 cm'],
        ['XXL', '63 cm', '78 cm', '65 cm'],
      ],
      comoMedir: [
        'Ancho de pecho: con la prenda apoyada plana, de axila a axila.',
        'Largo total: desde el punto más alto del hombro hasta el ruedo.',
        'Largo de manga: desde la costura del hombro hasta el puño.',
      ],
    },
    inferior: {
      titulo: 'Pantalones',
      columnas: ['Talle', 'Cintura', 'Cadera', 'Largo de entrepierna'],
      filas: [
        ['38', '76 cm', '98 cm', '78 cm'],
        ['40', '80 cm', '102 cm', '79 cm'],
        ['42', '84 cm', '106 cm', '80 cm'],
        ['44', '88 cm', '110 cm', '81 cm'],
        ['46', '92 cm', '114 cm', '82 cm'],
      ],
      comoMedir: [
        'Cintura: alrededor de la cintura natural, sin ajustar la cinta.',
        'Cadera: en la parte más ancha, con los pies juntos.',
        'Entrepierna: desde la costura central hasta el ruedo, por dentro de la pierna.',
      ],
    },
  },
  categoriasInferiores: ['Pantalones'],
};

export function sizeGuideFor(categoria) {
  return config.categoriasInferiores.includes(categoria) ? config.guiaTalles.inferior : config.guiaTalles.superior;
}
