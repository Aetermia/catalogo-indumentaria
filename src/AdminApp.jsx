import { useCallback, useEffect, useState } from 'react';
import AdminGate from './components/admin/AdminGate.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import { currentAdmin, getMode, logout } from './services/productService.js';

export default function AdminApp() {
  const [mode, setMode] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const check = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const [m, a] = await Promise.all([getMode(), currentAdmin()]);
      setMode(m);
      setAdmin(a);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    document.title = 'Administración · Catálogo';
    check();
  }, [check]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setAdmin(null);
    }
  };

  if (status === 'loading') {
    return (
      <main className="admin-shell" aria-busy="true">
        <p className="admin-shell__msg">Verificando sesión…</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="admin-shell">
        <div className="notice notice--error" role="alert">
          {error}
        </div>
        <button type="button" className="btn btn--ghost" onClick={check}>
          Reintentar
        </button>
      </main>
    );
  }

  return admin ? (
    <AdminPanel mode={mode} admin={admin} onLogout={handleLogout} />
  ) : (
    <AdminGate mode={mode} onLogin={setAdmin} />
  );
}
