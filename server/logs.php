<?php
require_once 'config.php';

global $pdo;
$currentUser = requireAuth();
$userId = $currentUser['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET todos los logs del usuario autenticado
    $stmt = $pdo->prepare("SELECT * FROM logs WHERE user_id = :user_id ORDER BY date DESC");
    $stmt->execute([':user_id' => $userId]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($logs as &$l) {
        $l['exercises'] = json_decode($l['exercises'], true);
        unset($l['user_id']);
    }

    sendJson($logs);
}

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // POST guardar log (propiedad del usuario autenticado)
    $data = getRequestData();

    if (!isset($data['id']) || !isset($data['routineName'])) {
        sendJson(['error' => 'Faltan campos requeridos'], 400);
    }

    // INSERT ... ON CONFLICT DO UPDATE en vez de INSERT OR REPLACE (ver
    // routines.php para la misma explicación): evita que created_at se
    // reinicie cada vez que se re-guarda un log ya existente.
    $stmt = $pdo->prepare("
        INSERT INTO logs (id, user_id, routineId, routineName, date, duration, exercises)
        VALUES (:id, :user_id, :routineId, :routineName, :date, :duration, :exercises)
        ON CONFLICT(id, user_id) DO UPDATE SET
            routineId = excluded.routineId,
            routineName = excluded.routineName,
            date = excluded.date,
            duration = excluded.duration,
            exercises = excluded.exercises
    ");

    $stmt->execute([
        ':id' => $data['id'],
        ':user_id' => $userId,
        ':routineId' => $data['routineId'] ?? null,
        ':routineName' => $data['routineName'],
        ':date' => $data['date'] ?? date('c'),
        ':duration' => $data['duration'] ?? 0,
        ':exercises' => json_encode($data['exercises'] ?? [])
    ]);

    sendJson(['success' => true, 'id' => $data['id']]);
}

elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // DELETE log (solo si pertenece al usuario autenticado)
    $data = getRequestData();

    if (!isset($data['id'])) {
        sendJson(['error' => 'Falta el ID'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM logs WHERE id = :id AND user_id = :user_id");
    $stmt->execute([':id' => $data['id'], ':user_id' => $userId]);

    sendJson(['success' => true]);
}

else {
    sendJson(['error' => 'Método no permitido'], 405);
}
?>
