export const PROMOTIONS_MOCK = [
  {
    id: 1,
    name: "Descuento de Temporada Refrigeradores",
    discount_type: "percentage",
    value: 15.00,
    product: {
      id: 42,
      name: "Nevera 200L Samsung",
      price_usd: 1500.00,
      price_cop: 6300000.00
    },
    start_date: "2026-09-01T00:00:00Z",
    end_date: "2026-09-30T23:59:59Z",
    is_active: true
  },
  {
    id: 2,
    name: "Bono Fijo Cocina Inducción",
    discount_type: "fixed",
    value: 50.00,
    product: {
      id: 18,
      name: "Cocina de Inducción 4 Hornillas",
      price_usd: 350.00,
      price_cop: 1470000.00
    },
    start_date: "2026-10-01T00:00:00Z",
    end_date: "2026-10-15T23:59:59Z",
    is_active: true
  },
  {
    id: 3,
    name: "Liquidación Aire Acondicionado",
    discount_type: "percentage",
    value: 20.00,
    product: {
      id: 9,
      name: "Aire Acondicionado 12000 BTU",
      price_usd: 400.00,
      price_cop: 1680000.00
    },
    start_date: "2026-08-01T00:00:00Z",
    end_date: "2026-08-31T23:59:59Z",
    is_active: false
  }
];