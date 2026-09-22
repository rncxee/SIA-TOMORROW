<?php

require 'config.php';

$sql = "SELECT
            w.*,
            p.name plot_name,
            p.crop_type
        FROM watering_tasks w
        JOIN plots p ON p.id=w.plot_id
        ORDER BY w.task_date DESC,w.id DESC";

json_ok([
    'tasks' => $pdo
        ->query($sql)
        ->fetchAll()
]);