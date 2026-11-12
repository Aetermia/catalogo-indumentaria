# Catálogo de indumentaria

Catálogo con variantes, promociones, carrito con cierre por WhatsApp y panel de administración.
React + Vite en el frontend, PHP + MySQL en el backend, con modo demo automático si no hay servidor.

## Local

```bash
npm install
npm run dev      # http://localhost:5173  (admin en /#admin, demo: demo / demo1234)
npm test         # motor de precios y mensaje de WhatsApp
npm run build    # genera dist/
```

## Producción con PHP + MySQL

1. Importar `backend/schema.sql` y crear el primer admin (instrucciones al final del archivo).
2. Copiar `backend/config.example.php` a `backend/config.php` y completar base de datos, orígenes y carpeta de uploads.
3. Subir `dist/` y `backend/` al mismo dominio. Si la API vive en otro dominio, definir `VITE_API_URL` antes del build y usar `samesite => 'None'` con HTTPS.

## Personalizar para un cliente

- `src/data/config.js`: marca, WhatsApp, medios de pago, guía de talles. Los campos marcados `[DATO REAL]` deben reemplazarse.
- `src/data/catalog.js`: productos del modo demo.
- `src/styles/tokens.css`: paleta, tipografías y espaciado.
