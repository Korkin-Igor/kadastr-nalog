<?php

declare(strict_types=1);

$appConfig = require __DIR__ . '/config.php';

startApplicationSession($appConfig);

function getAppConfig(): array
{
    global $appConfig;

    return $appConfig;
}

function startApplicationSession(array $config): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $sessionConfig = $config['session'] ?? [];
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443');

    session_name((string) ($sessionConfig['name'] ?? 'site_admin_session'));
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => (string) ($sessionConfig['path'] ?? '/'),
        'domain' => (string) ($sessionConfig['domain'] ?? ''),
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => (string) ($sessionConfig['same_site'] ?? 'Lax'),
    ]);

    session_start();
}

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonRequest(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || $raw === '') {
        return [];
    }

    $data = json_decode($raw, true);

    if (!is_array($data)) {
        jsonResponse([
            'error' => 'Некорректный JSON в запросе.',
            'code' => 'invalid_json',
        ], 400);
    }

    return $data;
}

function getRecaptchaConfig(): array
{
    return getAppConfig()['recaptcha'] ?? [];
}

function getClientIpAddress(): string
{
    $forwarded = trim((string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''));

    if ($forwarded !== '') {
        $parts = array_map('trim', explode(',', $forwarded));
        return (string) ($parts[0] ?? '');
    }

    return trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
}

function postJsonLikeRequest(string $url, array $payload): array
{
    $encodedPayload = http_build_query($payload);

    if (function_exists('curl_init')) {
        $curlHandle = curl_init($url);

        if ($curlHandle !== false) {
            curl_setopt_array($curlHandle, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_POSTFIELDS => $encodedPayload,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/x-www-form-urlencoded',
                ],
            ]);

            $responseBody = curl_exec($curlHandle);
            $curlError = curl_error($curlHandle);
            $statusCode = (int) curl_getinfo($curlHandle, CURLINFO_RESPONSE_CODE);
            curl_close($curlHandle);

            if (is_string($responseBody) && $responseBody !== '') {
                return [
                    'body' => $responseBody,
                    'status' => $statusCode,
                ];
            }

            if ($curlError !== '') {
                return [
                    'body' => '',
                    'status' => $statusCode,
                    'error' => $curlError,
                ];
            }
        }
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $encodedPayload,
            'timeout' => 10,
            'ignore_errors' => true,
        ],
    ]);

    $responseBody = @file_get_contents($url, false, $context);

    return [
        'body' => is_string($responseBody) ? $responseBody : '',
        'status' => 0,
    ];
}

function verifyRecaptchaToken(string $token): array
{
    $config = getRecaptchaConfig();
    $secretKey = trim((string) ($config['secret_key'] ?? ''));

    if ($secretKey === '') {
        return [
            'success' => false,
            'error-codes' => ['missing-input-secret'],
        ];
    }

    $payload = [
        'secret' => $secretKey,
        'response' => $token,
    ];

    $clientIp = getClientIpAddress();

    if ($clientIp !== '') {
        $payload['remoteip'] = $clientIp;
    }

    $response = postJsonLikeRequest(
        'https://www.google.com/recaptcha/api/siteverify',
        $payload
    );

    if (($response['body'] ?? '') === '') {
        jsonResponse([
            'error' => 'Не удалось проверить reCAPTCHA на сервере.',
            'code' => 'recaptcha_unavailable',
            'details' => $response['error'] ?? '',
        ], 502);
    }

    $result = json_decode((string) $response['body'], true);

    if (!is_array($result)) {
        jsonResponse([
            'error' => 'Сервис reCAPTCHA вернул некорректный ответ.',
            'code' => 'recaptcha_invalid_response',
        ], 502);
    }

    return $result;
}

function requireVerifiedRecaptcha(array $payload, string $expectedAction): void
{
    $config = getRecaptchaConfig();
    $secretKey = trim((string) ($config['secret_key'] ?? ''));

    if ($secretKey === '') {
        return;
    }

    $token = trim((string) ($payload['recaptchaToken'] ?? $payload['_recaptchaToken'] ?? ''));
    $action = trim((string) ($payload['recaptchaAction'] ?? $payload['_recaptchaAction'] ?? ''));

    if ($token === '' || $action === '') {
        jsonResponse([
            'error' => 'Не пройдена проверка reCAPTCHA.',
            'code' => 'recaptcha_missing',
        ], 422);
    }

    if ($action !== $expectedAction) {
        jsonResponse([
            'error' => 'Некорректное действие reCAPTCHA.',
            'code' => 'recaptcha_action_mismatch',
        ], 422);
    }

    $result = verifyRecaptchaToken($token);

    if (!(bool) ($result['success'] ?? false)) {
        jsonResponse([
            'error' => 'Проверка reCAPTCHA не пройдена.',
            'code' => 'recaptcha_failed',
            'details' => $result['error-codes'] ?? [],
        ], 422);
    }

    if (($result['action'] ?? '') !== $expectedAction) {
        jsonResponse([
            'error' => 'Ответ reCAPTCHA не соответствует действию формы.',
            'code' => 'recaptcha_action_invalid',
        ], 422);
    }

    $score = isset($result['score']) ? (float) $result['score'] : 0.0;
    $minimumScore = (float) ($config['min_score'] ?? 0.5);

    if ($score < $minimumScore) {
        jsonResponse([
            'error' => 'reCAPTCHA отметила запрос как подозрительный.',
            'code' => 'recaptcha_low_score',
        ], 422);
    }
}

function getPdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = getAppConfig()['db'] ?? [];

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $db['host'] ?? '127.0.0.1',
        (int) ($db['port'] ?? 3306),
        $db['database'] ?? ''
    );

    try {
        $pdo = new PDO(
            $dsn,
            (string) ($db['username'] ?? ''),
            (string) ($db['password'] ?? ''),
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    } catch (PDOException $exception) {
        jsonResponse([
            'error' => 'Не удалось подключиться к базе данных.',
            'code' => 'db_connection_failed',
        ], 500);
    }

    return $pdo;
}

function getLandingContentKey(): string
{
    return (string) (getAppConfig()['content']['landing_key'] ?? 'landing_page');
}

function getAuthenticatedAdmin(): ?array
{
    $admin = $_SESSION['admin'] ?? null;

    if (!is_array($admin) || !isset($admin['id'], $admin['username'])) {
        return null;
    }

    return [
        'id' => (int) $admin['id'],
        'username' => (string) $admin['username'],
    ];
}

function requireAuthenticatedAdmin(): array
{
    $admin = getAuthenticatedAdmin();

    if ($admin === null) {
        jsonResponse([
            'error' => 'Нужна авторизация в админке.',
            'code' => 'unauthorized',
        ], 401);
    }

    return $admin;
}

function clearAuthenticatedSession(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            (bool) $params['secure'],
            (bool) $params['httponly']
        );
    }

    session_destroy();
}

function findAdminById(int $adminId): ?array
{
    $statement = getPdo()->prepare(
        'SELECT id, username, password_hash, is_active FROM admin_users WHERE id = :id LIMIT 1'
    );
    $statement->execute([
        ':id' => $adminId,
    ]);

    $admin = $statement->fetch();

    return is_array($admin) ? $admin : null;
}

function findAdminByUsername(string $username): ?array
{
    $statement = getPdo()->prepare(
        'SELECT id, username, password_hash, is_active FROM admin_users WHERE username = :username LIMIT 1'
    );
    $statement->execute([
        ':username' => $username,
    ]);

    $admin = $statement->fetch();

    return is_array($admin) ? $admin : null;
}

function updateAdminPasswordHash(int $adminId, string $passwordHash): void
{
    $statement = getPdo()->prepare(
        'UPDATE admin_users
         SET password_hash = :password_hash
         WHERE id = :id'
    );
    $statement->execute([
        ':password_hash' => $passwordHash,
        ':id' => $adminId,
    ]);
}

function loadStoredLandingContent(): ?array
{
    $statement = getPdo()->prepare(
        'SELECT content_json, updated_at FROM site_content WHERE content_key = :content_key LIMIT 1'
    );
    $statement->execute([
        ':content_key' => getLandingContentKey(),
    ]);

    $row = $statement->fetch();

    if (!is_array($row)) {
        return null;
    }

    $content = json_decode((string) $row['content_json'], true);

    if (!is_array($content)) {
        jsonResponse([
            'error' => 'В базе данных сохранён некорректный JSON контента.',
            'code' => 'invalid_stored_content',
        ], 500);
    }

    return [
        'content' => $content,
        'updatedAt' => (string) ($row['updated_at'] ?? ''),
    ];
}

function saveStoredLandingContent(array $content, int $adminId): string
{
    $encodedContent = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($encodedContent === false) {
        jsonResponse([
            'error' => 'Не удалось сериализовать контент перед сохранением.',
            'code' => 'content_encode_failed',
        ], 400);
    }

    $statement = getPdo()->prepare(
        'INSERT INTO site_content (content_key, content_json, updated_by)
         VALUES (:content_key, :content_json_insert, :updated_by_insert)
         ON DUPLICATE KEY UPDATE
           content_json = :content_json_update,
           updated_by = :updated_by_update,
           updated_at = CURRENT_TIMESTAMP'
    );

    $statement->execute([
        ':content_key' => getLandingContentKey(),
        ':content_json_insert' => $encodedContent,
        ':updated_by_insert' => $adminId,
        ':content_json_update' => $encodedContent,
        ':updated_by_update' => $adminId,
    ]);

    $updatedAtStatement = getPdo()->prepare(
        'SELECT updated_at FROM site_content WHERE content_key = :content_key LIMIT 1'
    );
    $updatedAtStatement->execute([
        ':content_key' => getLandingContentKey(),
    ]);

    $row = $updatedAtStatement->fetch();

    return (string) ($row['updated_at'] ?? gmdate('c'));
}
