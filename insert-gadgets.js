const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "server", "shop.db"));

const products = [
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
  }
];

const insertProd = db.prepare(
  `INSERT OR IGNORE INTO products (name, slug, description, price, original_price, image, category_id, stock, featured, rating, reviews_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
    p.reviews_count
  );
}

console.log("Inserted new gadgets");
