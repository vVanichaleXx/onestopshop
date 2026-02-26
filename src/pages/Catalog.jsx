import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

const API = 'http://localhost:3001/api';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch(`${API}/products/categories`).then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);

    fetch(`${API}/products?${params.toString()}`)
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.elements.search.value;
    setSearch(val);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setSearchParams({});
  };

  return (
    <div className="catalog-page">
      <div className="catalog-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="catalog-title"
          >
            {category ? categories.find(c => c.slug === category)?.name || 'Shop' : 'All Products'}
          </motion.h1>
          <motion.form
            className="catalog-search"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Search size={20} className="search-icon" />
            <input name="search" className="input" placeholder="Search products..." defaultValue={search} />
            <button type="submit" className="btn btn-primary">Search</button>
          </motion.form>
        </div>
      </div>

      <div className="container catalog-content">
        {/* Filters bar */}
        <motion.div
          className="filters-bar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="filters-left">
            <button
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            {(category || search || sort) && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear all
              </button>
            )}
            {category && (
              <span className="filter-tag badge badge-accent">
                {categories.find(c => c.slug === category)?.name}
                <button onClick={() => setCategory('')}><X size={12} /></button>
              </span>
            )}
          </div>
          <div className="filters-right">
            <span className="results-count">{products.length} products</span>
            <select className="input sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">Sort by</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </motion.div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            className="filter-panel glass"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3>Categories</h3>
            <div className="filter-categories">
              <button
                className={`filter-cat-btn ${!category ? 'active' : ''}`}
                onClick={() => setCategory('')}
              >All</button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`filter-cat-btn ${category === c.slug ? 'active' : ''}`}
                  onClick={() => setCategory(c.slug)}
                >
                  {c.name} ({c.product_count})
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Products */}
        <div className="products-grid catalog-grid">
          {loading
            ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
            ))
            : products.length === 0
              ? <div className="no-results">
                  <p>No products found</p>
                  <button className="btn btn-primary" onClick={clearFilters}>Reset Filters</button>
                </div>
              : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </div>
    </div>
  );
}
