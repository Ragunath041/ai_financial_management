# Smart Pocket AI - Backend

Flask backend for the FinAI Planner application with MySQL database and Gemini AI integration.

## Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Financial Data Management
- ✅ AI-Powered Budget Insights (Gemini AI)
- ✅ Expense Breakdown & Analysis
- ✅ Savings Projections
- ✅ Location-based Recommendations
- ✅ Financial Health Score Calculation

## Setup Instructions

### 1. Install MySQL

Make sure MySQL is installed and running on your system.

### 2. Create Database

Open MySQL Workbench and run the `database_schema.sql` file to create the database and tables.

Or run manually:

```sql
CREATE DATABASE smart_pocket_ai;
```

### 3. Configure Environment Variables

Update the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=smart_pocket_ai
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the Application

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)

### Financial Data

- `POST /api/financial-data` - Create/Update financial data (requires JWT)
- `GET /api/financial-data` - Get user's financial data (requires JWT)

### Analysis

- `GET /api/analysis/dashboard` - Get dashboard overview
- `GET /api/analysis/insights` - Get budget insights
- `GET /api/analysis/expense-tips` - Get expense optimization tips
- `GET /api/analysis/savings-projection` - Get 12-month savings projection
- `GET /api/analysis/location-recommendations` - Get location-based rent recommendations
- `GET /api/analysis/ai-insights` - Get AI-powered comprehensive insights

### Health Check

- `GET /api/health` - Check if server is running

## Database Schema

### Users Table

- `id` - Primary key
- `full_name` - User's full name
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `created_at` - Account creation timestamp

### Financial Data Table

- `id` - Primary key
- `user_id` - Foreign key to users table
- `salary` - Monthly salary
- `rent` - Rent expense
- `food` - Food expense
- `travel` - Travel expense
- `others` - Other expenses
- `savings_goal` - Monthly savings goal
- `job_type` - Type of job (IT, Govt, Private, Freelance)
- `city` - City name
- `area` - Area/locality name
- `rent_budget` - Rent budget
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

## Technologies Used

- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Gemini AI** - AI-powered insights
- **Flask-CORS** - Cross-origin resource sharing

## Development

The backend automatically creates database tables on first run. Make sure your MySQL server is running and credentials in `.env` are correct.

## Security Notes

⚠️ **Important**: Change the `SECRET_KEY` and `JWT_SECRET_KEY` in `.env` before deploying to production!

## License

MIT
