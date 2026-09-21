<?php
/* ============================================================
   CONFIG.PHP
   ------------------------------------------------------------
   This is the ONE file that knows how to connect to the
   database. Every other PHP file will "require" this file
   instead of writing its own connection code.

   If you ever change your database name, username, or
   password, this is the only file you need to edit.
   ============================================================ */

// --- Your database settings (default XAMPP values) ---
$DB_HOST     = "localhost";
$DB_USERNAME = "root";
$DB_PASSWORD = "";           // XAMPP's default MySQL user has no password
$DB_NAME     = "anitrack";

// --- Create the connection ---
$conn = new mysqli($DB_HOST, $DB_USERNAME, $DB_PASSWORD, $DB_NAME);

// --- Stop and show a clear message if the connection fails ---
if ($conn->connect_error) {
    // die() stops the script and prints this message instead of
    // showing a confusing default PHP error.
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

// Make sure special characters (like ñ) display correctly
$conn->set_charset("utf8mb4");
?>
