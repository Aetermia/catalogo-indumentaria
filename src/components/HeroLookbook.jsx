import { config } from '../data/config.js';
import { heroImage } from '../data/catalog.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';
import './HeroLookbook.css';

export default function HeroLookbook() {
  return (
    <section id="top" className="hero container" aria-labelledby="hero-titulo">
      <div className="hero__text">
        <p className="hero__season">{config.temporada}</p>
        <h1 id="hero-titulo" className="hero__title">
          Algodón pesado, denim rígido y cuero de corte recto.
        </h1>
        <p className="hero__lead">{config.bajada} Elegí talle y color, armá el pedido y lo cerramos por WhatsApp.</p>
        <div className="hero__actions">
          <a className="btn" href="#catalogo">
            Ver la colección
          </a>
          <a
            className="btn btn--ghost"
            href={buildWhatsAppLink(config.whatsapp, config.mensajeConsulta)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
      <figure className="hero__figure">
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          width={heroImage.width}
          height={heroImage.height}
          fetchpriority="high"
          decoding="async"
        />
        <figcaption className="hero__caption">
          <span className="num">N.º 01</span> Prendas de la temporada, en tonos crudos y carbón.
        </figcaption>
      </figure>
    </section>
  );
}
