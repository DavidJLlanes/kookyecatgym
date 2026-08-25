<?php
require_once 'config.php';

global $pdo;

$route = $_GET['_route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$currentUser = requireAdmin();

function publicUserRow(array $user): array {
    return [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'created_at' => $user['created_at'],
    ];
}

if ($route === 'users' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at ASC");
    $users = array_map('publicUserRow', $stmt->fetchAll(PDO::FETCH_ASSOC));
    sendJson($users);
}

elseif ($route === 'users' && $method === 'POST') {
    // Alta de un nuevo usuario directamente desde el panel de administración
    $data = getRequestData();
    $username = trim($data['username'] ?? '');
    $email = trim(strtolower($data['email'] ?? ''));
    $password = $data['password'] ?? '';
    $role = ($data['role'] ?? 'user') === 'admin' ? 'admin' : 'user';

    if ($username === '' || $email === '' || $password === '') {
        sendJson(['error' => 'Faltan campos requeridos'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJson(['error' => 'El correo electrónico no es válido'], 400);
    }
    if (!isValidClientHash($password)) {
        sendJson(['error' => 'Contraseña no válida'], 400);
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username COLLATE NOCASE OR email = :email COLLATE NOCASE");
    $stmt->execute([':username' => $username, ':email' => $email]);
    if ($stmt->fetch()) {
        sendJson(['error' => 'Ya existe una cuenta con ese usuario o correo electrónico'], 409);
    }

    $id = 'user-' . bin2hex(random_bytes(8));
    $stmt = $pdo->prepare("
        INSERT INTO users (id, username, email, password_hash, role)
        VALUES (:id, :username, :email, :password_hash, :role)
    ");
    $stmt->execute([
        ':id' => $id,
        ':username' => $username,
        ':email' => $email,
        ':password_hash' => password_hash($password, PASSWORD_BCRYPT),
        ':role' => $role,
    ]);

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->execute([':id' => $id]);
    sendJson(publicUserRow($stmt->fetch(PDO::FETCH_ASSOC)), 201);
}

elseif ($route === 'users' && $method === 'DELETE') {
    $data = getRequestData();
    $id = $data['id'] ?? '';

    if ($id === '') {
        sendJson(['error' => 'Falta el ID'], 400);
    }
    if ($id === $currentUser['id']) {
        sendJson(['error' => 'No puedes eliminar tu propia cuenta'], 400);
    }

    // Borra también todos los datos propios del usuario (rutinas,
    // entrenamientos, entrenamiento activo y ejercicios personalizados);
    // antes solo se borraba la cuenta y sus sesiones, dejando el resto
    // huérfano en la base de datos indefinidamente.
    $pdo->prepare("DELETE FROM routines WHERE user_id = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM logs WHERE user_id = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM active_workout WHERE user_id = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM exercises WHERE user_id = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM sessions WHERE user_id = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM users WHERE id = :id")->execute([':id' => $id]);

    sendJson(['success' => true]);
}

elseif ($route === 'users/role' && $method === 'POST') {
    $data = getRequestData();
    $id = $data['id'] ?? '';
    $role = ($data['role'] ?? '') === 'admin' ? 'admin' : 'user';

    if ($id === '') {
        sendJson(['error' => 'Falta el ID'], 400);
    }
    if ($id === $currentUser['id'] && $role !== 'admin') {
        sendJson(['error' => 'No puedes quitarte a ti mismo el rol de administrador'], 400);
    }

    $stmt = $pdo->prepare("UPDATE users SET role = :role WHERE id = :id");
    $stmt->execute([':role' => $role, ':id' => $id]);

    sendJson(['success' => true]);
}

else {
    sendJson(['error' => 'Método no permitido'], 405);
}
?>
