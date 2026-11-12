import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import HeroLookbook from './components/HeroLookbook.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import ProductModal from './components/ProductModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import WhatsAppFab from './components/WhatsAppFab.jsx';
import Footer from './components/Footer.jsx';
import { getMode, listProducts } from './services/productService.js';
import { useCart } from './context/CartContext.jsx';
import { getPriceRange } from './utils/pricing.js';

const ALL = 'Todo';

export default function App() {
  const { sync } = useCart();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null);
  const [category, setCategory] = useState(ALL);
  const [sort, setSort] = useState('destacados');
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const [list, m] = await Promise.all([listProducts(), getMode()]);
      setProducts(list);
      setMode(m);
      sync(list);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'No se pudo cargar el catálogo.');
      setStatus('error');
    }
  }, [sync]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => [ALL, ...new Set(products.map((p) => p.categoria))], [products]);

  const visible = useMemo(() => {
    const list = category === ALL ? [...products] : products.filter((p) => p.categoria === category);
    if (sort === 'menor') list.sort((a, b) => getPriceRange(a).minFinal - getPriceRange(b).minFinal);
    if (sort === 'mayor') list.sort((a, b) => getPriceRange(b).minFinal - getPriceRange(a).minFinal);
    return list;
  }, [products, category, sort]);

  const openCart = useCallback(() => setCartOpen(true), []);

  return (
    <>
      <a className="skip-link" href="#catalogo">
        Saltar al catálogo
      </a>
      <Header onOpenCart={openCart} />
      <main>
        <HeroLookbook />
        <section id="catalogo" className="catalog container" aria-labelledby="catalogo-titulo">
          <div className="catalog__head">
            <h2 id="catalogo-titulo" className="catalog__title">
              Colección
            </h2>
            {status === 'ready' && (
              <p className="catalog__count num">
                {visible.length} {visible.length === 1 ? 'prenda' : 'prendas'}
              </p>
            )}
          </div>
          <CategoryFilter
            categories={categories}
            active={category}
            onChange={setCategory}
            sort={sort}
            onSortChange={setSort}
            disabled={status !== 'ready'}
          />
          <ProductGrid
            products={visible}
            status={status}
            error={error}
            onRetry={load}
            onSelect={setSelected}
            onResetFilter={() => setCategory(ALL)}
            filtered={category !== ALL}
          />
        </section>
      </main>
      <Footer mode={mode} />
      <WhatsAppFab />
      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onAdded={() => {
          setSelected(null);
          setCartOpen(true);
        }}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
