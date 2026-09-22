<?php

require 'config.php';

$sql = "SELECT
            h.*,
            p.name plot_name,
            p.crop_type
        FROM harvests h
        JOIN plots p ON p.id=h.plot_id
        ORDER BY h.harvest_date DESC,h.id DESC";

json_ok([
    'harvests' => $pdo
        ->query($sql)
        ->fetchAll()
]);