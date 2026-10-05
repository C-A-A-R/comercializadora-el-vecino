export const PRODUCTS_MOCK = [
  {
    id: 101,
    name: 'Nevera Samsung 200L No Frost',
    description: 'Nevera inverter de alta eficiencia energética con congelador rápido.',
    price_usd: 650.00,
    price_cop: 2730000.00,
    tasa_cambio_aplicada: 4200.00,
    stock: 12,
    category: { id: 1, name: 'Refrigeradores' },
    product_type: { id: 1, name: 'Línea Blanca' },
    brand: 'Samsung',
    model: 'RT20K5030S8',
    voltage: '110V',
    capacity: '200L',
    dimensions: '60x70x150 cm',
    is_active: true,
    is_featured: true,
    variants: [
      { id: 1, name: 'Plateado', hex_color: '#C0C0C0' },
      { id: 2, name: 'Blanco', hex_color: '#FFFFFF' }
    ],
    images: [
      { id: 10, angle: 'Frontal', image: 'https://via.placeholder.com/300x300?text=Nevera+Frontal' },
      { id: 11, angle: 'Lateral', image: 'https://via.placeholder.com/300x300?text=Nevera+Lateral' }
    ],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-10T15:30:00Z'
  },
  {
    id: 102,
    name: 'Lavadora LG Smart Motion 13kg',
    description: 'Lavadora carga superior con tecnología Smart Inverter.',
    price_usd: 520.00,
    price_cop: 2184000.00,
    tasa_cambio_aplicada: 4200.00,
    stock: 3, // Stock crítico
    category: { id: 2, name: 'Lavadoras' },
    product_type: { id: 1, name: 'Línea Blanca' },
    brand: 'LG',
    model: 'WT13WSB',
    voltage: '110V',
    capacity: '13kg',
    dimensions: '63x67x102 cm',
    is_active: true,
    is_featured: false,
    variants: [
      { id: 3, name: 'Gris Oscuro', hex_color: '#4A4A4A' }
    ],
    images: [
      { id: 12, angle: 'Frontal', image: 'https://via.placeholder.com/300x300?text=Lavadora+LG' }
    ],
    created_at: '2026-09-03T11:00:00Z',
    updated_at: '2026-09-11T12:00:00Z'
  }
];