<?php
/* ============================================================
   UPDATE_PLOT.PHP
   ------------------------------------------------------------
   Expects POST fields: plot_id, plot_name, crop_type, status
   Updates that one plot's row.
   ============================================================ */

require "../config.php";

$plot_id   = $_POST["plot_id"] ?? "";
$plot_name = $_POST["plot_name"] ?? "";
$crop_type = $_POST["crop_type"] ?? "";
$status    = $_POST["status"] ?? "";

if ($plot_id === "" || $plot_name === "" || $crop_type === "" || $status === "") {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

$stmt = $conn->prepare("UPDATE plots SET plot_name = ?, crop_type = ?, status = ? WHERE plot_id = ?");
$stmt->bind_param("sssi", $plot_name, $crop_type, $status, $plot_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
