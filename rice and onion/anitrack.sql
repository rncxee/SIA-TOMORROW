-- ============================================================
-- ANITRACK DATABASE
-- ------------------------------------------------------------
-- (Renamed from "tanimtayo" — same structure, new name.)
-- How to use this file:
-- 1. Start Apache + MySQL in XAMPP
-- 2. Go to http://localhost/phpmyadmin
-- 3. Click "New", name it "anitrack", open the "SQL" tab,
--    paste this whole file in, and click "Go"
--
-- If you already have the old "tanimtayo" database and want to
-- switch cleanly, you can drop it first:
--   DROP DATABASE IF EXISTS tanimtayo;
-- ============================================================

CREATE DATABASE IF NOT EXISTS anitrack;
USE anitrack;

-- ------------------------------------------------------------
-- PLOTS — only two crop types for now: Onion or Rice.
-- ------------------------------------------------------------
CREATE TABLE plots (
    plot_id    INT AUTO_INCREMENT PRIMARY KEY,
    plot_name  VARCHAR(50) NOT NULL,
    crop_type  ENUM('Onion','Rice') NOT NULL,
    status     ENUM('Available','Occupied') DEFAULT 'Available'
);

-- ------------------------------------------------------------
-- PLOT PLANTINGS — what is (or was) planted in a plot.
-- ------------------------------------------------------------
CREATE TABLE plot_plantings (
    planting_id       INT AUTO_INCREMENT PRIMARY KEY,
    plot_id           INT NOT NULL,
    variety_name      VARCHAR(100),
    date_planted      DATE,
    expected_harvest  DATE,
    is_current        BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (plot_id) REFERENCES plots(plot_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- WATERING TASKS
-- ------------------------------------------------------------
CREATE TABLE watering_tasks (
    task_id    INT AUTO_INCREMENT PRIMARY KEY,
    plot_id    INT NOT NULL,
    task_date  DATE NOT NULL,
    is_done    BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (plot_id) REFERENCES plots(plot_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- HARVEST RECORDS
-- ------------------------------------------------------------
CREATE TABLE harvest_records (
    harvest_id    INT AUTO_INCREMENT PRIMARY KEY,
    plot_id       INT NOT NULL,
    harvest_date  DATE DEFAULT (CURRENT_DATE),
    quantity_kg   DECIMAL(6,2),
    notes         VARCHAR(255),
    FOREIGN KEY (plot_id) REFERENCES plots(plot_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- SEED INVENTORY
-- ------------------------------------------------------------
CREATE TABLE seed_inventory (
    seed_id             INT AUTO_INCREMENT PRIMARY KEY,
    seed_name           VARCHAR(100) NOT NULL,
    crop_type           ENUM('Onion','Rice') NOT NULL,
    quantity_grams      DECIMAL(8,2) DEFAULT 0,
    low_stock_threshold DECIMAL(8,2) DEFAULT 100
);

-- ============================================================
-- SAMPLE DATA — delete these rows once you add your own
-- ============================================================

INSERT INTO plots (plot_name, crop_type, status) VALUES
('Plot A1', 'Onion', 'Occupied'),
('Plot A2', 'Rice', 'Occupied'),

INSERT INTO plot_plantings (plot_id, variety_name, date_planted, expected_harvest, is_current) VALUES
(1, 'Red Creole Onion', '2026-08-01', '2026-11-01', TRUE),
(2, 'IR64 Rice', '2026-07-15', '2026-11-15', TRUE),

INSERT INTO watering_tasks (plot_id, task_date, is_done) VALUES
(1, CURRENT_DATE, FALSE),
(2, CURRENT_DATE, FALSE),

INSERT INTO harvest_records (plot_id, harvest_date, quantity_kg, notes) VALUES
(2, '2026-09-14', 45.00, 'First rice harvest of the season'),
(1, '2026-09-10', 12.50, 'Onion bulbs, good size');

INSERT INTO seed_inventory (seed_name, crop_type, quantity_grams, low_stock_threshold) VALUES
('Red Creole Onion Seeds', 'Onion', 350, 100),
('Yellow Granex Onion Seeds', 'Onion', 80, 100),
('IR64 Rice Seeds', 'Rice', 500, 150),
('NSIC Rc222 Rice Seeds', 'Rice', 120, 150);
