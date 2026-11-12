import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { config } from '../../data/config.js';
import {
  createProduct,
  deleteProduct,
  listAllProducts,
  resetDemoData,
  updateProduct,
  uploadImage,
} from '../../services/productService.js';
import { calculateLineTotal, formatMoney, getPromoLabels } from '../../utils/pricing.js';
import { CloseIcon } from '../Icons.jsx';
import './AdminPanel.css';

const EMPTY = {
  nombre: '',
  categoria: '',
  descripcion: '',
  precio: '',
  imagenes: [],
  variantes: [],
  descuento_porcentaje: 0,
  tipo_promocion: 'NONE',
  descuento_segunda_unidad: 50,
  etiqueta: '',
  activo: true,
};

const TALLES_BASE = ['S', 'M', 'L', 'XL', 'XXL'];

function toForm(product) {
  if (!product) return structuredClone(EMPTY);
  return {
    ...structuredClone(EMPTY),
    ...structuredClone(product),
    precio: String(product.precio ?? ''),
    etiqueta: product.etiqueta || '',
    descuento_segunda_unidad: product.descuento_segunda_unidad || 50,
  };
}

/* ---------- Formulario ---------- */

function ProductForm({ initial, categories, onCancel, onSaved }) {
  const [form, setForm] = useState(() => toForm(initial));
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const isEdit = Boolean(initial?.id);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  /* Imágenes */
  const addUrl = () => {
    const url = urlInput.trim();
    if (!/^(https?:\/\/|\/)/.test(url)) {
      setError('La URL de la imagen debe empezar con https:// o /');
      return;
    }
    set('imagenes', [...form.imagenes, url]);
    setUrlInput('');
    setError('');
  };

  const handleFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadImage(file));
      setForm((f) => ({ ...f, imagenes: [...f.imagenes, ...urls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (i, dir) => {
    const list = [...form.imagenes];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set('imagenes', list);
  };

  /* Variantes */
  const updateGroup = (gi, patch) =>
    set(
      'variantes',
      form.variantes.map((g, i) => (i === gi ? { ...g, ...patch } : g))
    );
  const updateOption = (gi, oi, patch) =>
    updateGroup(gi, { opciones: form.variantes[gi].opciones.map((o, i) => (i === oi ? { ...o, ...patch } : o)) });
  const addGroup = (preset) => {
    const group =
      preset === 'talle'
        ? { grupo: 'Talle', opciones: TALLES_BASE.map((n) => ({ nombre: n, descripcion: '', precio: null, disponible: true })) }
        : { grupo: '', opciones: [{ nombre: '', descripcion: '', precio: null, disponible: true }] };
    set('variantes', [...form.variantes, group]);
  };

  const preview = useMemo(() => {
    const p = { ...form, precio: Number(form.precio) || 0 };
    return { one: calculateLineTotal(p, null, 1), two: calculateLineTotal(p, null, 2), labels: getPromoLabels(p) };
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, precio: Number(form.precio) };
      const saved = isEdit ? await updateProduct(initial.id, payload) : await createProduct(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="pform" onSubmit={handleSubmit} noValidate>
      <div className="pform__head">
        <h2 className="pform__title">{isEdit ? `Editar: ${initial.nombre}` : 'Nuevo producto'}</h2>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Cerrar formulario">
          <CloseIcon />
        </button>
      </div>

      <section className="pform__section" aria-labelledby="sec-datos">
        <h3 id="sec-datos" className="pform__h">Datos</h3>
        <div className="pform__grid">
          <div className="field pform__span2">
            <label className="field__label" htmlFor="f-nombre">Nombre</label>
            <input id="f-nombre" className="input" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="f-cat">Categoría</label>
            <input
              id="f-cat"
              className="input"
              list="f-cat-list"
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value)}
              required
            />
            <datalist id="f-cat-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="f-precio">Precio base ({config.moneda.codigo})</label>
            <input
              id="f-precio"
              className="input num"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.precio}
              onChange={(e) => set('precio', e.target.value)}
              required
            />
          </div>
          <div className="field pform__span2">
            <label className="field__label" htmlFor="f-desc">Descripción</label>
            <textarea id="f-desc" className="input" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
            <p className="field__hint">Tela, gramaje, calce y cuidados. Es lo que más consultan.</p>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="f-etq">Etiqueta (opcional)</label>
            <input id="f-etq" className="input" maxLength={50} value={form.etiqueta} onChange={(e) => set('etiqueta', e.target.value)} />
            <p className="field__hint">Ej.: Nuevo ingreso. Se muestra en la tarjeta.</p>
          </div>
          <label className="check">
            <input type="checkbox" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
            <span>Visible en la tienda</span>
          </label>
        </div>
      </section>

      <section className="pform__section" aria-labelledby="sec-img">
        <h3 id="sec-img" className="pform__h">Imágenes</h3>
        <p className="field__hint">La primera es la foto principal; la segunda aparece al pasar el mouse.</p>
        {form.imagenes.length === 0 ? (
          <p className="pform__empty">Sin imágenes todavía.</p>
        ) : (
          <ol className="imgs" role="list">
            {form.imagenes.map((src, i) => (
              <li key={src + i} className="imgs__item">
                <img src={src} alt={`Imagen ${i + 1}`} width="64" height="80" />
                <span className="imgs__n num">{i === 0 ? 'Principal' : `Foto ${i + 1}`}</span>
                <div className="imgs__actions">
                  <button type="button" className="mini" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label={`Subir imagen ${i + 1}`}>
                    Subir
                  </button>
                  <button
                    type="button"
                    className="mini"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === form.imagenes.length - 1}
                    aria-label={`Bajar imagen ${i + 1}`}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="mini mini--danger"
                    onClick={() => set('imagenes', form.imagenes.filter((_, j) => j !== i))}
                    aria-label={`Quitar imagen ${i + 1}`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="pform__row">
          <div className="field pform__grow">
            <label className="field__label" htmlFor="f-url">Agregar por URL</label>
            <input
              id="f-url"
              className="input"
              type="url"
              placeholder="https://"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addUrl();
                }
              }}
            />
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addUrl} disabled={!urlInput.trim()}>
            Agregar URL
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Subiendo…' : 'Subir archivo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handleFiles}
            aria-label="Subir imágenes"
          />
        </div>
        <p className="field__hint">JPG, PNG o WEBP de hasta 5 MB.</p>
      </section>

      <section className="pform__section" aria-labelledby="sec-var">
        <h3 id="sec-var" className="pform__h">Variantes</h3>
        <p className="field__hint">Cada grupo (Talle, Color) tiene opciones. El precio de la opción es opcional: vacío usa el precio base.</p>
        {form.variantes.length === 0 && <p className="pform__empty">Sin variantes: se vende como talle único.</p>}
        {form.variantes.map((g, gi) => (
          <fieldset key={gi} className="vgroup">
            <legend className="visually-hidden">Grupo {gi + 1}</legend>
            <div className="vgroup__head">
              <div className="field pform__grow">
                <label className="field__label" htmlFor={`g-${gi}`}>Nombre del grupo</label>
                <input
                  id={`g-${gi}`}
                  className="input"
                  placeholder="Talle, Color…"
                  value={g.grupo}
                  onChange={(e) => updateGroup(gi, { grupo: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="mini mini--danger"
                onClick={() => set('variantes', form.variantes.filter((_, i) => i !== gi))}
              >
                Quitar grupo
              </button>
            </div>
            <div className="vopts">
              <div className="vopts__labels" aria-hidden="true">
                <span>Opción</span>
                <span>Descripción / medidas</span>
                <span>Precio</span>
                <span>Stock</span>
                <span />
              </div>
              {g.opciones.map((o, oi) => (
                <div key={oi} className="vopt">
                  <input
                    className="input"
                    aria-label={`Opción ${oi + 1} de ${g.grupo || 'grupo'}`}
                    placeholder="M"
                    value={o.nombre}
                    onChange={(e) => updateOption(gi, oi, { nombre: e.target.value })}
                  />
                  <input
                    className="input"
                    aria-label={`Descripción de ${o.nombre || 'la opción'}`}
                    placeholder="Pecho x largo: 54 x 72 cm"
                    value={o.descripcion}
                    onChange={(e) => updateOption(gi, oi, { descripcion: e.target.value })}
                  />
                  <input
                    className="input num"
                    type="number"
                    min="0"
                    step="100"
                    aria-label={`Precio de ${o.nombre || 'la opción'}`}
                    placeholder={form.precio ? String(form.precio) : 'Base'}
                    value={o.precio ?? ''}
                    onChange={(e) => updateOption(gi, oi, { precio: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                  <label className="check check--compact">
                    <input
                      type="checkbox"
                      checked={o.disponible !== false}
                      onChange={(e) => updateOption(gi, oi, { disponible: e.target.checked })}
                    />
                    <span>Disponible</span>
                  </label>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => updateGroup(gi, { opciones: g.opciones.filter((_, i) => i !== oi) })}
                    aria-label={`Quitar opción ${o.nombre || oi + 1}`}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mini"
              onClick={() => updateGroup(gi, { opciones: [...g.opciones, { nombre: '', descripcion: '', precio: null, disponible: true }] })}
            >
              Agregar opción
            </button>
          </fieldset>
        ))}
        <div className="pform__row">
          {!form.variantes.some((g) => g.grupo.toLowerCase() === 'talle') && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => addGroup('talle')}>
              Agregar talles S a XXL
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => addGroup()}>
            Agregar grupo vacío
          </button>
        </div>
      </section>

      <section className="pform__section" aria-labelledby="sec-ofe">
        <h3 id="sec-ofe" className="pform__h">Ofertas</h3>
        <div className="pform__grid">
          <div className="field">
            <label className="field__label" htmlFor="f-off">Descuento directo (%)</label>
            <input
              id="f-off"
              className="input num"
              type="number"
              min="0"
              max="100"
              value={form.descuento_porcentaje}
              onChange={(e) => set('descuento_porcentaje', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="f-promo">Tipo de promoción</label>
            <select id="f-promo" className="input" value={form.tipo_promocion} onChange={(e) => set('tipo_promocion', e.target.value)}>
              <option value="NONE">Sin promoción</option>
              <option value="2X1">2x1</option>
              <option value="2DA_UNIDAD_DESCUENTO">Descuento en la 2da unidad</option>
            </select>
          </div>
          {form.tipo_promocion === '2DA_UNIDAD_DESCUENTO' && (
            <div className="field">
              <label className="field__label" htmlFor="f-2da">Descuento 2da unidad (%)</label>
              <input
                id="f-2da"
                className="input num"
                type="number"
                min="1"
                max="100"
                value={form.descuento_segunda_unidad}
                onChange={(e) => set('descuento_segunda_unidad', e.target.value)}
              />
            </div>
          )}
        </div>
        <p className="pform__preview num" aria-live="polite">
          Precio base: 1 unidad {formatMoney(preview.one.lineTotal)} · 2 unidades {formatMoney(preview.two.lineTotal)}
          {preview.labels.length > 0 && ` · ${preview.labels.join(' + ')}`}
        </p>
      </section>

      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}

      <div className="pform__foot">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn" disabled={saving || uploading}>
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}

/* ---------- Panel ---------- */

export default function AdminPanel({ mode, admin, onLogout }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [flash, setFlash] = useState('');
  const [query, setQuery] = useState('');
  const formRef = useRef(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setProducts(await listAllProducts());
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (editing) formRef.current?.scrollIntoView({ block: 'start' });
  }, [editing]);

  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(''), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.categoria))].sort(), [products]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => `${p.nombre} ${p.categoria}`.toLowerCase().includes(q)) : products;
  }, [products, query]);

  const handleSaved = (saved, isEdit) => {
    setProducts((list) => (isEdit ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list]));
    setEditing(null);
    setFlash(isEdit ? `Guardado: ${saved.nombre}` : `Creado: ${saved.nombre}`);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? No se puede deshacer.`)) return;
    try {
      await deleteProduct(p.id);
      setProducts((list) => list.filter((x) => x.id !== p.id));
      if (editing?.id === p.id) setEditing(null);
      setFlash(`Eliminado: ${p.nombre}`);
    } catch (err) {
      setFlash('');
      setError(err.message);
    }
  };

  const toggleActive = async (p) => {
    try {
      const saved = await updateProduct(p.id, { ...p, activo: !p.activo });
      setProducts((list) => list.map((x) => (x.id === p.id ? saved : x)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    if (!window.confirm('¿Restaurar los productos de demostración? Se pierden los cambios hechos en este navegador.')) return;
    setProducts(resetDemoData());
    setEditing(null);
    setFlash('Datos de demostración restaurados.');
  };

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="admin__bar-inner">
          <p className="admin__brand">{config.marca}</p>
          <span className={`admin__mode admin__mode--${mode}`}>
            {mode === 'api' ? 'Conectado a la base de datos' : 'Modo demo (este navegador)'}
          </span>
          <nav className="admin__nav" aria-label="Administración">
            <a href="#">Ver tienda</a>
            <button type="button" className="mini" onClick={onLogout}>
              Cerrar sesión ({admin.usuario})
            </button>
          </nav>
        </div>
      </header>

      <main className="admin__main">
        <div className="admin__head">
          <h1 className="admin__title">Productos</h1>
          <div className="admin__tools">
            <label className="visually-hidden" htmlFor="a-search">Buscar producto</label>
            <input
              id="a-search"
              className="input admin__search"
              type="search"
              placeholder="Buscar por nombre o categoría"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="btn" onClick={() => setEditing('new')}>
              Nuevo producto
            </button>
          </div>
        </div>

        <div aria-live="polite">{flash && <p className="notice admin__flash">{flash}</p>}</div>
        {error && status !== 'error' && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}

        {editing && (
          <div ref={formRef} className="admin__form">
            <ProductForm
              key={editing === 'new' ? 'new' : editing.id}
              initial={editing === 'new' ? null : editing}
              categories={categories}
              onCancel={() => setEditing(null)}
              onSaved={handleSaved}
            />
          </div>
        )}

        {status === 'loading' && <p className="admin__state" aria-busy="true">Cargando productos…</p>}
        {status === 'error' && (
          <div className="admin__state" role="alert">
            <p>No se pudieron cargar los productos. {error}</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={load}>
              Reintentar
            </button>
          </div>
        )}
        {status === 'ready' && products.length === 0 && (
          <div className="admin__state">
            <p>Todavía no hay productos. Creá el primero con “Nuevo producto”.</p>
          </div>
        )}
        {status === 'ready' && products.length > 0 && visible.length === 0 && (
          <p className="admin__state">Ningún producto coincide con “{query}”.</p>
        )}

        {status === 'ready' && visible.length > 0 && (
          <ul className="plist" role="list">
            {visible.map((p) => {
              const labels = getPromoLabels(p);
              return (
                <li key={p.id} className={`prow${p.activo ? '' : ' prow--off'}`}>
                  {p.imagenes?.[0] ? (
                    <img className="prow__img" src={p.imagenes[0]} alt="" width="56" height="70" loading="lazy" />
                  ) : (
                    <span className="prow__img" aria-hidden="true" />
                  )}
                  <div className="prow__info">
                    <p className="prow__name">{p.nombre}</p>
                    <p className="prow__meta num">
                      {p.categoria} · {formatMoney(p.precio)}
                      {labels.length > 0 && <span className="prow__promo"> · {labels.join(' + ')}</span>}
                      {!p.activo && ' · Oculto'}
                    </p>
                  </div>
                  <div className="prow__actions">
                    <label className="check check--compact">
                      <input type="checkbox" checked={p.activo} onChange={() => toggleActive(p)} />
                      <span>Visible</span>
                    </label>
                    <button type="button" className="mini" onClick={() => setEditing(p)}>
                      Editar
                    </button>
                    <button type="button" className="mini mini--danger" onClick={() => handleDelete(p)}>
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {mode === 'demo' && status === 'ready' && (
          <div className="admin__reset">
            <p>Los cambios se guardan en este navegador y se ven en la tienda al recargarla.</p>
            <button type="button" className="mini" onClick={handleReset}>
              Restaurar datos de demostración
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
