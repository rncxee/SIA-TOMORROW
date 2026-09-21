<?php
/* ============================================================
   MARK_DONE.PHP
   ------------------------------------------------------------
   Expects POST fields: task_id, is_done (1 or 0)
   Flips a task's completed status — used by the checkbox on
   the Watering Tasks page.
   ============================================================ */

require "../config.php";

$task_id = $_POST["task_id"] ?? "";
$is_done = $_POST["is_done"] ?? "0";

if ($task_id === "") {
    echo json_encode(["success" => false, "message" => "task_id is required."]);
    exit;
}

$stmt = $conn->prepare("UPDATE watering_tasks SET is_done = ? WHERE task_id = ?");
$stmt->bind_param("ii", $is_done, $task_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
