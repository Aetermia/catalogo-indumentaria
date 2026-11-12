import { config } from '../data/config.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';
import './Footer.css';

export default function Footer({ mode }) {
  return (
    <footer id="contacto" className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <p className="footer__name">{config.marca}</p>
          <p className="footer__tag">{config.bajada}</p>
        </div>

        <div className="footer__cols">
          <div>
            <h2 className="footer__h">Pedidos y consultas</h2>
            <ul className="footer__list" role="list">
              <li>
                <a href={buildWhatsAppLink(config.whatsapp, config.mensajeConsulta)} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
              {config.instagram && (
                <li>
                  <a href={`https://instagram.com/${config.instagram}`} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
              )}
              {config.horario && <li>{config.horario}</li>}
              {config.direccionLocal && <li>{config.direccionLocal}</li>}
            </ul>
          </div>
          <div>
            <h2 className="footer__h">Medios de pago</h2>
            <ul className="footer__list" role="list">
              {config.mediosDePago.map((m) => (
                <li key={m.id}>{m.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bottom container">
        <p>
          {mode === 'demo' ? 'Catálogo de demostración: los datos se guardan en este navegador.' : `${config.marca}`}
        </p>
        <a href="#admin">Administración</a>
      </div>
    </footer>
  );
}
