export type DriverStatus = "menunggu_customer" | "mengantar_pesanan" | "mengantri_di_kasir" | "menunggu_pesanan";
export type MenuCategory = "Noodle" | "Dimsum" | "Beverage";

export interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategory;
  isAvailable: boolean;
}

export interface Driver {
  id: string;
  name: string;
  restoName: string;
  status: DriverStatus;
  rating: number;
  slotsFilled: number;
  maxSlots: number;
  eta: string;
}

export const MOCK_MENUS: Menu[] = [
  // Noodle
  {
    id: "m1",
    name: "Mie Suit",
    description: "Mie tidak pedas dengan ayam cincang dan pangsit.",
    price: 11000,
    image: "🍜",
    category: "Noodle",
    isAvailable: true,
  },
  {
    id: "m2",
    name: "Mie Hompimpa (Lv 1–4)",
    description: "Mie pedas gurih level 1 sampai 4.",
    price: 11000,
    image: "🍜",
    category: "Noodle",
    isAvailable: true,
  },
  {
    id: "m3",
    name: "Mie Hompimpa (Lv 6–8)",
    description: "Mie pedas gurih level 6 sampai 8.",
    price: 12000,
    image: "🍜",
    category: "Noodle",
    isAvailable: true,
  },
  {
    id: "m4",
    name: "Mie Gacoan (Lv 0–4)",
    description: "Mie pedas manis level 0 sampai 4.",
    price: 11000,
    image: "🍝",
    category: "Noodle",
    isAvailable: true,
  },
  {
    id: "m5",
    name: "Mie Gacoan (Lv 6–8)",
    description: "Mie pedas manis level 6 sampai 8.",
    price: 12000,
    image: "🍝",
    category: "Noodle",
    isAvailable: true,
  },
  
  // Dimsum
  {
    id: "d1",
    name: "Siomay / Udang Rambutan / Keju / Lumpia",
    description: "Pilihan dimsum lezat favorit Gacoan.",
    price: 10000,
    image: "🥟",
    category: "Dimsum",
    isAvailable: true,
  },
  {
    id: "d2",
    name: "Pangsit Goreng",
    description: "Pangsit renyah isi ayam cincang gurih.",
    price: 11000,
    image: "🥟",
    category: "Dimsum",
    isAvailable: true,
  },

  // Beverage
  {
    id: "b1",
    name: "Es Gobak Sodor / Es Petak Umpet",
    description: "Minuman es segar pelepas dahaga.",
    price: 10000,
    image: "🍹",
    category: "Beverage",
    isAvailable: true,
  },
  {
    id: "b2",
    name: "Es Teklek / Es Sluku Bathok / Lemon Tea",
    description: "Minuman teh segar pilihan.",
    price: 7000,
    image: "🧊",
    category: "Beverage",
    isAvailable: true,
  },
  {
    id: "b3",
    name: "Chocoan / Vanilla / Thai Tea / Green Thai",
    description: "Minuman manis creamy.",
    price: 9000,
    image: "🥤",
    category: "Beverage",
    isAvailable: true,
  },
  {
    id: "b4",
    name: "Teh Tarik",
    description: "Teh tarik autentik.",
    price: 7500,
    image: "☕",
    category: "Beverage",
    isAvailable: true,
  },
  {
    id: "b5",
    name: "Orange",
    description: "Minuman rasa jeruk segar.",
    price: 6000,
    image: "🍊",
    category: "Beverage",
    isAvailable: true,
  },
  {
    id: "b6",
    name: "Teh / Air Mineral",
    description: "Minuman ringan penyegar.",
    price: 5000,
    image: "💧",
    category: "Beverage",
    isAvailable: true,
  },
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: "d1",
    name: "Budi Santoso",
    restoName: "Mie Gacoan Setiabudi",
    status: "menunggu_customer",
    rating: 4.8,
    slotsFilled: 2,
    maxSlots: 5,
    eta: "15 Menit",
  },
  {
    id: "d2",
    name: "Andi Wijaya",
    restoName: "Mie Gacoan Setiabudi",
    status: "menunggu_customer",
    rating: 4.9,
    slotsFilled: 4,
    maxSlots: 5,
    eta: "5 Menit",
  },
  {
    id: "d3",
    name: "Siti Rahma",
    restoName: "Mie Gacoan Setiabudi",
    status: "mengantar_pesanan",
    rating: 5.0,
    slotsFilled: 5,
    maxSlots: 5,
    eta: "0 Menit",
  },
  {
    id: "d4",
    name: "Joko Anwar",
    restoName: "Mie Gacoan Setiabudi",
    status: "mengantri_di_kasir",
    rating: 4.7,
    slotsFilled: 5,
    maxSlots: 5,
    eta: "0 Menit",
  },
  {
    id: "d5",
    name: "Ayu Lestari",
    restoName: "Mie Gacoan Setiabudi",
    status: "menunggu_pesanan",
    rating: 4.9,
    slotsFilled: 5,
    maxSlots: 5,
    eta: "0 Menit",
  },
];
