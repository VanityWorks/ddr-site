import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { basketIdent, cartCount, checkout, clearCart } = useCart();
  const [basket, setBasket] = useState(null);
  const [loading, setLoading] = useState(!!basketIdent);

  useEffect(() => {
    if (!basketIdent) {
      setBasket(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/basket/${basketIdent}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setBasket)
      .catch(() => setBasket(null))
      .finally(() => setLoading(false));
  }, [basketIdent]);

  const handleCheckout = async () => {
    const url = await checkout();
    if (!url) alert('Could not load checkout. Your cart may have expired.');
  };

  // Always show page structure instantly - no full-page loading
  if (!basketIdent) {
    return (
      <div className="page page-about">
        <div className="page-about-inner">
          <h1>Your Cart</h1>
          <div className="glass-panel">
            <p>Your cart is empty.</p>
            <Link to="/store" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !basket || (basket.packages || []).length === 0) {
    return (
      <div className="page page-about">
        <div className="page-about-inner" style={{ maxWidth: '720px' }}>
          <h1>Your Cart</h1>
          <p className="page-tagline">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
          {loading ? (
            <div className="cart-loading">
              <div className="spinner" />
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading cart...</p>
            </div>
          ) : (
            <div className="glass-panel">
              <p>Your cart is empty.</p>
              <Link to="/store" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse Store
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const packages = basket.packages || [];
  const total = basket.total_price ?? 0;
  const currency = basket.currency || 'USD';

  return (
    <div className="page page-about">
      <div className="page-about-inner" style={{ maxWidth: '720px' }}>
        <h1>Your Cart</h1>
        <p className="page-tagline">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
        <div className="glass-panel cart-items">
          {packages.map((item, i) => (
            <div key={i} className="cart-item">
              <div className="cart-item-info">
                <span className="cart-item-name">{item.package?.name || item.name || 'Package'}</span>
                <span className="cart-item-qty">× {item.qty ?? 1}</span>
              </div>
              {item.price != null && (
                <span className="cart-item-price">
                  {item.currency || currency} {Number(item.price).toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            Total: <strong>{currency} {total.toFixed(2)}</strong>
          </div>
          <div className="cart-actions">
            <button onClick={clearCart} className="btn btn-ghost">
              Clear Cart
            </button>
            <button onClick={handleCheckout} className="btn btn-primary btn-lg">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
