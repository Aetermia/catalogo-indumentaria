<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

function start_admin_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $s = app_config()['session'] ?? [];
    session_name($s['name'] ?? 'catalogo_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => (bool) ($s['secure'] ?? false),
        'httponly' => true,
        'samesite' => $s['samesite'] ?? 'Lax',
    ]);
    session_start();
}

function current_admin(): ?array
{
    start_admin_session();
    if (empty($_SESSION['admin_id'])) {
        return null;
    }
    return ['id' => (int) $_SESSION['admin_id'], 'usuario' => (string) $_SESSION['admin_usuario']];
}

function require_admin(): array
{
    $admin = current_admin();
    if ($admin === null) {
        json_response(['error' => 'Sesión no iniciada.'], 401);
    }
    return $admin;
}
