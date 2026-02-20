-- Seed data for Smart Pocket AI
-- This file contains initial data for testing and development

USE ai_financial_management;

-- Clear existing data (optional, but good for a clean seed)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE financial_data;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed Users
-- Passwords are hashed versions of 'password123'
INSERT INTO users (id, full_name, email, password_hash, created_at) VALUES
(1, 'John Doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LqZGueS6z.mC7q.Y7.Q.X.X.X.X.X.X.X.X.X', '2024-01-01 10:00:00'),
(2, 'Jane Smith', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LqZGueS6z.mC7q.Y7.Q.X.X.X.X.X.X.X.X.X', '2024-01-02 11:30:00'),
(3, 'Mike Ross', 'mike@example.com', '$2b$12$LQv3c1yqBWVHxkd0LqZGueS6z.mC7q.Y7.Q.X.X.X.X.X.X.X.X.X', '2024-01-03 09:15:00');

-- Seed Financial Data
INSERT INTO financial_data (user_id, salary, rent, food, travel, others, savings_goal, goal_name, target_years, job_type, city, area, rent_budget, created_at, updated_at) VALUES
(1, 50000.00, 15000.00, 8000.00, 3000.00, 5000.00, 500000.00, 'Buy a Car', 3, 'Software Engineer', 'Bangalore', 'HSR Layout', 18000.00, '2024-01-01 10:05:00', '2024-01-01 10:05:00'),
(2, 75000.00, 20000.00, 10000.00, 5000.00, 10000.00, 1000000.00, 'House Downpayment', 5, 'Data Scientist', 'Mumbai', 'Andheri', 25000.00, '2024-01-02 11:40:00', '2024-01-02 11:40:00'),
(3, 40000.00, 10000.00, 7000.00, 4000.00, 3000.00, 200000.00, 'Emergency Fund', 1, 'Marketing Executive', 'Delhi', 'Saket', 12000.00, '2024-01-03 09:20:00', '2024-01-03 09:20:00');
