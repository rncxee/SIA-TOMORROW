<?php
/* ============================================================
   ADD_HARVEST.PHP
   ------------------------------------------------------------
   Expects POST fields: plot_id, harvest_date, quantity_kg, notes
   ============================================================ */

require "../config.php";

$plot_id      = $_POST["plot_id"] ?? "";
$harvest_date = $_POST["harvest_date"] ?? "";
$quantity_kg  = $_POST["quantity_kg"] ?? "";
$notes        = $_POST["notes"] ?? "";

if ($plot_id === "" || $harvest_date === "" || $quantity_kg === "") {
    echo json_encode(["success" => false, "message" => "Plot, date, and quantity are required."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO harvest_records (plot_id, harvest_date, quantity_kg, notes) VALUES (?, ?, ?, ?)");
// The type string "isds" must match the ? order above:
// i = plot_id (integer), s = harvest_date (string), d = quantity_kg (decimal), s = notes (string)
$stmt->bind_param("isds", $plot_id, $harvest_date, $quantity_kg, $notes);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "harvest_id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
