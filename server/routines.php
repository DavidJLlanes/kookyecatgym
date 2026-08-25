<?php
require_once 'config.php';

global $pdo;
$currentUser = requireAuth();
$userId = $currentUser['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET todas las rutinas del usuario autenticado
    $stmt = $pdo->prepare("SELECT * FROM routines WHERE user_id = :user_id ORDER BY updated_at DESC");
    $stmt->execute([':user_id' => $userId]);
    $routines = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($routines as &$r) {
        $r['exercises'] = json_decode($r['exercises'], true);
        unset($r['user_id']);
    }

    sendJson($routines);
}

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // POST guardar rutina (propiedad del usuario autenticado)
    $data = getRequestData();

    if (!isset($data['id']) || !isset($data['name'])) {
        sendJson(['error' => 'Faltan campos requeridos'], 400);
    }

    // INSERT ... ON CONFLICT DO UPDATE en vez de INSERT OR REPLACE: este
    // último borra e inserta de nuevo la fila, así que created_at (que tiene
    // DEFAULT CURRENT_TIMESTAMP) se reiniciaba en cada edición de la rutina.
    // Con el UPDATE explícito, created_at no se toca y solo cambia lo que de
    // verdad cambia.
    $stmt = $pdo->prepare("
        INSERT INTO routines (id, user_id, name, description, exercises, dayOfWeek, folder, folderOrder, sortOrder, updated_at)
        VALUES (:id, :user_id, :name, :description, :exercises, :dayOfWeek, :folder, :folderOrder, :sortOrder, CURRENT_TIMESTAMP)
        ON CONFLICT(id, user_id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            exercises = excluded.exercises,
            dayOfWeek = excluded.dayOfWeek,
            folder = excluded.folder,
            folderOrder = excluded.folderOrder,
            sortOrder = excluded.sortOrder,
            updated_at = excluded.updated_at
    ");

    $stmt->execute([
        ':id' => $data['id'],
        ':user_id' => $userId,
        ':name' => $data['name'],
        ':description' => $data['description'] ?? '',
        ':exercises' => json_encode($data['exercises'] ?? []),
        ':dayOfWeek' => $data['dayOfWeek'] ?? null,
        ':folder' => $data['folder'] ?? null,
        ':folderOrder' => $data['folderOrder'] ?? null,
        ':sortOrder' => $data['sortOrder'] ?? null
    ]);

    sendJson(['success' => true, 'id' => $data['id']]);
}

elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // DELETE rutina (solo si pertenece al usuario autenticado)
    $data = getRequestData();

    if (!isset($data['id'])) {
        sendJson(['error' => 'Falta el ID'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM routines WHERE id = :id AND user_id = :user_id");
    $stmt->execute([':id' => $data['id'], ':user_id' => $userId]);

    sendJson(['success' => true]);
}

else {
    sendJson(['error' => 'Método no permitido'], 405);
}
?>
