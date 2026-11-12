<?php
declare(strict_types=1);

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../auth.php';

require_method(['POST']);
start_admin_session();

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 3600,
        'path'     => $p['path'],
        'secure'   => $p['secure'],
        'httponly' => $p['httponly'],
        'samesite' => $p['samesite'] ?? 'Lax',
    ]);
}
session_destroy();

json_response(['ok' => true]);
