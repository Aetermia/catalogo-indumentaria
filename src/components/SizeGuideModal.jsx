import { sizeGuideFor } from '../data/config.js';
import { CloseIcon } from './Icons.jsx';
import { useModalDialog } from './useModalDialog.js';
import './SizeGuideModal.css';

export default function SizeGuideModal({ open, onClose, categoria, highlight }) {
  const ref = useModalDialog(open, onClose);
  const guide = sizeGuideFor(categoria);

  return (
    <dialog ref={ref} className="sizeguide" aria-labelledby="sizeguide-title">
      {open && (
        <div className="sizeguide__inner">
          <div className="sizeguide__head">
            <div>
              <h2 id="sizeguide-title" className="sizeguide__title">
                Guía de talles
              </h2>
              <p className="sizeguide__sub">{guide.titulo}. Medidas de la prenda, no del cuerpo.</p>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar guía de talles">
              <CloseIcon />
            </button>
          </div>
          <div className="sizeguide__table-wrap">
            <table className="sizeguide__table num">
              <thead>
                <tr>
                  {guide.columnas.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.filas.map(([talle, ...rest]) => (
                  <tr key={talle} className={talle === highlight ? 'is-current' : undefined}>
                    <th scope="row">
                      {talle}
                      {talle === highlight && <span className="visually-hidden"> (seleccionado)</span>}
                    </th>
                    {rest.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="sizeguide__h3">Cómo medir</h3>
          <ul className="sizeguide__list">
            {guide.comoMedir.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="sizeguide__tip">
            Tip: medí una prenda tuya que te quede bien y comparala con la tabla. Si quedás entre dos talles, elegí el más grande.
          </p>
        </div>
      )}
    </dialog>
  );
}
