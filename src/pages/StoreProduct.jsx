import { useMemo, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function StoreProduct() {
  const { id } = useParams();
  const ctx = useOutletContext() || {};
  const { allProducts: ctxProducts = [], categories: ctxCategories = [] } = ctx;
  const { allProducts: storeProducts = [], categories: storeCategories = [], loaded } = useStoreData();
  const allProducts = ctxProducts.length ? ctxProducts : storeProducts;
  const categories = ctxCategories.length ? ctxCategories : storeCategories;

  const pkg = useMemo(() => {
    return allProducts.find(p => String(p.id) === String(id))
      || categories.flatMap(c => (c.packages || []).map(p => ({ ...p, category: c }))).find(p => String(p.id) === String(id));
  }, [id, allProducts, categories]);

  const [buyLoading, setBuyLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  const handleBuy = async () => {
    if (!pkg || buyLoading) return;
    setBuyLoading(true);
    try {
      const result = await addToCart(pkg.id, { goToCheckout: true });
      if (!result.success && result.error) throw new Error(result.error);
    } catch (err) {
      alert(err.message || 'Checkout failed. Make sure the API server is running (npm run dev:full).');
    } finally {
      setBuyLoading(false);
    }
  };

  const relatedProducts = (pkg && pkg.category ? categories
    .flatMap(c => (c.packages || []).map(p => ({ ...p, category: c })))
    .filter(p => p.id !== pkg.id && p.category?.id === pkg.category?.id)
    .slice(0, 4) : []);

  if (!pkg) {
    if (!loaded) {
      return (
        <div className="store-content">
          <div className="cart-loading" style={{ padding: '3rem' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="store-content">
        <div className="product-not-found">
          <h2>Product not found</h2>
          <p>This product may have been removed or the link is incorrect.</p>
          <Link to="/store" className="btn btn-primary">
            <ArrowLeft size={18} />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = pkg.image || pkg.media?.[0]?.url;
  const media = pkg.media || [];
  const images = media.filter(m => m.type === 'image').map(m => m.url);
  if (imageUrl && !images.includes(imageUrl)) images.unshift(imageUrl);
  if (images.length === 0 && imageUrl) images.push(imageUrl);
  const price = pkg.total_price ?? pkg.base_price ?? 0;
  const currency = pkg.currency || 'USD';

  return (
    <div className="store-content product-page">
      <Link to="/store" className="back-link">
        <ArrowLeft size={18} />
        Back to store
      </Link>

      <div className="product-detail">
        <div className="product-gallery">
          <div className="gallery-main">
            {images[0] ? (
              <img src={images[selectedImage] || images[0]} alt={pkg.name} />
            ) : (
              <div className="product-placeholder large">
                <span>DDR</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.slice(0, 5).map((url, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${selectedImage === i ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          {pkg.category && (
            <Link to={`/store/category/${pkg.category.id}`} className="product-category-tag">
              {pkg.category.name}
            </Link>
          )}
          <h1>{pkg.name}</h1>
          <div className="product-detail-price-row">
            <span className="product-detail-price">{currency} {price.toFixed(2)}</span>
            {pkg.discount > 0 && (
              <span className="product-detail-badge">Save {Math.round(pkg.discount)}%</span>
            )}
          </div>
          {pkg.description && (
            <div
              className="product-description"
              dangerouslySetInnerHTML={{ __html: pkg.description }}
            />
          )}
          <button onClick={handleBuy} className="btn btn-primary btn-lg btn-block" disabled={buyLoading}>
            <ShoppingCart size={20} />
            {buyLoading ? 'Processing...' : 'Add to Cart — ' + currency + ' ' + price.toFixed(2)}
          </button>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <h2>You may also like</h2>
          <div className="product-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} pkg={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
