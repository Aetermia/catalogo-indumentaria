import { useState } from 'react';
import { config } from '../../data/config.js';
import { enterDemo, login } from '../../services/productService.js';
import './AdminGate.css';

export default function AdminGate({ mode, onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isDemo = mode === 'demo';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario.trim() || !password) {
      setError('Completá usuario y contraseña.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onLogin(await login(usuario.trim(), password));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="gate">
      <div className="gate__box">
        <p className="gate__brand">{config.marca}</p>
        <h1 className="gate__title">Administración del catálogo</h1>

        {isDemo && (
          <div className="gate__demo">
            <p>
              <strong>Modo demo.</strong> No hay servidor conectado: los cambios se guardan solo en este navegador.
            </p>
            <p className="num">
              Usuario <code>{config.demoAdmin.usuario}</code> · Clave <code>{config.demoAdmin.password}</code>
            </p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onLogin(enterDemo())}>
              Entrar sin credenciales
            </button>
          </div>
        )}

        <form className="gate__form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="g-user">
              Usuario
            </label>
            <input
              id="g-user"
              className="input"
              autoComplete="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="g-pass">
              Contraseña
            </label>
            <input
              id="g-pass"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--block" disabled={busy}>
            {busy ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <a className="gate__back" href="#">
          Volver a la tienda
        </a>
      </div>
    </main>
  );
}
