<?php
/* ============================================================
   GET_PLOTS.PHP
   ------------------------------------------------------------
   Returns every plot, plus whatever is currently planted in it
   (if anything), as JSON.
   ============================================================ */

require "../config.php";

$plots = [];

$result = $conn->query("
    SELECT plots.plot_id, plots.plot_name, plots.crop_type, plots.status,
           plantings.planting_id, plantings.variety_name,
           plantings.date_planted, plantings.expected_harvest
    FROM plots
    LEFT JOIN plot_plantings AS plantings
        ON plots.plot_id = plantings.plot_id AND plantings.is_current = TRUE
    ORDER BY plots.plot_name ASC
");

while ($row = $result->fetch_assoc()) {
    $plots[] = $row;
}

header("Content-Type: application/json");
echo json_encode(["success" => true, "plots" => $plots]);

$conn->close();
?>
