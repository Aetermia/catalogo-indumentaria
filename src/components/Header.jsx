import { config } from '../data/config.js';
import { useCart } from '../context/CartContext.jsx';
import { BagIcon } from './Icons.jsx';
import './Header.css';

export default function Header({ onOpenCart }) {
  const { totals } = useCart();
  const count = totals.units;

  return (
    <header className="header">
      <div className="header__inner container">
        <a className="header__brand" href="#top">
          {config.marca}
        </a>
        <nav className="header__nav" aria-label="Principal">
          <a href="#catalogo">Colección</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <button
          type="button"
          className="header__cart"
          onClick={onOpenCart}
          aria-label={`Abrir carrito, ${count} ${count === 1 ? 'prenda' : 'prendas'}`}
        >
          <BagIcon />
          <span className="header__cart-label">Carrito</span>
          <span className="header__count num" aria-hidden="true">
            {count}
          </span>
        </button>
      </div>
    </header>
  );
}
