const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const db = new Database(path.join(__dirname, "shop.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    original_price REAL,
    image TEXT,
    images TEXT,
    category_id INTEGER REFERENCES categories(id),
    stock INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    total REAL NOT NULL,
    shipping_name TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_zip TEXT,
    shipping_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, product_id)
  );
`);

// Seed data
function seed() {
  const userCount = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get().count;
  if (userCount > 0) return;

  // Admin user
  const adminHash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
  ).run("Admin", "admin@onestopshop.com", adminHash, "admin");

  // Demo customer
  const customerHash = bcrypt.hashSync("customer123", 10);
  db.prepare(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
  ).run("John Doe", "john@example.com", customerHash, "customer");

  // Categories
  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Latest gadgets and tech",
    },
    {
      name: "Clothing",
      slug: "clothing",
      description: "Premium fashion collection",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Watches, bags & more",
    },
    {
      name: "Home & Living",
      slug: "home-living",
      description: "Luxury home essentials",
    },
  ];

  const insertCat = db.prepare(
    `INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)`,
  );
  for (const c of categories) {
    insertCat.run(c.name, c.slug, c.description);
  }

  // Products
  const products = [
    {
      name: "Wireless Pro Headphones",
      slug: "wireless-pro-headphones",
      description:
        "Premium noise-cancelling headphones with 40-hour battery life, spatial audio, and ultra-comfortable memory foam cushions.",
      price: 349.99,
      original_price: 449.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      category_id: 1,
      stock: 25,
      featured: 1,
      rating: 4.8,
      reviews_count: 234,
    },
    {
      name: "Smart Watch Ultra",
      slug: "smart-watch-ultra",
      description:
        "Advanced smartwatch with health monitoring, GPS, and titanium case. Water resistant to 100m.",
      price: 599.99,
      original_price: 699.99,
      image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600",
      category_id: 1,
      stock: 15,
      featured: 1,
      rating: 4.9,
      reviews_count: 189,
    },
    {
      name: "Minimalist Laptop Stand",
      slug: "minimalist-laptop-stand",
      description:
        "Ergonomic aluminum laptop stand with adjustable height and cable management.",
      price: 89.99,
      original_price: null,
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
      category_id: 1,
      stock: 50,
      featured: 0,
      rating: 4.5,
      reviews_count: 67,
    },
    {
      name: "Ultra-thin Magsafe Power Bank",
      slug: "ultra-thin-power-bank",
      description: "Fast-charging 10000mAh magnetic power bank. Sleek aluminum finish.",
      price: 59.99,
      original_price: 79.99,
      image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?w=600",
      category_id: 1,
      stock: 45,
      featured: 0,
      rating: 4.8,
      reviews_count: 312,
    },
    {
      name: "Mechanical Gaming Keyboard",
      slug: "mechanical-gaming-keyboard",
      description: "Hot-swappable mechanical keyboard with RGB backlighting and custom tactile switches.",
      price: 149.99,
      original_price: null,
      image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600",
      category_id: 1,
      stock: 20,
      featured: 1,
      rating: 4.9,
      reviews_count: 89,
    },
    {
      name: "Pro 4K Streaming Webcam",
      slug: "pro-4k-webcam",
      description: "Crystal clear 4K video with autofocus and built-in noise reducing microphones.",
      price: 129.99,
      original_price: 159.99,
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600",
      category_id: 1,
      stock: 15,
      featured: 0,
      rating: 4.6,
      reviews_count: 45,
    },
    {
      name: "Premium Leather Jacket",
      slug: "premium-leather-jacket",
      description:
        "Hand-crafted Italian leather jacket with silk lining. Timeless design for the modern gentleman.",
      price: 899.99,
      original_price: 1200.0,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
      category_id: 2,
      stock: 10,
      featured: 1,
      rating: 4.7,
      reviews_count: 45,
    },
    {
      name: "Cashmere Sweater",
      slug: "cashmere-sweater",
      description:
        "Ultra-soft 100% cashmere sweater. Available in multiple colors.",
      price: 259.99,
      original_price: 320.0,
      image:
        "https://images.unsplash.com/photo-1434389677669-e08b4cda3a30?w=600",
      category_id: 2,
      stock: 30,
      featured: 0,
      rating: 4.6,
      reviews_count: 112,
    },
    {
      name: "Designer Silk Scarf",
      slug: "designer-silk-scarf",
      description:
        "Hand-printed pure silk scarf with exclusive geometric pattern.",
      price: 179.99,
      original_price: null,
      image:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600",
      category_id: 2,
      stock: 20,
      featured: 0,
      rating: 4.4,
      reviews_count: 38,
    },
    {
      name: "Titanium Chronograph",
      slug: "titanium-chronograph",
      description:
        "Swiss-made chronograph with sapphire crystal and titanium bracelet. Limited edition.",
      price: 2499.99,
      original_price: 3200.0,
      image:
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
      category_id: 3,
      stock: 5,
      featured: 1,
      rating: 4.9,
      reviews_count: 28,
    },
    {
      name: "Leather Messenger Bag",
      slug: "leather-messenger-bag",
      description:
        "Full-grain leather messenger bag with padded laptop compartment and brass hardware.",
      price: 449.99,
      original_price: null,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
      category_id: 3,
      stock: 18,
      featured: 0,
      rating: 4.7,
      reviews_count: 93,
    },
    {
      name: "Polarized Aviator Sunglasses",
      slug: "polarized-aviator-sunglasses",
      description:
        "Classic aviator design with polarized lenses and lightweight titanium frame.",
      price: 199.99,
      original_price: 249.99,
      image:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      category_id: 3,
      stock: 40,
      featured: 0,
      rating: 4.5,
      reviews_count: 156,
    },
    {
      name: "Artisan Ceramic Vase",
      slug: "artisan-ceramic-vase",
      description:
        "Handmade ceramic vase with reactive glaze finish. Each piece is unique.",
      price: 129.99,
      original_price: null,
      image:
        "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600",
      category_id: 4,
      stock: 12,
      featured: 0,
      rating: 4.8,
      reviews_count: 41,
    },
    {
      name: "Luxury Scented Candle Set",
      slug: "luxury-scented-candle-set",
      description:
        "Set of 3 hand-poured soy candles in premium glass vessels. Notes of sandalwood, vanilla, and amber.",
      price: 89.99,
      original_price: 110.0,
      image:
        "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600",
      category_id: 4,
      stock: 35,
      featured: 1,
      rating: 4.6,
      reviews_count: 87,
    },
    {
      name: "Merino Wool Throw Blanket",
      slug: "merino-wool-throw-blanket",
      description:
        "Luxuriously soft merino wool throw in a classic herringbone pattern.",
      price: 199.99,
      original_price: 250.0,
      image:
        "https://images.unsplash.com/photo-1580301762395-21ce6d555b43?w=600",
      category_id: 4,
      stock: 22,
      featured: 0,
      rating: 4.7,
      reviews_count: 64,
    },
  ];

  const insertProd = db.prepare(
    `INSERT INTO products (name, slug, description, price, original_price, image, category_id, stock, featured, rating, reviews_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const p of products) {
    insertProd.run(
      p.name,
      p.slug,
      p.description,
      p.price,
      p.original_price,
      p.image,
      p.category_id,
      p.stock,
      p.featured,
      p.rating,
      p.reviews_count,
    );
  }

  console.log("✅ Database seeded successfully");
}

seed();

module.exports = db;
