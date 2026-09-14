export const CATEGORIES_MOCK = [
  {
    id: 1,
    name: 'Refrigeradores',
    slug: 'refrigeradores',
    description: 'Neveras, congeladores y enfriadores.',
    is_active: true,
    product_types: [
      { id: 1, name: 'Línea Blanca', slug: 'linea-blanca' },
      { id: 2, name: 'Comercial', slug: 'comercial' }
    ]
  },
  {
    id: 2,
    name: 'Lavadoras',
    slug: 'lavadoras',
    description: 'Lavadoras automáticas, semiautomáticas y secadoras.',
    is_active: true,
    product_types: [
      { id: 1, name: 'Línea Blanca', slug: 'linea-blanca' }
    ]
  },
  {
    id: 3,
    name: 'Climatización',
    slug: 'climatizacion',
    description: 'Aires acondicionados split, portátiles y ventiladores.',
    is_active: true,
    product_types: [
      { id: 3, name: 'Aires Acondicionados', slug: 'aires-acondicionados' }
    ]
  }
];

export const PRODUCT_TYPES_MOCK = [
  { id: 1, name: 'Línea Blanca', slug: 'linea-blanca', description: 'Electrodomésticos principales del hogar.' },
  { id: 2, name: 'Comercial', slug: 'comercial', description: 'Equipos para negocios y hostelería.' },
  { id: 3, name: 'Aires Acondicionados', slug: 'aires-acondicionados', description: 'Sistemas de enfriamiento ambiental.' }
];