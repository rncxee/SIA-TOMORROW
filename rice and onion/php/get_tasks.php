<?php
/* ============================================================
   GET_TASKS.PHP
   ------------------------------------------------------------
   Returns every watering task, with the plot name attached,
   as JSON. Unfinished tasks are listed first.
   ============================================================ */

require "../config.php";

$tasks = [];

$result = $conn->query("
    SELECT watering_tasks.task_id, watering_tasks.task_date, watering_tasks.is_done,
           plots.plot_id, plots.plot_name, plots.crop_type
    FROM watering_tasks
    JOIN plots ON watering_tasks.plot_id = plots.plot_id
    ORDER BY watering_tasks.is_done ASC, watering_tasks.task_date ASC
");

while ($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

header("Content-Type: application/json");
echo json_encode(["success" => true, "tasks" => $tasks]);

$conn->close();
?>
