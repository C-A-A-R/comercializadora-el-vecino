export const REVIEWS_MOCK = [
  {
    id: 1,
    customer_name: 'Carlos Mendoza',
    customer_phone: '+573158904321',
    customer_city: 'Bucaramanga',
    product_id: 101,
    product_name: 'Nevera Samsung 200L No Frost',
    rating: 5,
    comment: 'Excelente atención y el producto llegó en perfecto estado. Enfría rapidísimo y es súper silenciosa. Muy recomendados.',
    is_featured: true,
    status: 'approved', // 'approved' | 'pending' | 'hidden'
    is_complaint: false,
    created_at: '2026-09-28T14:20:00Z'
  },
  {
    id: 2,
    customer_name: 'María Fernanda Ruiz',
    customer_phone: '+573204567890',
    customer_city: 'Floridablanca',
    product_id: 102,
    product_name: 'Lavadora LG Smart Motion 13kg',
    rating: 5,
    comment: 'Nos asesoraron muy bien por WhatsApp para elegir la capacidad correcta para nuestra familia. El lavado es impecable.',
    is_featured: true,
    status: 'approved',
    is_complaint: false,
    created_at: '2026-09-30T11:15:00Z'
  },
  {
    id: 3,
    customer_name: 'Javier Restrepo',
    customer_phone: '+573109876543',
    customer_city: 'Girón',
    product_id: 104,
    product_name: 'Aire Acondicionado Split 12000 BTU',
    rating: 2,
    comment: 'El equipo enfría bien pero el técnico de instalación que contratamos notó una vibración extraña en el compresor. Necesito soporte de la garantía.',
    is_featured: false,
    status: 'pending',
    is_complaint: true,
    created_at: '2026-10-02T16:45:00Z'
  },
  {
    id: 4,
    customer_name: 'Andrea Morales',
    customer_phone: '+573187654321',
    customer_city: 'Piedecuesta',
    product_id: 103,
    product_name: 'Cocina Mabe 4 Puestos Inox',
    rating: 4,
    comment: 'Muy buena cocina, quemadores potentes y acabados de primera calidad. Todo conforme a la asesoría.',
    is_featured: false,
    status: 'approved',
    is_complaint: false,
    created_at: '2026-10-04T09:30:00Z'
  },
  {
    id: 5,
    customer_name: 'Roberto Gómez',
    customer_phone: '+573012345678',
    customer_city: 'Bucaramanga',
    product_id: 106,
    product_name: 'Smart TV Samsung 55" Crystal UHD',
    rating: 5,
    comment: 'La calidad de imagen es brutal. La entrega fue el mismo día acordado por WhatsApp. Excelente servicio de El Vecino.',
    is_featured: true,
    status: 'approved',
    is_complaint: false,
    created_at: '2026-10-05T18:10:00Z'
  }
];
