<?php
require_once 'config.php';

global $pdo;
$currentUser = requireAuth();
$userId = $currentUser['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET el workout activo del usuario autenticado (si existe)
    $stmt = $pdo->prepare("SELECT * FROM active_workout WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $userId]);
    $workout = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$workout) {
        sendJson(null);
    }

    $workout['exercises'] = json_decode($workout['exercises'], true);
    unset($workout['user_id']);
    sendJson($workout);
}

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // POST guardar o actualizar el workout activo del usuario autenticado
    $data = getRequestData();

    if (!isset($data['routineName']) || !isset($data['startTime'])) {
        sendJson(['error' => 'Faltan campos requeridos'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT OR REPLACE INTO active_workout (user_id, routineId, routineName, startTime, exercises, updated_at)
        VALUES (:user_id, :routineId, :routineName, :startTime, :exercises, CURRENT_TIMESTAMP)
    ");

    $stmt->execute([
        ':user_id' => $userId,
        ':routineId' => $data['routineId'] ?? null,
        ':routineName' => $data['routineName'],
        ':startTime' => $data['startTime'],
        ':exercises' => json_encode($data['exercises'] ?? [])
    ]);

    sendJson(['success' => true]);
}

elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // DELETE workout activo del usuario autenticado
    $stmt = $pdo->prepare("DELETE FROM active_workout WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $userId]);

    sendJson(['success' => true]);
}

else {
    sendJson(['error' => 'Método no permitido'], 405);
}
?>
