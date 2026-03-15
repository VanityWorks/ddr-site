import { useEffect, useState, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { getCategory } from '../lib/tebex';
import ProductCard from '../components/ProductCard';

function filterAndSort(products, search, sort) {
  let filtered = products;
  if (search?.trim()) {
    const q = search.toLowerCase().trim();
    filtered = products.filter(p =>
      p.name?.toLowerCase().includes(q)
    );
  }
  return [...filtered].sort((a, b) => {
    switch (sort) {
      case 'name': return (a.name || '').localeCompare(b.name || '');
      case 'name-desc': return (b.name || '').localeCompare(a.name || '');
      case 'price': return (a.total_price ?? a.base_price ?? 0) - (b.total_price ?? b.base_price ?? 0);
      case 'price-desc': return (b.total_price ?? b.base_price ?? 0) - (a.total_price ?? a.base_price ?? 0);
      default: return 0;
    }
  });
}

export default function StoreCategory() {
  const { id } = useParams();
  const { search = '', sort = 'name' } = useOutletContext() || {};
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategory(id)
      .then(setCategory)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const products = useMemo(() => {
    const list = category?.packages || [];
    return filterAndSort(list, search, sort);
  }, [category, search, sort]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="store-content">
        <div className="glass-panel">
          <h2>Category not found</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error || 'This category does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-content">
      <div className="store-header">
        <h1>{category.name}</h1>
        <p className="store-subtitle">{products.length} products</p>
      </div>
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map(pkg => (
            <ProductCard key={pkg.id} pkg={{ ...pkg, category }} />
          ))}
        </div>
      ) : (
        <div className="glass-panel empty-store">
          <p>No products in this category match your search.</p>
        </div>
      )}
    </div>
  );
}
