<?php
// Aniya - Agricultural Navigation and Yield Activity Tracker
// Shared bootstrap: session, database connection and JSON helpers.
// Every endpoint requires this file.

session_start();
header('Content-Type: application/json; charset=utf-8');

// Use Philippine time so "today" matches the farmer's calendar (not UTC).
date_default_timezone_set('Asia/Manila');

// ---------------------------------------------------------------------
// Settings
// Override anything here by copying config.local.example.php to
// config.local.php (that file is ignored by git, so secrets stay private).
// ---------------------------------------------------------------------
$host    = 'localhost';
$db      = 'aniyatrack';
$user    = 'root';
$pass    = '';
$charset = 'utf8mb4';

if (is_file(__DIR__ . '/config.local.php')) {
    require __DIR__ . '/config.local.php';
}

// Chatbot: set ANTHROPIC_API_KEY in config.local.php (or as an environment
// variable) to enable AI answers. Leave it empty to use the built-in answers.
if (!defined('ANTHROPIC_API_KEY')) {
    define('ANTHROPIC_API_KEY', getenv('ANTHROPIC_API_KEY') ?: '');
}
// define('ANTHROPIC_MODEL', 'claude-haiku-5-5');

// ---------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed. Start XAMPP MySQL and import aniyatrack.sql.']);
    exit;
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function input(): array {
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (is_array($data)) return $data;
    return $_POST ?: [];
}

function json_ok($data = []): void {
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}

function json_error(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function required(array $data, string $key): string {
    $value = trim((string)($data[$key] ?? ''));
    if ($value === '') json_error("Missing required field: $key");
    return $value;
}

// Every endpoint requires login, except login.php / register.php / logout.php
// (they define PUBLIC_ENDPOINT before requiring this file).
if (!defined('PUBLIC_ENDPOINT') && empty($_SESSION['user_id'])) {
    json_error('Please log in first.', 401);
}
