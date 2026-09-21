<?php
/* ============================================================
   UPDATE_SEED.PHP
   ------------------------------------------------------------
   Expects POST fields: seed_id, quantity_grams
   Used by the "Update Quantity" button on the Seed Inventory
   page — e.g. after distributing packets or restocking.
   ============================================================ */

require "../config.php";

$seed_id        = $_POST["seed_id"] ?? "";
$quantity_grams = $_POST["quantity_grams"] ?? "";

if ($seed_id === "" || $quantity_grams === "") {
    echo json_encode(["success" => false, "message" => "seed_id and quantity_grams are required."]);
    exit;
}

$stmt = $conn->prepare("UPDATE seed_inventory SET quantity_grams = ? WHERE seed_id = ?");
$stmt->bind_param("di", $quantity_grams, $seed_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
