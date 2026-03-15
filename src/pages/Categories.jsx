import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../lib/tebex';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories(true)
      .then(setCategories)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Could not load categories</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: '1.75rem', color: 'var(--text-bright)', marginBottom: '0.5rem' }}>All Categories</h1>
      <p className="page-desc">Browse products by category</p>

      {categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.id}`} className="category-card glass-panel">
              <h3>{cat.name}</h3>
              <span className="category-count">{cat.packages?.length ?? 0} products</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-panel">
          <p className="empty-state">No categories yet. Create categories in your Tebex dashboard.</p>
        </div>
      )}
    </div>
  );
}
