<?php
declare(strict_types=1);

const PROMO_TYPES = ['NONE', '2X1', '2DA_UNIDAD_DESCUENTO'];

function app_config(): array
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/config.php';
        if (!is_file($path)) {
            json_response(['error' => 'Falta backend/config.php. Copiar config.example.php y completarlo.'], 500);
        }
        $config = require $path;
    }
    return $config;
}

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response(['error' => 'El cuerpo de la petición no es JSON válido.'], 400);
    }
    return $data;
}

function require_method(array $allowed): string
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        json_response(['error' => 'Método no permitido.'], 405);
    }
    return $method;
}

function clamp_int($value, int $min, int $max): int
{
    $n = (int) $value;
    return max($min, min($max, $n));
}

function clean_string($value, int $maxLength): string
{
    $s = trim((string) ($value ?? ''));
    return mb_substr($s, 0, $maxLength);
}

/** Convierte una fila de MySQL al formato que consume el frontend. */
function normalize_product(array $row): array
{
    $imagenes = json_decode((string) ($row['imagenes'] ?? '[]'), true);
    $variantes = json_decode((string) ($row['variantes'] ?? '[]'), true);

    return [
        'id'                       => (int) $row['id'],
        'nombre'                   => $row['nombre'],
        'categoria'                => $row['categoria'],
        'descripcion'              => $row['descripcion'] ?? '',
        'precio'                   => (float) $row['precio'],
        'imagenes'                 => is_array($imagenes) ? $imagenes : [],
        'variantes'                => is_array($variantes) ? $variantes : [],
        'descuento_porcentaje'     => (int) $row['descuento_porcentaje'],
        'tipo_promocion'           => $row['tipo_promocion'],
        'descuento_segunda_unidad' => (int) $row['descuento_segunda_unidad'],
        'etiqueta'                 => $row['etiqueta'],
        'activo'                   => (int) $row['activo'] === 1,
        'created_at'               => $row['created_at'] ?? null,
    ];
}

/** Valida y sanea el payload de un producto. Devuelve [datos, errores]. */
function validate_product(array $in): array
{
    $errors = [];

    $nombre = clean_string($in['nombre'] ?? '', 150);
    if ($nombre === '') {
        $errors[] = 'El nombre es obligatorio.';
    }

    $categoria = clean_string($in['categoria'] ?? '', 80);
    if ($categoria === '') {
        $errors[] = 'La categoría es obligatoria.';
    }

    $precio = $in['precio'] ?? null;
    if (!is_numeric($precio) || (float) $precio < 0) {
        $errors[] = 'El precio debe ser un número mayor o igual a 0.';
        $precio = 0;
    }

    $imagenes = [];
    foreach ((array) ($in['imagenes'] ?? []) as $url) {
        $url = clean_string($url, 500);
        if ($url !== '') {
            $imagenes[] = $url;
        }
    }

    $variantes = [];
    foreach ((array) ($in['variantes'] ?? []) as $grupo) {
        if (!is_array($grupo)) {
            continue;
        }
        $nombreGrupo = clean_string($grupo['grupo'] ?? '', 40);
        if ($nombreGrupo === '') {
            continue;
        }
        $opciones = [];
        foreach ((array) ($grupo['opciones'] ?? []) as $op) {
            if (!is_array($op)) {
                continue;
            }
            $nombreOp = clean_string($op['nombre'] ?? '', 40);
            if ($nombreOp === '') {
                continue;
            }
            $precioOp = $op['precio'] ?? null;
            $opciones[] = [
                'nombre'      => $nombreOp,
                'descripcion' => clean_string($op['descripcion'] ?? '', 120),
                'precio'      => (is_numeric($precioOp) && (float) $precioOp > 0) ? round((float) $precioOp, 2) : null,
                'disponible'  => !array_key_exists('disponible', $op) || (bool) $op['disponible'],
            ];
        }
        if ($opciones) {
            $variantes[] = ['grupo' => $nombreGrupo, 'opciones' => $opciones];
        }
    }

    $tipo = strtoupper(clean_string($in['tipo_promocion'] ?? 'NONE', 30));
    if (!in_array($tipo, PROMO_TYPES, true)) {
        $errors[] = 'Tipo de promoción inválido.';
        $tipo = 'NONE';
    }

    $etiqueta = clean_string($in['etiqueta'] ?? '', 50);

    $data = [
        'nombre'                   => $nombre,
        'categoria'                => $categoria,
        'descripcion'              => clean_string($in['descripcion'] ?? '', 5000),
        'precio'                   => round((float) $precio, 2),
        'imagenes'                 => json_encode($imagenes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'variantes'                => json_encode($variantes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'descuento_porcentaje'     => clamp_int($in['descuento_porcentaje'] ?? 0, 0, 100),
        'tipo_promocion'           => $tipo,
        'descuento_segunda_unidad' => $tipo === '2DA_UNIDAD_DESCUENTO' ? clamp_int($in['descuento_segunda_unidad'] ?? 0, 0, 100) : 0,
        'etiqueta'                 => $etiqueta === '' ? null : $etiqueta,
        'activo'                   => (!array_key_exists('activo', $in) || $in['activo']) ? 1 : 0,
    ];

    return [$data, $errors];
}
