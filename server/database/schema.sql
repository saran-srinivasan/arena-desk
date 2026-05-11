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
  max_capacity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Customers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  customer_type ENUM('Member','Student','Walk-in') DEFAULT 'Walk-in',
  preferred_sport ENUM('Cricket','Pickleball','Volleyball','Swimming','Basketball') NOT NULL,
  photo_url TEXT DEFAULT NULL,
  total_bookings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Membership Plans (templates) ──────────────────────────────
CREATE TABLE IF NOT EXISTS membership_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  duration_months INT NOT NULL,
  price INT NOT NULL,
  sports_access JSON NOT NULL,
  description TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Customer Memberships (instances) ──────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('Active','Expired','Cancelled','Frozen') DEFAULT 'Active',
  payment_status ENUM('Paid','Pending','Overdue') DEFAULT 'Pending',
  auto_renew BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE RESTRICT,
  INDEX idx_membership_customer (customer_id),
  INDEX idx_membership_status (status)
) ENGINE=InnoDB;

-- ── Coaches ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaches (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  sport_specializations JSON NOT NULL,
  photo_url TEXT DEFAULT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Coaching Batches ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaching_batches (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sport ENUM('Cricket','Pickleball','Volleyball','Swimming','Basketball') NOT NULL,
  coach_id VARCHAR(50) NOT NULL,
  resource_id VARCHAR(50) NOT NULL,
  schedule_days JSON NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_students INT NOT NULL DEFAULT 15,
  level ENUM('Beginner','Intermediate','Advanced','All') DEFAULT 'All',
  fee INT NOT NULL,
  status ENUM('Active','Upcoming','Completed','Cancelled') DEFAULT 'Upcoming',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE RESTRICT,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
  INDEX idx_batch_coach (coach_id),
  INDEX idx_batch_sport (sport)
) ENGINE=InnoDB;

-- ── Student Enrollments ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_enrollments (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  batch_id VARCHAR(50) NOT NULL,
  enrollment_date DATE NOT NULL,
  payment_status ENUM('Paid','Pending','Overdue') DEFAULT 'Pending',
  status ENUM('Active','Dropped','Completed') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (batch_id) REFERENCES coaching_batches(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_enrollment (student_id, batch_id)
) ENGINE=InnoDB;

-- ── Attendance ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(50) PRIMARY KEY,
  enrollment_id VARCHAR(50) NOT NULL,
  batch_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present','Absent','Late','Excused') DEFAULT 'Present',
  marked_by VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES coaching_batches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (enrollment_id, date)
) ENGINE=InnoDB;

-- ── Payments (transaction ledger) ─────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  type ENUM('Membership','Enrollment','Booking') NOT NULL,
  reference_id VARCHAR(50) NOT NULL,
  amount INT NOT NULL,
  method ENUM('Cash','Card','UPI','Bank Transfer','Other') NOT NULL,
  status ENUM('Completed','Pending','Refunded','Failed') DEFAULT 'Pending',
  notes TEXT DEFAULT NULL,
  paid_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  INDEX idx_payment_customer (customer_id),
  INDEX idx_payment_type_ref (type, reference_id)
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
  price INT DEFAULT 0,
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

-- ── Pricing Rules ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_rules (
  id VARCHAR(50) PRIMARY KEY,
  sport ENUM('Cricket','Pickleball','Volleyball','Swimming','Basketball') NOT NULL,
  hourly_rate INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_sport_price (sport)
) ENGINE=InnoDB;

-- ── Staff ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role ENUM('Super Admin','Admin') NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) DEFAULT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
