<?php
// Aniya - Agricultural Navigation and Yield Activity Tracker
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$db   = 'aniya_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success'=>false, 'message'=>'Database connection failed. Start XAMPP MySQL and import aniyatrack.sql.']);
    exit;
}

function input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (is_array($data)) return $data;
    return $_POST ?: [];
}

function json_ok($data = []): void {
    echo json_encode(array_merge(['success'=>true], $data));
    exit;
}

function json_error(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success'=>false, 'message'=>$message]);
    exit;
}

function required(array $data, string $key): string {
    $value = trim((string)($data[$key] ?? ''));
    if ($value === '') json_error("Missing required field: $key");
    return $value;
}
