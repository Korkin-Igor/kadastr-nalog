<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$recaptchaConfig = getRecaptchaConfig();
$siteKey = trim((string) ($recaptchaConfig['site_key'] ?? ''));
$secretKey = trim((string) ($recaptchaConfig['secret_key'] ?? ''));

jsonResponse([
    'recaptcha' => [
        'enabled' => $siteKey !== '' && $secretKey !== '',
        'siteKey' => $siteKey !== '' && $secretKey !== '' ? $siteKey : '',
    ],
]);
