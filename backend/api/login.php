<?php
declare(strict_types=1);

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';

require_method(['POST']);
start_admin_session();

$body = read_json_body();
$usuario = clean_string($body['usuario'] ?? '', 60);
$password = (string) ($body['password'] ?? '');

if ($usuario === '' || $password === '') {
    json_response(['error' => 'Completá usuario y contraseña.'], 422);
}

// Freno simple a intentos repetidos dentro de la misma sesión.
$_SESSION['login_attempts'] = (int) ($_SESSION['login_attempts'] ?? 0);
if ($_SESSION['login_attempts'] >= 5) {
    sleep(2);
}

$stmt = db()->prepare('SELECT id, usuario, password_hash FROM admins WHERE usuario = ? LIMIT 1');
$stmt->execute([$usuario]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    $_SESSION['login_attempts']++;
    json_response(['error' => 'Usuario o contraseña incorrectos.'], 401);
}

session_regenerate_id(true);
$_SESSION['admin_id'] = (int) $admin['id'];
$_SESSION['admin_usuario'] = $admin['usuario'];
$_SESSION['login_attempts'] = 0;

json_response(['admin' => ['id' => (int) $admin['id'], 'usuario' => $admin['usuario']]]);
