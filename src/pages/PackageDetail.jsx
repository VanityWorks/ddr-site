import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategories } from '../lib/tebex';

export default function PackageDetail() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories(true)
      .then(cats => {
        const found = cats
          .flatMap(c => c.packages || [])
          .find(p => String(p.id) === String(id));
        setPkg(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!pkg || buyLoading) return;
    setBuyLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error(data.error || 'Checkout failed');
    } catch (err) {
      alert(err.message || 'Checkout failed. Make sure the API server is running.');
    } finally {
      setBuyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="page-error">
        <h2>Product not found</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'This product does not exist.'}</p>
        <Link to="/categories" className="back-link">← Back to store</Link>
      </div>
    );
  }

  const imageUrl = pkg.image || pkg.media?.[0]?.url;
  const price = pkg.total_price ?? pkg.base_price ?? 0;
  const currency = pkg.currency || 'USD';

  return (
    <div className="page">
      <Link to="/categories" className="back-link">← Back to store</Link>

      <div className="package-detail">
        <div className="glass-panel">
          <div className="package-detail-media">
            {imageUrl ? (
              <img src={imageUrl} alt={pkg.name} />
            ) : (
              <div className="product-placeholder large">◈</div>
            )}
          </div>
        </div>
        <div className="glass-panel package-detail-info">
          <h1>{pkg.name}</h1>
          {pkg.category && (
            <Link to={`/category/${pkg.category.id}`} style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {pkg.category.name}
            </Link>
          )}
          <p className="package-price">{currency} {price.toFixed(2)}</p>
          <button onClick={handleBuy} className="btn btn-primary btn-lg" disabled={buyLoading}>
            {buyLoading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
