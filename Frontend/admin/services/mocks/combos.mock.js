export const COMBOS_MOCK = [
  {
    id: 1,
    name: "Combo Cocina Equipada Premium",
    description: "Llévate nevera 200L Samsung y cocina de inducción con descuento especial.",
    image_url: "https://via.placeholder.com/300x200?text=Combo+Cocina",
    price_combo_usd: 1650.00,
    start_date: "2026-09-01T00:00:00Z",
    end_date: "2026-09-30T23:59:59Z",
    is_active: true,
    items: [
      {
        product: { id: 42, name: "Nevera 200L Samsung", price_usd: 1500.00, price_cop: 6300000.00 },
        quantity: 1
      },
      {
        product: { id: 18, name: "Cocina de Inducción 4 Hornillas", price_usd: 350.00, price_cop: 1470000.00 },
        quantity: 1
      }
    ]
  }
];