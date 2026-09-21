<?php
/* ============================================================
   ADD_PLANTING.PHP
   ------------------------------------------------------------
   Expects POST fields: plot_id, variety_name, date_planted, expected_harvest

   A plot can only have ONE "current" planting at a time, so
   this first marks any existing current planting for this plot
   as no longer current, then inserts the new one. This keeps a
   history of everything ever planted in that plot.
   ============================================================ */

require "../config.php";

$plot_id          = $_POST["plot_id"] ?? "";
$variety_name     = $_POST["variety_name"] ?? "";
$date_planted     = $_POST["date_planted"] ?? null;
$expected_harvest = $_POST["expected_harvest"] ?? null;

if ($plot_id === "" || $variety_name === "") {
    echo json_encode(["success" => false, "message" => "Plot and variety name are required."]);
    exit;
}

// Step 1: retire the old planting (if any)
$stmt = $conn->prepare("UPDATE plot_plantings SET is_current = FALSE WHERE plot_id = ? AND is_current = TRUE");
$stmt->bind_param("i", $plot_id);
$stmt->execute();
$stmt->close();

// Step 2: insert the new one
$stmt = $conn->prepare("
    INSERT INTO plot_plantings (plot_id, variety_name, date_planted, expected_harvest, is_current)
    VALUES (?, ?, ?, ?, TRUE)
");
$stmt->bind_param("isss", $plot_id, $variety_name, $date_planted, $expected_harvest);

if ($stmt->execute()) {
    // A newly planted plot should also show as Occupied
    $conn->query("UPDATE plots SET status = 'Occupied' WHERE plot_id = " . intval($plot_id));
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
