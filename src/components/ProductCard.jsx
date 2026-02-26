import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      className="product-card card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/product/${product.id}`} className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {discount > 0 && (
          <span className="product-discount badge badge-accent">-{discount}%</span>
        )}
        <div className="product-card-overlay">
          <button className="btn btn-icon product-wishlist">
            <Heart size={18} />
          </button>
        </div>
      </Link>

      <div className="product-card-body">
        <p className="product-category">{product.category_name || 'Uncategorized'}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-rating">
          <Star size={14} fill="var(--accent)" stroke="var(--accent)" />
          <span>{product.rating}</span>
          <span className="rating-count">({product.reviews_count})</span>
        </div>
        <div className="product-card-footer">
          <div className="product-price">
            <span className="price-current">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className="price-original">${product.original_price.toFixed(2)}</span>
            )}
          </div>
          <motion.button
            className="btn btn-primary btn-sm add-to-cart-btn"
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
          >
            <ShoppingBag size={14} /> Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
