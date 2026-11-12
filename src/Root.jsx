import { useEffect, useState } from 'react';
import App from './App.jsx';
import AdminApp from './AdminApp.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { config } from './data/config.js';

const isAdminHash = () => window.location.hash.startsWith('#admin');

export default function Root() {
  const [admin, setAdmin] = useState(isAdminHash);

  useEffect(() => {
    const onHash = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!admin) document.title = `${config.marca} · Catálogo`;
  }, [admin]);

  if (admin) return <AdminApp />;
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}
