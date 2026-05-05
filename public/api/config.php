<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Конфиг подключения к MySQL и схема БД
|--------------------------------------------------------------------------
|
| 1. Заполните реквизиты подключения ниже.
| 2. Создайте таблицы этим SQL:
|
| CREATE TABLE `admin_users` (
|   `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
|   `username` VARCHAR(100) NOT NULL,
|   `password_hash` VARCHAR(255) NOT NULL,
|   `is_active` TINYINT(1) NOT NULL DEFAULT 1,
|   `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
|   `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
|   PRIMARY KEY (`id`),
|   UNIQUE KEY `uniq_admin_users_username` (`username`)
| ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
|
| CREATE TABLE `site_content` (
|   `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
|   `content_key` VARCHAR(100) NOT NULL,
|   `content_json` LONGTEXT NOT NULL,
|   `updated_by` INT UNSIGNED NULL DEFAULT NULL,
|   `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
|   `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
|   PRIMARY KEY (`id`),
|   UNIQUE KEY `uniq_site_content_key` (`content_key`),
|   KEY `idx_site_content_updated_by` (`updated_by`),
|   CONSTRAINT `fk_site_content_updated_by`
|     FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`)
|     ON DELETE SET NULL
| ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
|
| Что хранится:
| - admin_users: пользователи админки
| - site_content: JSON-контент сайта; для этого проекта нужен ключ landing_page
|
| Как завести первого админа:
| - Сгенерируйте hash командой:
|   php -r "echo password_hash('СИЛЬНЫЙ_ПАРОЛЬ', PASSWORD_DEFAULT), PHP_EOL;"
| - Затем выполните:
|   INSERT INTO admin_users (username, password_hash) VALUES ('admin', 'ВСТАВЬТЕ_HASH_СЮДА');
|
| Как работает контент:
| - Если строки с content_key = 'landing_page' нет, сайт покажет встроенные данные из сборки.
| - После первого сохранения из /admin появится или обновится одна строка в site_content.
|
| Важно:
| - content_json хранит весь редактируемый JSON целиком, включая base64-картинки/видео,
|   если их заменили через админку.
| - Для больших видео это нормально только если MySQL разрешает нужный размер пакета.
|   При необходимости увеличьте max_allowed_packet на сервере.
|
| reCAPTCHA v3:
| - На фронте задайте VITE_RECAPTCHA_SITE_KEY в .env для Vite.
| - На сервере задайте переменную окружения RECAPTCHA_SECRET_KEY.
| - При необходимости настройте RECAPTCHA_MIN_SCORE, по умолчанию используется 0.5.
|
*/

return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'database' => 'p98835s0_p98835',
        'username' => 'p98835s0_p98835',
        'password' => 'Fzkadastr2027!2026',
    ],
    'content' => [
        'landing_key' => 'landing_page',
    ],
    'session' => [
        'name' => 'tax_risk_admin_session',
        'path' => '/',
        'domain' => '',
        'same_site' => 'Lax',
    ],
    'recaptcha' => [
        'secret_key' => getenv('RECAPTCHA_SECRET_KEY') ?: '6LcOwbosAAAAADDBPeATlLMybI_ax9npGo4gxsW1',
        'min_score' => (float) (getenv('RECAPTCHA_MIN_SCORE') ?: 0.5),
    ],
];
