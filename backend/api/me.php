<?php
declare(strict_types=1);

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../auth.php';

require_method(['GET']);

$admin = current_admin();
if ($admin === null) {
    json_response(['error' => 'Sesión no iniciada.'], 401);
}

json_response(['admin' => $admin]);
