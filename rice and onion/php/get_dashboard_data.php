<?php
/* ============================================================
   GET_DASHBOARD_DATA.PHP
   ------------------------------------------------------------
   Looks up everything the Dashboard needs and sends it back as
   JSON: stat counts, the plot overview grid, today's watering
   tasks, recent harvests, and the seed inventory.
   ============================================================ */

require "config.php";

$response = [
    "success" => true,
    "stats"   => [],
    "plots"   => [],
    "tasks"   => [],
    "harvests"=> [],
    "seeds"   => []
];

// ------------------------------------------------------------
// 1. STAT CARD NUMBERS
// ------------------------------------------------------------
$result = $conn->query("SELECT COUNT(*) AS total FROM plots WHERE crop_type = 'Onion'");
$response["stats"]["onion_plots"] = (int) $result->fetch_assoc()["total"];

$result = $conn->query("SELECT COUNT(*) AS total FROM plots WHERE crop_type = 'Rice'");
$response["stats"]["rice_plots"] = (int) $result->fetch_assoc()["total"];

$result = $conn->query("
    SELECT COUNT(*) AS total FROM watering_tasks
    WHERE task_date = CURDATE() AND is_done = FALSE
");
$response["stats"]["tasks_due_today"] = (int) $result->fetch_assoc()["total"];

$result = $conn->query("
    SELECT COUNT(*) AS total FROM harvest_records
    WHERE harvest_date >= CURDATE() - INTERVAL 7 DAY
");
$response["stats"]["recent_harvests"] = (int) $result->fetch_assoc()["total"];

// ------------------------------------------------------------
// 2. PLOT OVERVIEW (for the visual grid)
// ------------------------------------------------------------
$result = $conn->query("
    SELECT plots.plot_id, plots.plot_name, plots.crop_type, plots.status,
           plantings.variety_name
    FROM plots
    LEFT JOIN plot_plantings AS plantings
        ON plots.plot_id = plantings.plot_id AND plantings.is_current = TRUE
    ORDER BY plots.plot_name ASC
");
while ($row = $result->fetch_assoc()) {
    $response["plots"][] = $row;
}

// ------------------------------------------------------------
// 3. TODAY'S WATERING TASKS
// ------------------------------------------------------------
$result = $conn->query("
    SELECT watering_tasks.task_id, watering_tasks.is_done, plots.plot_name, plots.crop_type
    FROM watering_tasks
    JOIN plots ON watering_tasks.plot_id = plots.plot_id
    WHERE watering_tasks.task_date = CURDATE()
    ORDER BY watering_tasks.is_done ASC
");
while ($row = $result->fetch_assoc()) {
    $response["tasks"][] = $row;
}

// ------------------------------------------------------------
// 4. RECENT HARVESTS (last 5)
// ------------------------------------------------------------
$result = $conn->query("
    SELECT harvest_records.harvest_date, harvest_records.quantity_kg,
           plots.plot_name, plots.crop_type
    FROM harvest_records
    JOIN plots ON harvest_records.plot_id = plots.plot_id
    ORDER BY harvest_records.harvest_date DESC
    LIMIT 5
");
while ($row = $result->fetch_assoc()) {
    $response["harvests"][] = $row;
}

// ------------------------------------------------------------
// 5. SEED INVENTORY
// ------------------------------------------------------------
$result = $conn->query("
    SELECT seed_name, crop_type, quantity_grams, low_stock_threshold
    FROM seed_inventory
    ORDER BY crop_type ASC, seed_name ASC
");
while ($row = $result->fetch_assoc()) {
    $response["seeds"][] = $row;
}

header("Content-Type: application/json");
echo json_encode($response);

$conn->close();
?>
