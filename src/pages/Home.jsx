import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './Home.css';

const API = 'http://localhost:3001/api';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products?featured=true&limit=4`).then(r => r.json()),
      fetch(`${API}/products/categories`).then(r => r.json())
    ]).then(([prodData, catData]) => {
      setFeatured(prodData.products || []);
      setCategories(catData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const features = [
    { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders over $100' },
    { icon: <Shield size={24} />, title: 'Secure Payments', desc: '256-bit encryption' },
    { icon: <Zap size={24} />, title: 'Fast Delivery', desc: '2-3 business days' },
    { icon: <Sparkles size={24} />, title: 'Premium Quality', desc: 'Guaranteed authentic' },
  ];

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-grid-pattern" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="container hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="hero-badge badge badge-accent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles size={14} /> New Collection 2024
            </motion.span>
            <h1 className="hero-title">
              Elevate Your
              <span className="hero-accent"> Style</span>
            </h1>
            <p className="hero-subtitle">
              Discover curated premium products crafted for the modern lifestyle.
              Quality meets aesthetics in every detail.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/catalog?category=accessories" className="btn btn-secondary btn-lg">
                Explore Collections
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="hero-image-wrapper"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-image-card glass">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600" alt="Hero" />
              <div className="hero-image-glow" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features section">
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature-item glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Explore our curated collections</p>
          </motion.div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link to={`/catalog?category=${cat.slug}`} className="category-card card">
                  <div className="category-card-bg" />
                  <div className="category-card-content">
                    <h3>{cat.name}</h3>
                    <p>{cat.product_count} products</p>
                    <span className="category-link">
                      Browse <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Featured Products</h2>
            <Link to="/catalog" className="section-link">
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className="products-grid">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
              ))
              : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section section">
        <div className="container">
          <motion.div
            className="cta-card glass-strong"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="cta-glow" />
            <h2>Join the OneStopShop Experience</h2>
            <p>Get early access to new releases, exclusive offers, and curated picks.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Account <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
