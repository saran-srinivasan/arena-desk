-- ArenaDesk Database Schema
-- Run with: mysql -u root < server/database/schema.sql

CREATE DATABASE IF NOT EXISTS arena_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arena_desk;

-- ── Resources (courts, turfs, pools) ──────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('Court', 'Turf', 'Pool') NOT NULL,
  sub_type VARCHAR(100) DEFAULT NULL,
  shared_group VARCHAR(100) DEFAULT NULL,
  supported_sports JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Customers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  preferred_sport ENUM('Cricket','Pickleball','Volleyball','Swimming','Basketball') NOT NULL,
  photo_url TEXT DEFAULT NULL,
  total_bookings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Bookings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(20) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  sport ENUM('Cricket','Pickleball','Volleyball','Swimming','Basketball') NOT NULL,
  resource_id VARCHAR(50) NOT NULL,
  resource_name VARCHAR(100) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('Confirmed','CheckedIn','Active','Completed','Cancelled') DEFAULT 'Confirmed',
  notes TEXT DEFAULT NULL,
  created_by VARCHAR(150) NOT NULL,
  price_cents INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_start_time (start_time),
  INDEX idx_bookings_resource_date (resource_id, start_time),
  INDEX idx_bookings_customer (customer_id)
) ENGINE=InnoDB;

-- ── Active Sessions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS active_sessions (
  booking_id VARCHAR(20) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  sport ENUM('Cricket','Pickleball','Volleyball','Swimming','Basketball') NOT NULL,
  resource_id VARCHAR(50) NOT NULL,
  resource_name VARCHAR(100) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ── Booking ID Sequence Tracker ───────────────────────────────
CREATE TABLE IF NOT EXISTS booking_sequence (
  prefix VARCHAR(10) PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Initialize sequences (only if empty)
INSERT IGNORE INTO booking_sequence (prefix, last_number) VALUES ('BK', 8825);
INSERT IGNORE INTO booking_sequence (prefix, last_number) VALUES ('AD', 10258);
