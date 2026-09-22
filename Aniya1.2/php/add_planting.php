<?php

require 'config.php';

$d = input();

$plot = (int)($d['plot_id'] ?? 0);
$crop = required($d, 'crop_name');
$variety = trim((string)($d['variety'] ?? ''));
$planted = required($d, 'planted_date');
$expected = trim((string)($d['expected_harvest_date'] ?? ''));
$notes = trim((string)($d['notes'] ?? ''));

if (!$plot) {
    json_error('Select a plot.');
}

$pdo->beginTransaction();

try {
    $s = $pdo->prepare(
        'INSERT INTO plantings(
            plot_id,
            crop_name,
            variety,
            planted_date,
            expected_harvest_date,
            notes
        ) VALUES(?,?,?,?,?,?)'
    );

    $s->execute([
        $plot,
        $crop,
        $variety ?: null,
        $planted,
        $expected ?: null,
        $notes ?: null
    ]);

    $pdo
        ->prepare("UPDATE plots SET status='Occupied' WHERE id=?")
        ->execute([$plot]);

    $pdo->commit();

    json_ok([
        'message' => 'Planting added.'
    ]);

} catch (Throwable $e) {
    $pdo->rollBack();

    json_error(
        'Unable to add planting.'
    );
}