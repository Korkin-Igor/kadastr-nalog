<?php

declare(strict_types=1);

$bootstrapCandidates = [
    __DIR__ . '/public/api/bootstrap.php',
    __DIR__ . '/api/bootstrap.php',
];

$bootstrapPath = null;

foreach ($bootstrapCandidates as $candidate) {
    if (is_file($candidate)) {
        $bootstrapPath = $candidate;
        break;
    }
}

if ($bootstrapPath === null) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Не найден файл bootstrap.php для обработки формы.',
        'code' => 'bootstrap_missing',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

require $bootstrapPath;

$input = readJsonRequest();

if ($input === []) {
    $input = $_POST;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    jsonResponse(['success' => false], 405);
}

requireVerifiedRecaptcha($input, 'lead_form_submit');

// 1. Определяем тип формы по заголовку
$formTitle = trim($input['_formTitle'] ?? '');

// Маппинг тем писем для аккуратности (можно менять текст здесь)
$subjects = [
    'Проверить возможность снизить налоговые риски в бизнесе' => '📊 Заявка: Налоговые риски',
    'Проверить кадастровую стоимость недвижимости'           => '🏠 Заявка: Кадастровая стоимость',
    'Оставьте контакты и сферу бизнеса'                      => '🤝 Заявка: Сфера бизнеса',
    'Запросить анализ по объекту'                            => '🔍 Заявка: Анализ объекта',
    'Запросить подбор шаблонов'                              => '📄 Заявка: Шаблоны',
    'Подать заявку на журнал'                                => '📰 Заявка: Журнал',
    'Оформить подписку на рассылку'                          => '📬 Заявка: Рассылка',
    'Получить программы и форматы обучения'                  => '🎓 Заявка: Обучение',
    'Купить видео и аудио по налогу на имущество'            => '🎧 Заявка: Видео и аудио',
    'Получить чек-лист и скидку 10%'                         => '🎁 Заявка: Чек-лист и скидка',
    'Оставить заявку на участие'                             => '✅ Заявка: Участие',
];

$fields = [
    'Cadastral' => 'Кадастровый номер',
    'Phone' => 'Номер телефона',
    'Email' => 'Адрес электронной почты',
    'Business' => 'Сфера бизнеса',
    'Industry' => 'Отрасль',
    'Sections' => 'Разделы',
    'RequestedDocuments' => 'Выбранные документы',
    'DocumentsCount' => 'Количество документов',
    'PreferredFormats' => 'Предпочтительный формат',
    'RequestedMaterials' => 'Выбранные материалы',
    'MaterialsCount' => 'Количество материалов',
    'PurchaseFlow' => 'Сценарий покупки',
    'Source' => 'Источник заявки',
    'Offer' => 'Предложение',
];

$subject = $subjects[$formTitle] ?? "📩 Новая заявка: $formTitle";

// 2. Формируем тело письма (только полезные данные)
$messageLines = [];

// Сначала добавим заголовок формы текстом, чтобы было понятно контекст
$messageLines[] = "Форма: $formTitle";
$messageLines[] = "----------------------------------------";

// Перебираем все пришедшие поля
foreach ($input as $key => $value) {
    // Пропускаем служебные ключи, которые начинаются с подчеркивания
    if (str_starts_with($key, '_')) {
        continue;
    }

    // Пропускаем пустые значения
    if (is_array($value)) {
        $value = implode(', ', $value);
    }

    $value = trim($value);
    if ($value === '') {
        continue;
    }

    // Красивое название поля (первая буква заглавная, нижние подчеркивания заменяем на пробелы)
    $normalizedKey = ucfirst(str_replace('_', ' ', $key));
    $label = $fields[$normalizedKey] ?? $normalizedKey;

    if ($label === 'Номер телефона') {
        $value = "+7$value";
    } elseif ($label === 'Кадастровый номер') {
        $value = preg_replace('/^(\d{2})(\d{2})(\d{7})(\d{2})$/', '$1:$2:$3:$4', $value);
    }

    $messageLines[] = "$label: $value";
}

$message = implode("\n", $messageLines);

// 3. Отправка
$to = 'kadastr-nalog@kadastr-nalog.ru';
$from = $to;

$headers = "From: $from\r\n";
$headers .= "Reply-To: $from\r\n"; // Или можно подставлять email клиента, если он есть в $input['email']
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";

if (!mail($to, $subject, $message, $headers, "-f$from")) {
    jsonResponse([
        'success' => false,
        'error' => 'Сервер не смог отправить письмо через mail(). Проверьте почтовую настройку хостинга.',
        'code' => 'mail_failed',
    ], 500);
}

jsonResponse(['success' => true]);
