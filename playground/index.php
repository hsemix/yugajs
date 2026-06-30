<?php

declare(strict_types=1);

// $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = $_GET['path'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($method === 'OPTIONS') {
    exit;
}

if ($path === '/users' && $method === 'GET') {
    header('Content-Type: text/html');

    echo <<<HTML
    <ul>
        <li>Ali</li>
        <li>Aisha</li>
        <li>Musa</li>
    </ul>
    HTML;

    exit;
}

if ($path === '/users' && $method === 'POST') {
    header('Content-Type: text/html');

    $name = trim($_POST['name'] ?? 'Unknown');

    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

    echo "<div class=\"user\">{$safeName}</div>";

    exit;
}

if ($path === '/dashboard' && $method === 'GET') {
    header('Content-Type: text/html');

    $time = date('H:i:s');

    echo <<<HTML
    <div id="dashboard">
        <input value="This input should keep focus during morph">
        <p>Dashboard refreshed at {$time}</p>
        <strong>Status: Online</strong>
    </div>
    HTML;

    exit;
}

if ($path === '/stream' && $method === 'GET') {
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    for ($i = 1; $i <= 10; $i++) {
        $time = date('H:i:s');

        echo "data: <div>Message {$i} at {$time}</div>\n\n";

        ob_flush();
        flush();

        sleep(1);
    }

    exit;
}

http_response_code(404);
header('Content-Type: text/plain');
echo "Not Found";