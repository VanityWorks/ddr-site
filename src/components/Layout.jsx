import { Link, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Home, Store, Info, ShoppingCart } from 'lucide-react';

export default function Layout() {
  const { cartCount } = useCart();
  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">DDR</Link>
          <nav className="nav">
            <Link to="/" className="nav-link">
              <Home size={18} />
              <span className="nav-text">Home</span>
            </Link>
            <Link to="/store" className="nav-link">
              <Store size={18} />
              <span className="nav-text">Store</span>
            </Link>
            <Link to="/about" className="nav-link">
              <Info size={18} />
              <span className="nav-text">About</span>
            </Link>
            <Link to="/cart" className="nav-link nav-cart">
              <ShoppingCart size={18} />
              <span className="nav-text">Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <Link to="/" className="footer-logo">DDR</Link>
          <span>© {new Date().getFullYear()} DevDoneRight</span>
        </div>
      </footer>
    </div>
  );
}
