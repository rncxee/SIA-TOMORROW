<?php
/* ============================================================
   ADD_PLOT.PHP
   ------------------------------------------------------------
   Expects POST fields: plot_name, crop_type, status
   Inserts a new row into the plots table.
   ============================================================ */

require "../config.php";

// Grab the submitted form values. The "?? ''" means "use an
// empty string if this field wasn't sent at all".
$plot_name = $_POST["plot_name"] ?? "";
$crop_type = $_POST["crop_type"] ?? "";
$status    = $_POST["status"] ?? "Available";

// Basic validation — don't insert if the required fields are empty
if ($plot_name === "" || $crop_type === "") {
    echo json_encode(["success" => false, "message" => "Plot name and crop type are required."]);
    exit;
}

// Using a "prepared statement" (the ? placeholders) protects
// against SQL injection — always do this instead of pasting
// user input directly into the SQL string.
$stmt = $conn->prepare("INSERT INTO plots (plot_name, crop_type, status) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $plot_name, $crop_type, $status);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "plot_id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
