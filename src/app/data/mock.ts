export interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

export interface Driver {
  id: string;
  name: string;
  restoName: string;
  status: "ready" | "busy";
  rating: number;
  slotsFilled: number;
  maxSlots: number;
  eta: string;
}

export const MOCK_MENUS: Menu[] = [
  {
    id: "m1",
    name: "Mie Hompimpa",
    description: "Mie pedas gurih dengan taburan ayam cincang dan pangsit goreng.",
    price: 10000,
    image: "🍜",
    isAvailable: true,
  },
  {
    id: "m2",
    name: "Mie Gacoan",
    description: "Mie pedas manis dengan taburan ayam cincang dan pangsit goreng.",
    price: 10000,
    image: "🍝",
    isAvailable: true,
  },
  {
    id: "m3",
    name: "Dimsum Udang Rambutan",
    description: "Udang cincang dibalut kulit pangsit renyah.",
    price: 9000,
    image: "🥟",
    isAvailable: true,
  },
  {
    id: "m4",
    name: "Es Gobak Sodor",
    description: "Es manis segar dengan campuran buah dan sirup.",
    price: 9000,
    image: "🍹",
    isAvailable: true,
  },
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: "d1",
    name: "Budi Santoso",
    restoName: "Mie Gacoan Setiabudi",
    status: "ready",
    rating: 4.8,
    slotsFilled: 2,
    maxSlots: 5,
    eta: "15 Menit",
  },
  {
    id: "d2",
    name: "Andi Wijaya",
    restoName: "Mie Gacoan Setiabudi",
    status: "ready",
    rating: 4.9,
    slotsFilled: 4,
    maxSlots: 5,
    eta: "5 Menit",
  },
  {
    id: "d3",
    name: "Siti Rahma",
    restoName: "Mie Gacoan Setiabudi",
    status: "busy",
    rating: 5.0,
    slotsFilled: 5,
    maxSlots: 5,
    eta: "Sedang Mengantar",
  },
];
