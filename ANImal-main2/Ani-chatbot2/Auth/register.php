<?php
define('PUBLIC_ENDPOINT', true);
require __DIR__ . '/../config.php';

$d = input();

$full     = required($d, 'full_name');
$username = required($d, 'username');
$password = (string)($d['password'] ?? '');
$confirm  = (string)($d['confirm_password'] ?? '');

if (!preg_match('/^[A-Za-z0-9_]{3,30}$/', $username)) {
    json_error('Username must be 3-30 characters: letters, numbers, underscore only.');
}
if (strlen($password) < 6) {
    json_error('Password must be at least 6 characters.');
}
if ($password !== $confirm) {
    json_error('Passwords do not match.');
}

$check = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username=?');
$check->execute([$username]);
if ((int)$check->fetchColumn() > 0) {
    json_error('Username is already taken.');
}

$s = $pdo->prepare('INSERT INTO users(full_name,username,password_hash) VALUES(?,?,?)');
$s->execute([$full, $username, password_hash($password, PASSWORD_DEFAULT)]);

json_ok(['message' => 'Account created. You can now log in.']);
