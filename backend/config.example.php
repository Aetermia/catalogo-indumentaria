<?php
// Copiar este archivo como config.php y completar con los datos reales.
// config.php no debe subirse al repositorio.

return [
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'name'    => 'catalogo',
        'user'    => 'catalogo_user',
        'pass'    => 'cambiar-esta-clave',
        'charset' => 'utf8mb4',
    ],

    // Orígenes autorizados a llamar a la API con cookies de sesión.
    // Si el frontend se sirve desde el mismo dominio que el backend, puede quedar vacío.
    'allowed_origins' => [
        'http://localhost:5173',
    ],

    'session' => [
        'name'     => 'catalogo_admin',
        // 'Lax' si frontend y API comparten dominio. 'None' (requiere HTTPS) si están en dominios distintos.
        'samesite' => 'Lax',
        'secure'   => false,
    ],

    'uploads' => [
        // Carpeta física donde se guardan las imágenes subidas.
        'dir'       => __DIR__ . '/uploads',
        // URL pública de esa carpeta.
        'url'       => '/backend/uploads',
        'max_bytes' => 5 * 1024 * 1024,
    ],
];
