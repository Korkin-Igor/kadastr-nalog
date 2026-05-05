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
        clearAuthenticatedSession();

        jsonResponse([
            'authenticated' => false,
        ]);
    }

    if ($action === 'change_password') {
        $sessionAdmin = requireAuthenticatedAdmin();
        $currentPassword = (string) ($payload['currentPassword'] ?? '');
        $newPassword = (string) ($payload['newPassword'] ?? '');

        if ($currentPassword === '' || $newPassword === '') {
            jsonResponse([
                'error' => 'Введите текущий и новый пароль.',
                'code' => 'missing_passwords',
            ], 422);
        }

        $newPasswordLength = function_exists('mb_strlen')
            ? mb_strlen($newPassword)
            : strlen($newPassword);

        if ($newPasswordLength < 8) {
            jsonResponse([
                'error' => 'Новый пароль должен содержать минимум 8 символов.',
                'code' => 'password_too_short',
            ], 422);
        }

        $admin = findAdminById((int) $sessionAdmin['id']);

        if ($admin === null || !(bool) $admin['is_active']) {
            clearAuthenticatedSession();

            jsonResponse([
                'error' => 'Сессия администратора больше не действительна. Войдите снова.',
                'code' => 'admin_session_invalid',
            ], 401);
        }

        if (!password_verify($currentPassword, (string) $admin['password_hash'])) {
            jsonResponse([
                'error' => 'Текущий пароль указан неверно.',
                'code' => 'invalid_current_password',
            ], 422);
        }

        if (password_verify($newPassword, (string) $admin['password_hash'])) {
            jsonResponse([
                'error' => 'Новый пароль должен отличаться от текущего.',
                'code' => 'password_reused',
            ], 422);
        }

        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        if (!is_string($passwordHash) || $passwordHash === '') {
            jsonResponse([
                'error' => 'Не удалось подготовить новый пароль к сохранению.',
                'code' => 'password_hash_failed',
            ], 500);
        }

        updateAdminPasswordHash((int) $admin['id'], $passwordHash);
        session_regenerate_id(true);

        $_SESSION['admin'] = [
            'id' => (int) $admin['id'],
            'username' => (string) $admin['username'],
        ];

        jsonResponse([
            'changed' => true,
            'username' => (string) $admin['username'],
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
