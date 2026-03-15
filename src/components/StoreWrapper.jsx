import { Outlet } from 'react-router-dom';
import { useStoreData } from '../context/StoreDataContext';
import StoreLayout from './StoreLayout';

export default function StoreWrapper() {
  const { categories, recentPayments, allProducts, error } = useStoreData();

  if (error) {
    return (
      <div className="page-error">
        <h2>Could not load store</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  return (
    <StoreLayout categories={categories} recentPayments={recentPayments} allProducts={allProducts}>
      <Outlet />
    </StoreLayout>
  );
}
