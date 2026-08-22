export type DriverStatus = "menunggu_customer" | "mengantar_pesanan" | "mengantri_di_kasir" | "menunggu_pesanan";
export type MenuCategory = "Noodle" | "Dimsum" | "Beverage";

export interface MenuOption {
  id: string;
  name: string;
  choices: string[];
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategory;
  isAvailable: boolean;
  options?: MenuOption[];
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
  // NOODLE
  {
    id: "n1", name: "Mie Suit", description: "Mie tidak pedas dengan ayam cincang dan pangsit.",
    price: 11000, image: "🍜", category: "Noodle", isAvailable: true,
  },
  {
    id: "n2", name: "Mie Hompimpa (Lv 1–4)", description: "Mie pedas gurih.",
    price: 11000, image: "🍜", category: "Noodle", isAvailable: true,
    options: [{ id: "level", name: "Level Pedas", choices: ["Level 1", "Level 2", "Level 3", "Level 4"] }]
  },
  {
    id: "n3", name: "Mie Hompimpa (Lv 6–8)", description: "Mie pedas gurih ekstra pedas.",
    price: 12000, image: "🍜", category: "Noodle", isAvailable: true,
    options: [{ id: "level", name: "Level Pedas", choices: ["Level 6", "Level 7", "Level 8"] }]
  },
  {
    id: "n4", name: "Mie Gacoan (Lv 0–4)", description: "Mie pedas manis.",
    price: 11000, image: "🍝", category: "Noodle", isAvailable: true,
    options: [{ id: "level", name: "Level Pedas", choices: ["Level 0 (Tidak Pedas)", "Level 1", "Level 2", "Level 3", "Level 4"] }]
  },
  {
    id: "n5", name: "Mie Gacoan (Lv 6–8)", description: "Mie pedas manis ekstra pedas.",
    price: 12000, image: "🍝", category: "Noodle", isAvailable: true,
    options: [{ id: "level", name: "Level Pedas", choices: ["Level 6", "Level 7", "Level 8"] }]
  },

  // DIMSUM
  { id: "d1", name: "Siomay", description: "Siomay ayam lezat.", price: 10000, image: "🥟", category: "Dimsum", isAvailable: true },
  { id: "d2", name: "Udang Rambutan", description: "Udang krispi bentuk rambutan.", price: 10000, image: "🥟", category: "Dimsum", isAvailable: true },
  { id: "d3", name: "Udang Keju", description: "Udang dengan isian keju lumer.", price: 10000, image: "🥟", category: "Dimsum", isAvailable: true },
  { id: "d4", name: "Lumpia Udang", description: "Lumpia goreng isi udang.", price: 10000, image: "🥟", category: "Dimsum", isAvailable: true },
  { id: "d5", name: "Pangsit Goreng", description: "Pangsit goreng isi ayam cincang.", price: 11000, image: "🥟", category: "Dimsum", isAvailable: true },

  // BEVERAGE
  { id: "b1", name: "Es Gobak Sodor", description: "Es buah segar pelepas dahaga.", price: 10000, image: "🍹", category: "Beverage", isAvailable: true },
  { id: "b2", name: "Es Petak Umpet", description: "Es tropical segar.", price: 10000, image: "🍹", category: "Beverage", isAvailable: true },
  { id: "b3", name: "Es Teklek", description: "Es teh susu segar.", price: 7000, image: "🧊", category: "Beverage", isAvailable: true },
  { id: "b4", name: "Es Sluku Bathok", description: "Es moka segar.", price: 7000, image: "🧊", category: "Beverage", isAvailable: true },
  {
    id: "b5", name: "Lemon Tea", description: "Teh lemon segar.", price: 7000, image: "🧊", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b6", name: "Chocoan", description: "Minuman coklat manis.", price: 9000, image: "🥤", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b7", name: "Vanilla Latte", description: "Latte rasa vanilla.", price: 9000, image: "🥤", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b8", name: "Thai Tea", description: "Teh tarik khas Thailand.", price: 9000, image: "🥤", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b9", name: "Green Thai Tea", description: "Teh hijau tarik khas Thailand.", price: 9000, image: "🥤", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b10", name: "Teh Tarik", description: "Teh susu khas.", price: 7500, image: "☕", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b11", name: "Orange", description: "Perasan jeruk manis.", price: 6000, image: "🍊", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b12", name: "Teh", description: "Teh original.", price: 5000, image: "☕", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Es)", "Panas"] }]
  },
  {
    id: "b13", name: "Air Mineral", description: "Air mineral botol.", price: 5000, image: "💧", category: "Beverage", isAvailable: true,
    options: [{ id: "temp", name: "Suhu", choices: ["Dingin (Kulkas)", "Biasa"] }]
  },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: "d1", name: "Budi Santoso", restoName: "Mie Gacoan Setiabudi", status: "menunggu_customer", rating: 4.8, slotsFilled: 2, maxSlots: 5, eta: "15 Menit" },
  { id: "d2", name: "Andi Wijaya", restoName: "Mie Gacoan Setiabudi", status: "menunggu_customer", rating: 4.9, slotsFilled: 4, maxSlots: 5, eta: "5 Menit" },
  { id: "d3", name: "Siti Rahma", restoName: "Mie Gacoan Setiabudi", status: "mengantar_pesanan", rating: 5.0, slotsFilled: 5, maxSlots: 5, eta: "0 Menit" },
  { id: "d4", name: "Joko Anwar", restoName: "Mie Gacoan Setiabudi", status: "mengantri_di_kasir", rating: 4.7, slotsFilled: 5, maxSlots: 5, eta: "0 Menit" },
  { id: "d5", name: "Ayu Lestari", restoName: "Mie Gacoan Setiabudi", status: "menunggu_pesanan", rating: 4.9, slotsFilled: 5, maxSlots: 5, eta: "0 Menit" },
];
