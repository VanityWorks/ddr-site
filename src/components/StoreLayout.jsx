import { useState, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

function getInitial(name) {
  if (!name || name === 'Anonymous') return '?';
  return (name[0] || '?').toUpperCase();
}

export default function StoreLayout({ categories = [], recentPayments = [], allProducts = [] } = {}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const location = useLocation();

  const isCategoryPage = location.pathname.startsWith('/store/category/');
  const isProductPage = location.pathname.startsWith('/store/product/');
  const currentCategoryId = isCategoryPage ? location.pathname.split('/').pop() : null;

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: 'Store', path: '/store' }];
    if (isCategoryPage && currentCategoryId) {
      const cat = categories.find(c => String(c.id) === currentCategoryId);
      if (cat) crumbs.push({ label: cat.name, path: `/store/category/${cat.id}` });
    }
    if (isProductPage) crumbs.push({ label: 'Product', path: null });
    return crumbs;
  }, [location.pathname, categories, isCategoryPage, isProductPage, currentCategoryId]);

  return (
    <div className="store-layout">
      <div className="store-toolbar">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="store-toolbar-right">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
            <option value="name">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <nav className="breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="breadcrumb">
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {crumb.path ? (
              <Link to={crumb.path}>{crumb.label}</Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="store-body">
        <aside className="store-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <Link
              to="/store"
              className={`sidebar-link ${!currentCategoryId ? 'active' : ''}`}
            >
              All Products
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/store/category/${cat.id}`}
                className={`sidebar-link ${currentCategoryId === String(cat.id) ? 'active' : ''}`}
              >
                {cat.name}
                <span className="sidebar-count">{cat.packages?.length ?? 0}</span>
              </Link>
            ))}
          </div>

          {recentPayments.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Recent Purchases</h3>
              <div className="recent-list">
                {recentPayments.slice(0, 6).map((p, i) => (
                  <div key={i} className="recent-item">
                    <div className="recent-avatar">{getInitial(p.username)}</div>
                    <div className="recent-info">
                      <span className="recent-user">{p.username || 'Anonymous'}</span>
                      <span className="recent-product">{p.package?.name}</span>
                    </div>
                    {p.price != null && (
                      <span className="recent-price">{p.currency} {p.price.toFixed(2)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="store-main">
          <Outlet context={{ search, sort, allProducts, categories }} />
        </main>
      </div>
    </div>
  );
}
