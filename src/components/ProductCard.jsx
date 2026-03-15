import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Eye, ShoppingCart, Check } from 'lucide-react';

export default function ProductCard({ pkg, buyNow }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const imageUrl = pkg.image || pkg.media?.[0]?.url;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setAdded(false);
    try {
      const result = await addToCart(pkg.id, { goToCheckout: !!buyNow });
      if (result.success && result.redirecting) return;
      if (result.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert(err.message || 'Failed to add to cart. Make sure the API server is running (npm run dev:full).');
    } finally {
      setLoading(false);
    }
  };

  const price = pkg.total_price ?? pkg.base_price ?? 0;
  const currency = pkg.currency || 'USD';
  const hasPrice = typeof price === 'number' && !Number.isNaN(price);
  const priceDisplay = hasPrice ? `${currency} ${price.toFixed(2)}` : 'View for price';

  return (
    <article className="product-card">
      <Link to={`/store/product/${pkg.id}`} className="product-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={pkg.name} />
        ) : (
          <div className="product-placeholder">
            <span>DDR</span>
          </div>
        )}
        {pkg.discount > 0 && (
          <span className="product-badge">-{Math.round(pkg.discount)}%</span>
        )}
      </Link>
      <div className="product-card-body">
        <h3 className="product-card-name">{pkg.name}</h3>
        <p className="product-card-price">{priceDisplay}</p>
        <div className="product-card-actions">
          <Link to={`/store/product/${pkg.id}`} className="btn btn-ghost btn-sm">
            <Eye size={16} />
            View
          </Link>
          <button onClick={handleAddToCart} className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? '...' : added ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> {buyNow ? 'Buy Now' : 'Add to Cart'}</>}
          </button>
        </div>
      </div>
    </article>
  );
}
