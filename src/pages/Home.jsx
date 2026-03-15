import { Link } from 'react-router-dom';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import { Code2, Shield, Zap, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Home() {
  const { categories, error } = useStoreData();
  const featuredProducts = categories.flatMap(c => c.packages || []).slice(0, 6);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-label">Made w/ care (and caffiene)</span>
          <h1>High Quality.<br />Built for the people.</h1>
          <p className="hero-desc">
            Scripts & Resources made for your eaze, and customization. We provide support for everything.
          </p>
          <div className="hero-actions">
            <Link to="/store" className="btn btn-primary btn-lg">
              <ShoppingBag size={20} />
              Browse Store
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg">
              About Us
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Code2 size={28} strokeWidth={1.5} /></div>
            <h3>Fair Prices</h3>
            <p>I don't believe in over charging for assets, I believe in fair prices.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={28} strokeWidth={1.5} /></div>
            <h3>Support & Control</h3>
            <p>I provide full support for everything, as well as giving you control, to customize everything.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={28} strokeWidth={1.5} /></div>
            <h3>Updates & Fixes</h3>
            <p>I make sure everything always works, and is up to standard.</p>
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="about-preview">
        <div className="about-preview-inner">
          <h2>Who am I</h2>
          <p>
            I'm a solo developer who believes in releasing high quality assets, that you OWN, and you can make your own,
            whilst not charging an arm and a leg for said resources.
          </p>
          <p>
            Support is ALWAYS given, and I am always understanding.
          </p>
          <Link to="/about" className="link-arrow">
            Learn more about me.
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="featured">
        <div className="featured-header">
          <h2>Featured Products</h2>
          <Link to="/store" className="view-all">View all</Link>
        </div>
        {error ? (
          <div className="empty-state">
            <p>Could not load products. {error}</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid featured-grid">
            {featuredProducts.map(pkg => (
              <ProductCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No products yet. Add packages in your Tebex dashboard.</p>
            <Link to="/store" className="btn btn-primary">Browse Store</Link>
          </div>
        )}
      </section>
    </div>
  );
}
