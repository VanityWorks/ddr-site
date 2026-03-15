import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategory } from '../lib/tebex';
import ProductCard from '../components/ProductCard';

export default function CategoryDetail() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategory(id)
      .then(setCategory)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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
      <div className="page-error">
        <h2>Category not found</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'This category does not exist.'}</p>
        <Link to="/categories" className="back-link">← Back to categories</Link>
      </div>
    );
  }

  const packages = category.packages || [];

  return (
    <div className="page">
      <Link to="/categories" className="back-link">← Categories</Link>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--text-bright)', marginBottom: '1.5rem' }}>{category.name}</h1>

      {packages.length > 0 ? (
        <div className="product-grid">
          {packages.map(pkg => (
            <ProductCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="glass-panel">
          <p className="empty-state">No products in this category yet.</p>
        </div>
      )}
    </div>
  );
}
