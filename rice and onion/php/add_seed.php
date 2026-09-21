<?php
/* ============================================================
   ADD_SEED.PHP
   ------------------------------------------------------------
   Expects POST fields: seed_name, crop_type, quantity_grams, low_stock_threshold
   ============================================================ */

require "../config.php";

$seed_name          = $_POST["seed_name"] ?? "";
$crop_type          = $_POST["crop_type"] ?? "";
$quantity_grams     = $_POST["quantity_grams"] ?? "0";
$low_stock_threshold = $_POST["low_stock_threshold"] ?? "100";

if ($seed_name === "" || $crop_type === "") {
    echo json_encode(["success" => false, "message" => "Seed name and crop type are required."]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO seed_inventory (seed_name, crop_type, quantity_grams, low_stock_threshold)
    VALUES (?, ?, ?, ?)
");
$stmt->bind_param("ssdd", $seed_name, $crop_type, $quantity_grams, $low_stock_threshold);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "seed_id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
