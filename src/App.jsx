import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { StoreDataProvider } from './context/StoreDataContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import StoreWrapper from './components/StoreWrapper';
import Store from './pages/Store';
import StoreCategory from './pages/StoreCategory';
import StoreProduct from './pages/StoreProduct';
import About from './pages/About';
import Cart from './pages/Cart';
import AuthCallback from './pages/AuthCallback';
import ThankYou from './pages/ThankYou';
import './App.css';

function CategoryRedirect() {
  const { id } = useParams();
  return <Navigate to={`/store/category/${id}`} replace />;
}

function PackageRedirect() {
  const { id } = useParams();
  return <Navigate to={`/store/product/${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
      <StoreDataProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="store" element={<StoreWrapper />}>
            <Route index element={<Store />} />
            <Route path="category/:id" element={<StoreCategory />} />
            <Route path="product/:id" element={<StoreProduct />} />
          </Route>
          <Route path="categories" element={<Navigate to="/store" replace />} />
          <Route path="category/:id" element={<CategoryRedirect />} />
          <Route path="package/:id" element={<PackageRedirect />} />
          <Route path="about" element={<About />} />
          <Route path="cart" element={<Cart />} />
          <Route path="auth-callback" element={<AuthCallback />} />
          <Route path="thank-you" element={<ThankYou />} />
        </Route>
      </Routes>
      </StoreDataProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
