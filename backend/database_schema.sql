-- Smart Pocket AI Database Schema
-- Run this in MySQL Workbench to create the database

-- Create database
CREATE DATABASE IF NOT EXISTS ai_financial_management;
USE ai_financial_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Financial data table
CREATE TABLE IF NOT EXISTS financial_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    rent DECIMAL(10, 2) DEFAULT 0,
    food DECIMAL(10, 2) DEFAULT 0,
    travel DECIMAL(10, 2) DEFAULT 0,
    others DECIMAL(10, 2) DEFAULT 0,
    savings_goal DECIMAL(10, 2) DEFAULT 0,
    goal_name VARCHAR(100),
    target_years INT DEFAULT 1,
    job_type VARCHAR(50),
    city VARCHAR(100),
    area VARCHAR(100),
    rent_budget DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Display success message
SELECT 'Database and tables created successfully!' AS Status;
