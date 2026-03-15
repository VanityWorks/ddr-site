import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setBasketIdent, fetchCartCount } = useCart();
  const [status, setStatus] = useState('loading'); // loading | redirecting | error
  const [error, setError] = useState(null);

  useEffect(() => {
    const basketIdent = searchParams.get('basketIdent');
    const packageId = searchParams.get('packageId');
    const goToCheckout = searchParams.get('goToCheckout') === '1';

    if (!basketIdent || !packageId) {
      setStatus('error');
      setError('Missing basket or package info');
      return;
    }

    fetch('/api/checkout/continue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basketIdent, packageId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.checkoutUrl) {
          setBasketIdent(data.basketIdent);
          fetchCartCount();
          setStatus('redirecting');
          if (goToCheckout) {
            window.location.href = data.checkoutUrl;
          } else {
            window.location.href = '/cart';
          }
        } else {
          throw new Error(data.error || 'Failed to add to cart');
        }
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message || 'Something went wrong');
      });
  }, [searchParams, setBasketIdent, fetchCartCount]);

  if (status === 'error') {
    return (
      <div className="page page-about">
        <div className="page-about-inner">
          <h1>Checkout Error</h1>
          <p className="page-tagline">{error}</p>
          <Link to="/store" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-loading">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)' }}>
        {status === 'redirecting' ? 'Redirecting to checkout...' : 'Adding to cart...'}
      </p>
    </div>
  );
}
