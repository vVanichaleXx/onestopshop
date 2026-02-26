import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, ArrowRight } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">ONESTOPSHOP</span>
            </div>
            <p className="footer-desc">
              Premium shopping experience with curated collections for the modern lifestyle.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link"><Instagram size={18} /></a>
              <a href="#" className="social-link"><Twitter size={18} /></a>
              <a href="#" className="social-link"><Mail size={18} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/catalog?category=electronics">Electronics</Link>
            <Link to="/catalog?category=clothing">Clothing</Link>
            <Link to="/catalog?category=accessories">Accessories</Link>
            <Link to="/catalog?category=home-living">Home & Living</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>

          <div className="footer-col">
            <h4>Newsletter</h4>
            <p className="newsletter-text">Get exclusive offers and early access to drops.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="your@email.com" className="input" />
              <button className="btn btn-primary btn-icon newsletter-btn">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 OneStopShop. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
