<?php

require 'config.php';

$d = input();

$name = required($d, 'seed_name');
$crop = required($d, 'crop_type');
$qty = (float)($d['quantity_g'] ?? 0);
$threshold = (float)($d['threshold_g'] ?? 0);

if (
    !in_array($crop, ['Onion', 'Rice'], true) ||
    $qty < 0 ||
    $threshold < 0
) {
    json_error('Invalid seed data.');
}

$s = $pdo->prepare(
    'INSERT INTO seeds(seed_name,crop_type,quantity_g,threshold_g)
     VALUES(?,?,?,?)'
);

$s->execute([
    $name,
    $crop,
    $qty,
    $threshold
]);

json_ok([
    'message' => 'Seed added.'
]);