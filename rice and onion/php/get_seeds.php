<?php
/* ============================================================
   GET_SEEDS.PHP
   ------------------------------------------------------------
   Returns the full seed inventory as JSON.
   ============================================================ */

require "../config.php";

$seeds = [];

$result = $conn->query("
    SELECT seed_id, seed_name, crop_type, quantity_grams, low_stock_threshold
    FROM seed_inventory
    ORDER BY crop_type ASC, seed_name ASC
");

while ($row = $result->fetch_assoc()) {
    $seeds[] = $row;
}

header("Content-Type: application/json");
echo json_encode(["success" => true, "seeds" => $seeds]);

$conn->close();
?>
