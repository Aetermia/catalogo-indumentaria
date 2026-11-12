<?php
declare(strict_types=1);

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../auth.php';

require_method(['POST']);
require_admin();

$cfg = app_config()['uploads'];
$maxBytes = (int) ($cfg['max_bytes'] ?? 5 * 1024 * 1024);
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];

$file = $_FILES['imagen'] ?? null;
if (!$file || !is_array($file) || is_array($file['error'])) {
    json_response(['error' => 'No se recibió ninguna imagen (campo "imagen").'], 400);
}

if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
    json_response(['error' => 'La imagen supera el tamaño permitido.'], 413);
}
if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
    json_response(['error' => 'La subida falló. Intentá de nuevo.'], 400);
}
if ($file['size'] <= 0 || $file['size'] > $maxBytes) {
    json_response(['error' => 'La imagen debe pesar menos de ' . round($maxBytes / 1048576) . ' MB.'], 413);
}

// MIME real a partir del contenido, no de la extensión ni del navegador.
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
if (!isset($allowed[$mime]) || @getimagesize($file['tmp_name']) === false) {
    json_response(['error' => 'Formato no permitido. Usá JPG, PNG o WEBP.'], 415);
}

$dir = rtrim($cfg['dir'], '/\\');
if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
    json_response(['error' => 'No se pudo crear la carpeta de imágenes.'], 500);
}

$filename = date('Ymd') . '-' . bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
if (!move_uploaded_file($file['tmp_name'], $dir . DIRECTORY_SEPARATOR . $filename)) {
    json_response(['error' => 'No se pudo guardar la imagen.'], 500);
}

json_response(['url' => rtrim($cfg['url'], '/') . '/' . $filename], 201);
