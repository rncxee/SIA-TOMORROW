-- Aniya / AniTrack database
-- Uses ONE database only: aniyatrack.
-- Safe to run against an existing installation: it does not drop tables or records.

CREATE DATABASE IF NOT EXISTS aniyatrack
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE aniyatrack;

CREATE TABLE IF NOT EXISTS plots (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    crop_type ENUM('Rice') NOT NULL DEFAULT 'Rice',
    status ENUM('Available','Occupied','Maintenance') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plantings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plot_id INT UNSIGNED NOT NULL,
    crop_name VARCHAR(150) NOT NULL,
    variety VARCHAR(150) DEFAULT NULL,
    planted_date DATE NOT NULL,
    expected_harvest_date DATE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_planting_plot FOREIGN KEY (plot_id)
        REFERENCES plots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- The task_type column is added below as a migration so this script works
-- both for new installations and existing aniyatrack databases.
CREATE TABLE IF NOT EXISTS watering_tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plot_id INT UNSIGNED NOT NULL,
    task_date DATE NOT NULL,
    done TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_watering_plot FOREIGN KEY (plot_id)
        REFERENCES plots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS harvests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plot_id INT UNSIGNED NOT NULL,
    harvest_date DATE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_harvest_plot FOREIGN KEY (plot_id)
        REFERENCES plots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seeds (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seed_name VARCHAR(150) NOT NULL,
    crop_type ENUM('Rice') NOT NULL DEFAULT 'Rice',
    quantity_g DECIMAL(10,2) NOT NULL DEFAULT 0,
    threshold_g DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS finance_transactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plot_id INT UNSIGNED NOT NULL,
    transaction_type ENUM('Expense','Income') NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    transaction_date DATE NOT NULL,
    notes VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_finance_plot FOREIGN KEY (plot_id)
        REFERENCES plots(id) ON DELETE CASCADE,
    INDEX idx_finance_date (transaction_date),
    INDEX idx_finance_type (transaction_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Add task_type to the EXISTING watering_tasks table only if missing.
-- Existing records automatically receive the default value 'Water'.
DROP PROCEDURE IF EXISTS migrate_watering_task_type;
DELIMITER //
CREATE PROCEDURE migrate_watering_task_type()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'watering_tasks'
          AND COLUMN_NAME = 'task_type'
    ) THEN
        ALTER TABLE watering_tasks
            ADD COLUMN task_type ENUM(
                'Water',
                'Fertilize',
                'Weed',
                'Pest Control',
                'Inspect',
                'Other'
            ) NOT NULL DEFAULT 'Water' AFTER task_date;
    END IF;
END //
DELIMITER ;
CALL migrate_watering_task_type();
DROP PROCEDURE IF EXISTS migrate_watering_task_type;

-- Verify the updated task table and selected task types.
DESCRIBE watering_tasks;
SELECT id, plot_id, task_date, task_type, done
FROM watering_tasks
ORDER BY task_date, id;