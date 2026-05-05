<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $admin = getAuthenticatedAdmin();

    jsonResponse([
        'authenticated' => $admin !== null,
        'username' => $admin['username'] ?? '',
    ]);
}

if ($method === 'POST') {
    $payload = readJsonRequest();
    $action = (string) ($payload['action'] ?? 'login');

    if ($action === 'logout') {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
        }

        session_destroy();

        jsonResponse([
            'authenticated' => false,
        ]);
    }

    $username = trim((string) ($payload['username'] ?? ''));
    $password = (string) ($payload['password'] ?? '');

    if ($username === '' || $password === '') {
        jsonResponse([
            'error' => 'Введите логин и пароль.',
            'code' => 'missing_credentials',
        ], 422);
    }

    requireVerifiedRecaptcha($payload, 'admin_login');

    $admin = findAdminByUsername($username);

    if ($admin === null || !(bool) $admin['is_active'] || !password_verify($password, (string) $admin['password_hash'])) {
        jsonResponse([
            'error' => 'Неверный логин или пароль.',
            'code' => 'invalid_credentials',
        ], 401);
    }

    session_regenerate_id(true);
    $_SESSION['admin'] = [
        'id' => (int) $admin['id'],
        'username' => (string) $admin['username'],
    ];

    jsonResponse([
        'authenticated' => true,
        'username' => (string) $admin['username'],
    ]);
}

jsonResponse([
    'error' => 'Метод не поддерживается.',
    'code' => 'method_not_allowed',
], 405);
