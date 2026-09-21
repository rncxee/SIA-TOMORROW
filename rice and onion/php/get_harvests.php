<?php
/* ============================================================
   GET_HARVESTS.PHP
   ------------------------------------------------------------
   Returns every harvest record ever logged, newest first.
   ============================================================ */

require "../config.php";

$harvests = [];

$result = $conn->query("
    SELECT harvest_records.harvest_id, harvest_records.harvest_date,
           harvest_records.quantity_kg, harvest_records.notes,
           plots.plot_name, plots.crop_type
    FROM harvest_records
    JOIN plots ON harvest_records.plot_id = plots.plot_id
    ORDER BY harvest_records.harvest_date DESC
");

while ($row = $result->fetch_assoc()) {
    $harvests[] = $row;
}

header("Content-Type: application/json");
echo json_encode(["success" => true, "harvests" => $harvests]);

$conn->close();
?>
