// Catálogo demo. Se usa cuando no hay backend PHP disponible.
// Fotos: Unsplash (licencia Unsplash), elegidas para que coincidan con cada prenda.
// Reemplazar por fotos propias de la marca antes de publicar.

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=1125&q=75`;

const talleSuperior = (precios = {}, agotados = []) =>
  [
    ['S', '52 x 70 cm'],
    ['M', '54 x 72 cm'],
    ['L', '57 x 74 cm'],
    ['XL', '60 x 76 cm'],
    ['XXL', '63 x 78 cm'],
  ].map(([nombre, medidas]) => ({
    nombre,
    descripcion: `Pecho x largo: ${medidas}`,
    precio: precios[nombre] ?? null,
    disponible: !agotados.includes(nombre),
  }));

const tallePantalon = (agotados = []) =>
  [
    ['38', '76 cm'],
    ['40', '80 cm'],
    ['42', '84 cm'],
    ['44', '88 cm'],
    ['46', '92 cm'],
  ].map(([nombre, cintura]) => ({
    nombre,
    descripcion: `Cintura ${cintura}`,
    precio: null,
    disponible: !agotados.includes(nombre),
  }));

export const catalog = [
  {
    id: 1,
    nombre: 'Remera Heavyweight Blanca',
    categoria: 'Remeras',
    descripcion:
      'Jersey de algodón peinado de 280 g/m², calce recto y cuello acanalado de 2,5 cm. Prelavada para que no encoja después del primer lavado.',
    precio: 28000,
    imagenes: [img('1521572163474-6864f9cf17ab'), img('1622445275463-afa2ab738c34'), img('1586790170083-2f9ceadc732d')],
    variantes: [{ grupo: 'Talle', opciones: talleSuperior({ XXL: 31000 }) }],
    descuento_porcentaje: 0,
    tipo_promocion: '2X1',
    descuento_segunda_unidad: 0,
    etiqueta: null,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Remera Estampa Negra',
    categoria: 'Remeras',
    descripcion:
      'Algodón de 240 g/m² con estampa al frente en serigrafía al agua: no se cuartea ni se despega con los lavados. Calce regular.',
    precio: 26000,
    imagenes: [img('1583743814966-8936f5b7be1a'), img('1618354691373-d851c5c3a990')],
    variantes: [
      { grupo: 'Talle', opciones: talleSuperior({}, ['S']) },
      {
        grupo: 'Estampa',
        opciones: [
          { nombre: 'Frase', descripcion: 'Texto blanco a la altura del pecho', precio: null, disponible: true },
          { nombre: 'Escudo', descripcion: 'Escudo chico sobre el corazón', precio: null, disponible: true },
        ],
      },
    ],
    descuento_porcentaje: 0,
    tipo_promocion: 'NONE',
    descuento_segunda_unidad: 0,
    etiqueta: 'Nuevo ingreso',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Buzo Hoodie Gris Melange',
    categoria: 'Buzos',
    descripcion:
      'Frisa invisible de 420 g/m² con capucha doble y bolsillo canguro. Puños y cintura en rib con elastano para que mantengan la forma.',
    precio: 62000,
    imagenes: [img('1556821840-3a63f95609a7')],
    variantes: [{ grupo: 'Talle', opciones: talleSuperior({ XL: 66000, XXL: 66000 }) }],
    descuento_porcentaje: 20,
    tipo_promocion: 'NONE',
    descuento_segunda_unidad: 0,
    etiqueta: null,
    activo: true,
  },
  {
    id: 4,
    nombre: 'Buzo Cuello Redondo',
    categoria: 'Buzos',
    descripcion:
      'Rústico de algodón de 360 g/m² con puños y cintura en rib. Liviano para media estación, se usa solo o debajo de una campera.',
    precio: 48000,
    imagenes: [img('1620799140408-edc6dcb6d633'), img('1578587018452-892bacefd3f2')],
    variantes: [
      { grupo: 'Talle', opciones: talleSuperior({}, ['XXL']) },
      {
        grupo: 'Color',
        opciones: [
          { nombre: 'Blanco', descripcion: 'Blanco óptico', precio: null, disponible: true },
          { nombre: 'Mandarina', descripcion: 'Teñido en prenda', precio: null, disponible: true },
        ],
      },
    ],
    descuento_porcentaje: 0,
    tipo_promocion: '2DA_UNIDAD_DESCUENTO',
    descuento_segunda_unidad: 50,
    etiqueta: null,
    activo: true,
  },
  {
    id: 5,
    nombre: 'Jogger Chino Habano',
    categoria: 'Pantalones',
    descripcion:
      'Gabardina de algodón con 2% de elastano, cintura con elástico y cordón interno, ruedo puño. Bolsillos al bies y bolsillo trasero con botón.',
    precio: 58000,
    imagenes: [img('1473966968600-fa801b869a1a')],
    variantes: [{ grupo: 'Talle', opciones: tallePantalon(['46']) }],
    descuento_porcentaje: 30,
    tipo_promocion: 'NONE',
    descuento_segunda_unidad: 0,
    etiqueta: null,
    activo: true,
  },
  {
    id: 6,
    nombre: 'Jean Recto Índigo',
    categoria: 'Pantalones',
    descripcion:
      'Denim rígido de 13 oz, tiro medio y pierna recta. Se ablanda con el uso y toma la forma de quien lo lleva.',
    precio: 64000,
    imagenes: [img('1542272604-787c3835535d'), img('1624378439575-d8705ad7ae80')],
    variantes: [{ grupo: 'Talle', opciones: tallePantalon() }],
    descuento_porcentaje: 0,
    tipo_promocion: 'NONE',
    descuento_segunda_unidad: 0,
    etiqueta: null,
    activo: true,
  },
  {
    id: 7,
    nombre: 'Camisa Oxford',
    categoria: 'Camisas',
    descripcion:
      'Algodón oxford de trama marcada, cuello con botones y bolsillo al pecho. Calce recto, se usa por dentro o por fuera del pantalón.',
    precio: 54000,
    imagenes: [img('1588359348347-9bc6cbbb689e'), img('1602810318383-e386cc2a3ccf')],
    variantes: [
      { grupo: 'Talle', opciones: talleSuperior() },
      {
        grupo: 'Color',
        opciones: [
          { nombre: 'Celeste', descripcion: 'Oxford clásico', precio: null, disponible: true },
          { nombre: 'Blanco', descripcion: 'Blanco óptico', precio: null, disponible: true },
          { nombre: 'Grafito', descripcion: 'Gris oscuro', precio: null, disponible: true },
          { nombre: 'Bordó', descripcion: 'Teñido en hilado', precio: 58000, disponible: true },
        ],
      },
    ],
    descuento_porcentaje: 0,
    tipo_promocion: '2DA_UNIDAD_DESCUENTO',
    descuento_segunda_unidad: 30,
    etiqueta: null,
    activo: true,
  },
  {
    id: 8,
    nombre: 'Campera Biker de Cuero Negra',
    categoria: 'Camperas',
    descripcion:
      'Cuero vacuno curtido al cromo, forro de viscosa y cierres metálicos. Cuello con solapa y cinturón con hebilla. Con el uso toma pliegues propios.',
    precio: 185000,
    imagenes: [img('1551028719-00167b16eac5')],
    variantes: [{ grupo: 'Talle', opciones: talleSuperior({ XXL: 195000 }, ['S']) }],
    descuento_porcentaje: 15,
    tipo_promocion: 'NONE',
    descuento_segunda_unidad: 0,
    etiqueta: null,
    activo: true,
  },
];

export const heroImage = {
  src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&h=1500&q=75',
  alt: 'Perchero con prendas de la colección en tonos neutros',
  width: 1200,
  height: 1500,
};
