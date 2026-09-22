CREATE DATABASE IF NOT EXISTS aniya_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aniya_db;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS harvests;
DROP TABLE IF EXISTS watering_tasks;
DROP TABLE IF EXISTS plantings;
DROP TABLE IF EXISTS seeds;
DROP TABLE IF EXISTS plots;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE plots (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    crop_type ENUM('Onion','Rice') NOT NULL,
    status ENUM('Available','Occupied','Maintenance') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE plantings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plot_id INT UNSIGNED NOT NULL,
    crop_name VARCHAR(150) NOT NULL,
    variety VARCHAR(150) DEFAULT NULL,
    planted_date DATE NOT NULL,
    expected_harvest_date DATE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_planting_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE watering_tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plot_id INT UNSIGNED NOT NULL,
    task_date DATE NOT NULL,
    done TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_watering_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE harvests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plot_id INT UNSIGNED NOT NULL,
    harvest_date DATE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_harvest_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE seeds (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seed_name VARCHAR(150) NOT NULL,
    crop_type ENUM('Onion','Rice') NOT NULL,
    quantity_g DECIMAL(10,2) NOT NULL DEFAULT 0,
    threshold_g DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO plots (name,crop_type,status) VALUES
('Plot A1','Onion','Occupied'),
('Plot A2','Rice','Occupied'),
('Plot B1','Onion','Available');

INSERT INTO plantings (plot_id,crop_name,variety,planted_date,expected_harvest_date,notes) VALUES
(1,'Red Creole Onion','Red Creole','2026-07-20','2026-09-10','Bulbs developing well.'),
(2,'IR64 Rice','IR64','2026-06-01','2026-10-05','Main rice crop.');

INSERT INTO watering_tasks (plot_id,task_date,done) VALUES
(1,'2026-09-20',0),
(2,'2026-09-20',0),
(1,'2026-09-22',0),
(2,'2026-09-22',0);

INSERT INTO harvests (plot_id,harvest_date,quantity,notes) VALUES
(2,'2026-09-14',45.00,'First rice harvest of the season'),
(1,'2026-09-10',12.50,'Onion bulbs, good size');

INSERT INTO seeds (seed_name,crop_type,quantity_g,threshold_g) VALUES
('Red Creole Onion Seeds','Onion',350,100),
('Yellow Granex Onion Seeds','Onion',80,100),
('IR64 Rice Seeds','Rice',500,150),
('NSIC Rc222 Rice Seeds','Rice',120,150);
