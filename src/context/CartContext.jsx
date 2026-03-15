import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CART_KEY = 'ddr_basket_ident';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [basketIdent, setBasketIdentState] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(CART_KEY) : null
  );
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const setBasketIdent = useCallback((ident) => {
    setBasketIdentState(ident);
    if (typeof window !== 'undefined') {
      if (ident) sessionStorage.setItem(CART_KEY, ident);
      else sessionStorage.removeItem(CART_KEY);
    }
  }, []);

  const fetchCartCount = useCallback(async () => {
    if (!basketIdent) {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch(`/api/basket/${basketIdent}`);
      if (res.ok) {
        const basket = await res.json();
        const count = (basket.packages || []).reduce((sum, p) => sum + (p.qty || 1), 0);
        setCartCount(count);
      } else {
        setBasketIdent(null);
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  }, [basketIdent, setBasketIdent]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const addToCart = useCallback(async (packageId, options = {}) => {
    if (loading) return { success: false };
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          returnUrl: window.location.origin,
          basketIdent: basketIdent || undefined,
          goToCheckout: options.goToCheckout || false,
        }),
      });
      const data = await res.json();
      if (data.authRequired && data.authUrl) {
        setBasketIdent(data.basketIdent);
        window.location.href = data.authUrl;
        return { success: true, redirecting: true };
      }
      if (!res.ok) throw new Error(data.error || 'Failed to add to cart');
      setBasketIdent(data.basketIdent);
      setCartCount((c) => c + 1);
      if (options.goToCheckout && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return { success: true, redirecting: true };
      }
      return { success: true, checkoutUrl: data.checkoutUrl };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [basketIdent, loading, setBasketIdent]);

  const checkout = useCallback(async () => {
    if (!basketIdent) return null;
    try {
      const res = await fetch(`/api/basket/${basketIdent}`);
      if (!res.ok) return null;
      const basket = await res.json();
      const url = basket.links?.checkout;
      if (url) {
        window.location.href = url;
        return url;
      }
      return null;
    } catch {
      return null;
    }
  }, [basketIdent]);

  const clearCart = useCallback(() => {
    setBasketIdent(null);
    setCartCount(0);
  }, [setBasketIdent]);

  return (
    <CartContext.Provider
      value={{
        basketIdent,
        setBasketIdent,
        cartCount,
        addToCart,
        checkout,
        clearCart,
        fetchCartCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
