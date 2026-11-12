// Capa de datos híbrida.
// Modo "api": habla con backend/api/*.php (PHP + MySQL).
// Modo "demo": si la API no responde JSON válido (deploy estático, dev sin PHP),
// usa src/data/catalog.js y persiste los cambios del admin en localStorage.

import { catalog } from '../data/catalog.js';
import { config } from '../data/config.js';

const API_URL = (import.meta.env.VITE_API_URL || '/backend/api').replace(/\/$/, '');
const FORCE_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
const STORAGE_KEY = 'catalogo_demo_products_v1';
const SESSION_KEY = 'catalogo_demo_session_v1';
const TIMEOUT_MS = 5000;

let modePromise = null;

/* ---------- utilidades ---------- */

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, formData } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/${path}`, {
      method,
      credentials: 'include',
      signal: controller.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: formData || (body ? JSON.stringify(body) : undefined),
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      throw new ApiError('La API no devolvió JSON.', res.status);
    }
    if (!res.ok) throw new ApiError(json?.error || `Error ${res.status}`, res.status);
    return json;
  } catch (err) {
    if (err.name === 'AbortError') throw new ApiError('El servidor tardó demasiado en responder.', 0);
    if (err instanceof ApiError) throw err;
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  } finally {
    clearTimeout(timer);
  }
}

const safeStorage = {
  get(key, store = localStorage) {
    try {
      return store.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value, store = localStorage) {
    try {
      store.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key, store = localStorage) {
    try {
      store.removeItem(key);
    } catch {
      /* almacenamiento bloqueado: no hay nada que borrar */
    }
  },
};

/* ---------- detección de modo ---------- */

export function getMode() {
  if (!modePromise) {
    modePromise = FORCE_DEMO
      ? Promise.resolve('demo')
      : request('products.php')
          .then((json) => (Array.isArray(json?.data) ? 'api' : 'demo'))
          .catch(() => 'demo');
  }
  return modePromise;
}

/* ---------- modo demo ---------- */

function readDemo() {
  const raw = safeStorage.get(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* datos corruptos: se vuelve al catálogo base */
    }
  }
  return structuredClone(catalog);
}

function writeDemo(products) {
  if (!safeStorage.set(STORAGE_KEY, JSON.stringify(products))) {
    throw new ApiError('El navegador no tiene espacio para guardar más cambios. Probá con imágenes por URL.', 0);
  }
}

function sanitizeProduct(p) {
  return {
    nombre: String(p.nombre || '').trim(),
    categoria: String(p.categoria || '').trim(),
    descripcion: String(p.descripcion || '').trim(),
    precio: Math.max(0, Number(p.precio) || 0),
    imagenes: (p.imagenes || []).map((u) => String(u).trim()).filter(Boolean),
    variantes: (p.variantes || [])
      .map((g) => ({
        grupo: String(g.grupo || '').trim(),
        opciones: (g.opciones || [])
          .filter((o) => String(o.nombre || '').trim())
          .map((o) => ({
            nombre: String(o.nombre).trim(),
            descripcion: String(o.descripcion || '').trim(),
            precio: Number(o.precio) > 0 ? Number(o.precio) : null,
            disponible: o.disponible !== false,
          })),
      }))
      .filter((g) => g.grupo && g.opciones.length),
    descuento_porcentaje: Math.min(100, Math.max(0, Math.round(Number(p.descuento_porcentaje) || 0))),
    tipo_promocion: ['NONE', '2X1', '2DA_UNIDAD_DESCUENTO'].includes(p.tipo_promocion) ? p.tipo_promocion : 'NONE',
    descuento_segunda_unidad:
      p.tipo_promocion === '2DA_UNIDAD_DESCUENTO'
        ? Math.min(100, Math.max(0, Math.round(Number(p.descuento_segunda_unidad) || 0)))
        : 0,
    etiqueta: String(p.etiqueta || '').trim() || null,
    activo: p.activo !== false,
  };
}

function validate(p) {
  const errors = [];
  if (!p.nombre) errors.push('El nombre es obligatorio.');
  if (!p.categoria) errors.push('La categoría es obligatoria.');
  if (!(p.precio > 0)) errors.push('El precio debe ser mayor a 0.');
  if (errors.length) throw new ApiError(errors.join(' '), 422);
}

function requireDemoSession() {
  if (!safeStorage.get(SESSION_KEY, sessionStorage)) throw new ApiError('Sesión no iniciada.', 401);
}

/** Reduce la imagen y la devuelve como data URL para que entre en localStorage. */
function fileToDataUrl(file, maxSide = 1000) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ApiError('No se pudo leer el archivo.', 0));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new ApiError('El archivo no es una imagen válida.', 415));
      image.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- API pública del servicio ---------- */

export async function listProducts() {
  if ((await getMode()) === 'api') {
    const json = await request('products.php');
    return json.data;
  }
  return readDemo().filter((p) => p.activo !== false);
}

export async function listAllProducts() {
  if ((await getMode()) === 'api') {
    const json = await request('products.php?all=1');
    return json.data;
  }
  requireDemoSession();
  return readDemo();
}

export async function createProduct(input) {
  const data = sanitizeProduct(input);
  validate(data);
  if ((await getMode()) === 'api') {
    const json = await request('products.php', { method: 'POST', body: data });
    return json.data;
  }
  requireDemoSession();
  const products = readDemo();
  const id = products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
  const product = { id, ...data, created_at: new Date().toISOString() };
  writeDemo([product, ...products]);
  return product;
}

export async function updateProduct(id, input) {
  const data = sanitizeProduct(input);
  validate(data);
  if ((await getMode()) === 'api') {
    const json = await request(`products.php?id=${encodeURIComponent(id)}`, { method: 'PUT', body: data });
    return json.data;
  }
  requireDemoSession();
  const products = readDemo();
  const index = products.findIndex((p) => String(p.id) === String(id));
  if (index === -1) throw new ApiError('Producto no encontrado.', 404);
  products[index] = { ...products[index], ...data };
  writeDemo(products);
  return products[index];
}

export async function deleteProduct(id) {
  if ((await getMode()) === 'api') {
    await request(`products.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return;
  }
  requireDemoSession();
  writeDemo(readDemo().filter((p) => String(p.id) !== String(id)));
}

export async function uploadImage(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) throw new ApiError('Formato no permitido. Usá JPG, PNG o WEBP.', 415);
  if (file.size > 5 * 1024 * 1024) throw new ApiError('La imagen debe pesar menos de 5 MB.', 413);

  if ((await getMode()) === 'api') {
    const formData = new FormData();
    formData.append('imagen', file);
    const json = await request('upload.php', { method: 'POST', formData });
    return json.url;
  }
  requireDemoSession();
  return fileToDataUrl(file);
}

export async function login(usuario, password) {
  if ((await getMode()) === 'api') {
    const json = await request('login.php', { method: 'POST', body: { usuario, password } });
    return json.admin;
  }
  const { demoAdmin } = config;
  if (usuario !== demoAdmin.usuario || password !== demoAdmin.password) {
    throw new ApiError('Usuario o contraseña incorrectos.', 401);
  }
  return enterDemo();
}

export function enterDemo() {
  const admin = { id: 0, usuario: config.demoAdmin.usuario };
  safeStorage.set(SESSION_KEY, JSON.stringify(admin), sessionStorage);
  return admin;
}

export async function logout() {
  if ((await getMode()) === 'api') {
    await request('logout.php', { method: 'POST' });
    return;
  }
  safeStorage.remove(SESSION_KEY, sessionStorage);
}

export async function currentAdmin() {
  if ((await getMode()) === 'api') {
    try {
      const json = await request('me.php');
      return json.admin;
    } catch (err) {
      if (err.status === 401) return null;
      throw err;
    }
  }
  const raw = safeStorage.get(SESSION_KEY, sessionStorage);
  return raw ? JSON.parse(raw) : null;
}

export function resetDemoData() {
  safeStorage.remove(STORAGE_KEY);
  return structuredClone(catalog);
}
