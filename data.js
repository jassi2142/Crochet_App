'use strict';

const STORAGE_KEYS = {
  PRODUCTS: 'navcreations_products',
  CART:     'navcreations_cart',
  ADMIN_SESSION: 'navcreations_admin',
};

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'crochet2024',
};

// NAV Creations product categories
const CATEGORIES = ['Earrings', 'Scrunchies', 'Hair Accessories', 'Charms & More'];

// Absolute paths to generated product images
const IMG = {
  heart:    'assets/heart_earrings.png',
  lily:     'assets/lily_flower_earring.png',
  scrunchie:'assets/green_bow_scrunchie.png',
  hairbow:  'assets/hair_bow_clip.png',
  charms:   'assets/mobile_charms.png',
  bookmark: 'assets/crochet_bookmark.png',
};

const CATEGORY_CONFIG = {
  'Earrings': {
    gradient:    'linear-gradient(145deg, #eef2ff, #c3dafe)',
    emoji:       '💙',
    accentColor: '#2563eb',
  },
  'Scrunchies': {
    gradient:    'linear-gradient(145deg, #f0fdfa, #99f6e4)',
    emoji:       '🩵',
    accentColor: '#0d9488',
  },
  'Hair Accessories': {
    gradient:    'linear-gradient(145deg, #f5f3ff, #ddd6fe)',
    emoji:       '🎀',
    accentColor: '#7c3aed',
  },
  'Charms & More': {
    gradient:    'linear-gradient(145deg, #f0f9ff, #bae6fd)',
    emoji:       '✨',
    accentColor: '#0284c7',
  },
};

// NAV Creations — Real Product Inventory
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Heart Crochet Earrings',
    description: 'Handcrafted heart-shaped earrings in deep sapphire blue yarn. A bestseller — perfect for gifting or wearing every day. Each pair is uniquely made.',
    price: 199,
    category: 'Earrings',
    stock: 8,
    available: true,
    featured: true,
    image: IMG.heart,
  },
  {
    id: 'p2',
    name: 'Lily Flower Earrings',
    description: 'Delicate lily-shaped crochet earrings in soft pink and mauve. Star-petal design with a yellow centre detail — light and elegant.',
    price: 249,
    category: 'Earrings',
    stock: 5,
    available: true,
    featured: true,
    image: IMG.lily,
  },
  {
    id: 'p3',
    name: 'Star Flower Stud Earrings',
    description: 'Mini star-flower crochet stud earrings — cute and minimalistic. Available in multiple colours on request. Customisation available.',
    price: 179,
    category: 'Earrings',
    stock: 12,
    available: true,
    featured: false,
    image: IMG.lily,
  },
  {
    id: 'p4',
    name: 'Green Bow Scrunchie',
    description: 'Chunky hunter-green crocheted bow scrunchie. Thick, stretchy, and beautiful — keeps your hair secure while looking incredibly stylish.',
    price: 149,
    category: 'Scrunchies',
    stock: 10,
    available: true,
    featured: true,
    image: IMG.scrunchie,
  },
  {
    id: 'p5',
    name: 'Floral Scrunchie Set (3 pcs)',
    description: 'Set of 3 crochet scrunchies in coordinating floral colours. Mix of solid and patterned styles — great for gifting or everyday use.',
    price: 349,
    category: 'Scrunchies',
    stock: 6,
    available: true,
    featured: false,
    image: IMG.scrunchie,
  },
  {
    id: 'p6',
    name: 'Mini Bow Scrunchie',
    description: 'Petite crochet bow scrunchie in soft cream and blush tones. Dainty and charming — perfect for half-up styles or ponytails.',
    price: 129,
    category: 'Scrunchies',
    stock: 0,
    available: false,
    featured: false,
    image: IMG.scrunchie,
  },
  {
    id: 'p7',
    name: 'White Bow Hair Clip',
    description: 'Elegant white crochet bow barrette — a soft, feminine hair clip that adds a handmade touch to any look. Secure metal clip inside.',
    price: 179,
    category: 'Hair Accessories',
    stock: 7,
    available: true,
    featured: true,
    image: IMG.hairbow,
  },
  {
    id: 'p8',
    name: 'Rose Flower Hair Pin',
    description: 'Sweet rose-shaped crochet hairpin in ocean blue. Clip it into braids, buns, or half-up styles for an instant handmade charm.',
    price: 169,
    category: 'Hair Accessories',
    stock: 9,
    available: true,
    featured: false,
    image: IMG.heart,
  },
  {
    id: 'p9',
    name: 'Butterfly Hair Clip Set',
    description: 'Set of 2 butterfly-shaped crochet hair clips in contrasting colours. Lightweight, secure, and absolutely adorable.',
    price: 199,
    category: 'Hair Accessories',
    stock: 0,
    available: false,
    featured: false,
    image: IMG.hairbow,
  },
  {
    id: 'p10',
    name: 'Mobile Phone Charms',
    description: 'Cute crochet phone charms in a range of fun colours and shapes — stars, hearts, and flowers. Customise your colour on order.',
    price: 149,
    category: 'Charms & More',
    stock: 20,
    available: true,
    featured: true,
    image: IMG.charms,
  },
  {
    id: 'p11',
    name: 'Crochet Flower Bookmark',
    description: 'Handmade crochet bookmark with a flower or bow topper. A lovely gift for book lovers — functional and decorative. Multiple colours available.',
    price: 129,
    category: 'Charms & More',
    stock: 15,
    available: true,
    featured: false,
    image: IMG.bookmark,
  },
  {
    id: 'p12',
    name: 'Keychain Charm',
    description: 'Adorable crochet keychain charm — choose from hearts, flowers, or custom shapes. A perfect personalised gift or everyday accessory.',
    price: 139,
    category: 'Charms & More',
    stock: 18,
    available: true,
    featured: false,
    image: IMG.charms,
  },
];

// ── Products ──────────────────────────────────────────────
function getProducts() {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
}
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}
function initProducts() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    saveProducts(DEFAULT_PRODUCTS);
  }
}

// ── Cart ──────────────────────────────────────────────────
function getCart() {
  const stored = localStorage.getItem(STORAGE_KEYS.CART);
  return stored ? JSON.parse(stored) : [];
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

// ── Admin Session ─────────────────────────────────────────
function isAdminLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
}
function setAdminSession(val) {
  if (val) localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
  else      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
}

// ── Helpers ───────────────────────────────────────────────
function generateId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}
