<?php
define('PUBLIC_ENDPOINT', true);
require __DIR__ . '/../config.php';

$_SESSION = [];
session_destroy();

json_ok(['message' => 'Logged out.']);
