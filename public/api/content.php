<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $storedContent = loadStoredLandingContent();

    jsonResponse([
        'content' => $storedContent['content'] ?? null,
        'updatedAt' => $storedContent['updatedAt'] ?? null,
    ]);
}

if ($method === 'POST') {
    $admin = requireAuthenticatedAdmin();
    $payload = readJsonRequest();
    $action = (string) ($payload['action'] ?? 'save');
    $content = $payload['content'] ?? null;

    if ($action !== 'save') {
        jsonResponse([
            'error' => 'Неизвестное действие для content API.',
            'code' => 'unsupported_action',
        ], 422);
    }

    if (!is_array($content)) {
        jsonResponse([
            'error' => 'Контент для сохранения должен быть JSON-объектом.',
            'code' => 'invalid_content_payload',
        ], 422);
    }

    $updatedAt = saveStoredLandingContent($content, (int) $admin['id']);

    jsonResponse([
        'saved' => true,
        'updatedAt' => $updatedAt,
    ]);
}

jsonResponse([
    'error' => 'Метод не поддерживается.',
    'code' => 'method_not_allowed',
], 405);
