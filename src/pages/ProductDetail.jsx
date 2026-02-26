import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const API = 'http://localhost:3001/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    setAdded(false);
    fetch(`${API}/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        setRelated(data.related || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="product-detail-page container">
        <div className="product-detail-grid">
          <div className="skeleton" style={{ height: 500, borderRadius: 'var(--radius-lg)' }} />
          <div>
            <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 24, width: '100%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 24, width: '80%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 50, width: '40%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page container" style={{ textAlign: 'center', paddingTop: 200 }}>
        <p>Product not found</p>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Shop</Link>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/catalog" className="back-link">
          <ArrowLeft size={18} /> Back to Shop
        </Link>

        <div className="product-detail-grid">
          <motion.div
            className="product-image-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="product-main-image card">
              <img src={product.image} alt={product.name} />
              {discount > 0 && (
                <span className="product-discount badge badge-accent">-{discount}%</span>
              )}
            </div>
          </motion.div>

          <motion.div
            className="product-info-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="product-detail-category">{product.category_name}</span>
            <h1 className="product-detail-name">{product.name}</h1>

            <div className="product-detail-rating">
              <div className="stars">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.floor(product.rating) ? 'var(--accent)' : 'none'} stroke="var(--accent)" />
                ))}
              </div>
              <span>{product.rating}</span>
              <span className="review-count">({product.reviews_count} reviews)</span>
            </div>

            <div className="product-detail-price">
              <span className="detail-price-current">${product.price.toFixed(2)}</span>
              {product.original_price && (
                <span className="detail-price-original">${product.original_price.toFixed(2)}</span>
              )}
            </div>

            <p className="product-detail-desc">{product.description}</p>

            <div className="product-detail-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <motion.button
                className={`btn btn-primary btn-lg add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingBag size={18} />
                {added ? 'Added!' : 'Add to Cart'}
              </motion.button>
            </div>

            <div className="product-perks">
              <div className="perk"><Truck size={18} /> Free shipping over $100</div>
              <div className="perk"><Shield size={18} /> 2-year warranty</div>
              <div className="perk"><RotateCcw size={18} /> 30-day returns</div>
            </div>

            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock"><span className="stock-dot" /> In stock ({product.stock} left)</span>
              ) : (
                <span className="out-of-stock">Out of stock</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="related-section section">
            <h2 className="section-title">You May Also Like</h2>
            <div className="products-grid" style={{ marginTop: 'var(--space-xl)' }}>
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
