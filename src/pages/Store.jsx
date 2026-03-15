import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function filterAndSort(products, search, sort) {
  let filtered = products;
  if (search?.trim()) {
    const q = search.toLowerCase().trim();
    filtered = products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  }
  return [...filtered].sort((a, b) => {
    switch (sort) {
      case 'name': return (a.name || '').localeCompare(b.name || '');
      case 'name-desc': return (b.name || '').localeCompare(a.name || '');
      case 'price': return (a.total_price ?? a.base_price ?? 0) - (b.total_price ?? b.base_price ?? 0);
      case 'price-desc': return (b.total_price ?? b.base_price ?? 0) - (a.total_price ?? a.base_price ?? 0);
      default: return 0;
    }
  });
}

export default function Store() {
  const { search = '', sort = 'name', allProducts = [] } = useOutletContext() || {};
  const products = useMemo(
    () => filterAndSort(allProducts, search, sort),
    [allProducts, search, sort]
  );

  return (
    <div className="store-content">
      <div className="store-header">
        <h1>All Products</h1>
        <p className="store-subtitle">{products.length} products</p>
      </div>
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map(pkg => (
            <ProductCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="glass-panel empty-store">
          <p>No products match your search. Try a different term or browse all categories.</p>
        </div>
      )}
    </div>
  );
}
