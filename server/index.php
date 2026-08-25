<?php
// Router simple para la API
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$path = trim($path, '/');

// Rutas disponibles
$routes = [
    'routines' => 'routines.php',
    'logs' => 'logs.php',
    'exercises' => 'exercises.php',
    'active-workout' => 'active-workout.php',
    'auth/register' => 'auth.php',
    'auth/login' => 'auth.php',
    'auth/logout' => 'auth.php',
    'auth/me' => 'auth.php',
    'users' => 'users.php',
    'users/role' => 'users.php',
];

$endpoint = $path ?: 'routines';

if (isset($routes[$endpoint])) {
    // Varios archivos (auth.php, users.php) agrupan más de una ruta;
    // les indicamos aquí cuál se ha pedido exactamente.
    $_GET['_route'] = $endpoint;
    require_once $routes[$endpoint];
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint no encontrado']);
}
?>
