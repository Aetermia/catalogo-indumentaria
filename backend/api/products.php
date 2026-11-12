<?php
declare(strict_types=1);

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';

$method = require_method(['GET', 'POST', 'PUT', 'DELETE']);
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

function find_product(int $id, bool $onlyActive): ?array
{
    $sql = 'SELECT * FROM productos WHERE id = ?' . ($onlyActive ? ' AND activo = 1' : '');
    $stmt = db()->prepare($sql);
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? normalize_product($row) : null;
}

switch ($method) {
    case 'GET':
        // ?all=1 devuelve también los inactivos y requiere sesión de administrador.
        $all = isset($_GET['all']) && $_GET['all'] === '1';
        if ($all) {
            require_admin();
        }

        if ($id > 0) {
            $product = find_product($id, !$all);
            if ($product === null) {
                json_response(['error' => 'Producto no encontrado.'], 404);
            }
            json_response(['data' => $product]);
        }

        $sql = 'SELECT * FROM productos' . ($all ? '' : ' WHERE activo = 1') . ' ORDER BY created_at DESC, id DESC';
        $rows = db()->query($sql)->fetchAll();
        json_response(['data' => array_map('normalize_product', $rows)]);
        break;

    case 'POST':
        require_admin();
        [$data, $errors] = validate_product(read_json_body());
        if ($errors) {
            json_response(['error' => implode(' ', $errors)], 422);
        }
        $stmt = db()->prepare(
            'INSERT INTO productos
                (nombre, categoria, descripcion, precio, imagenes, variantes,
                 descuento_porcentaje, tipo_promocion, descuento_segunda_unidad, etiqueta, activo)
             VALUES
                (:nombre, :categoria, :descripcion, :precio, :imagenes, :variantes,
                 :descuento_porcentaje, :tipo_promocion, :descuento_segunda_unidad, :etiqueta, :activo)'
        );
        $stmt->execute($data);
        json_response(['data' => find_product((int) db()->lastInsertId(), false)], 201);
        break;

    case 'PUT':
        require_admin();
        if ($id <= 0) {
            json_response(['error' => 'Falta el id del producto.'], 400);
        }
        if (find_product($id, false) === null) {
            json_response(['error' => 'Producto no encontrado.'], 404);
        }
        [$data, $errors] = validate_product(read_json_body());
        if ($errors) {
            json_response(['error' => implode(' ', $errors)], 422);
        }
        $data['id'] = $id;
        $stmt = db()->prepare(
            'UPDATE productos SET
                nombre = :nombre, categoria = :categoria, descripcion = :descripcion, precio = :precio,
                imagenes = :imagenes, variantes = :variantes, descuento_porcentaje = :descuento_porcentaje,
                tipo_promocion = :tipo_promocion, descuento_segunda_unidad = :descuento_segunda_unidad,
                etiqueta = :etiqueta, activo = :activo
             WHERE id = :id'
        );
        $stmt->execute($data);
        json_response(['data' => find_product($id, false)]);
        break;

    case 'DELETE':
        require_admin();
        if ($id <= 0) {
            json_response(['error' => 'Falta el id del producto.'], 400);
        }
        $stmt = db()->prepare('DELETE FROM productos WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            json_response(['error' => 'Producto no encontrado.'], 404);
        }
        json_response(['ok' => true]);
        break;
}
