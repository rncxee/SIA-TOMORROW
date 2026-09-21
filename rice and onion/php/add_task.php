<?php
/* ============================================================
   ADD_TASK.PHP
   ------------------------------------------------------------
   Expects POST fields: plot_id, task_date
   ============================================================ */

require "../config.php";

$plot_id   = $_POST["plot_id"] ?? "";
$task_date = $_POST["task_date"] ?? "";

if ($plot_id === "" || $task_date === "") {
    echo json_encode(["success" => false, "message" => "Plot and date are required."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO watering_tasks (plot_id, task_date, is_done) VALUES (?, ?, FALSE)");
$stmt->bind_param("is", $plot_id, $task_date);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "task_id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
