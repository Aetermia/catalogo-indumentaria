import { config } from '../data/config.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';
import { WhatsAppIcon } from './Icons.jsx';
import './WhatsAppFab.css';

export default function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href={buildWhatsAppLink(config.whatsapp, config.mensajeConsulta)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp (abre en otra pestaña)"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
