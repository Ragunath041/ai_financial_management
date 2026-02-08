# 💰 Smart Pocket AI - FinAI Planner

An AI-powered personal financial planning system that helps you manage your finances, analyze spending patterns, and optimize your budget using Google's Gemini AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

- **🔐 User Authentication** - Secure JWT-based authentication
- **📊 Dashboard** - Real-time financial overview with interactive charts
- **💡 AI-Powered Insights** - Budget analysis using Google Gemini AI
- **💰 Savings Prediction** - 12-month savings projection
- **📈 Expense Advisor** - Personalized tips to reduce expenses
- **🏥 Financial Health Score** - Comprehensive assessment of your financial well-being
- **📍 Location-Based Recommendations** - Rent suggestions based on your location

## 🛠️ Tech Stack

### Backend

- **Flask** - Python web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Google Gemini AI** - AI-powered insights
- **SQLAlchemy** - ORM

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/ui** - UI components
- **Recharts** - Data visualization
- **React Router** - Navigation
- **TanStack Query** - Data fetching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **MySQL Workbench** (optional, for database management)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-pocket-ai
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and update:

- `DB_PASSWORD` - Your MySQL password
- `GEMINI_API_KEY` - Your Google Gemini API key
- `SECRET_KEY` - A strong secret key for Flask
- `JWT_SECRET_KEY` - A strong secret key for JWT

#### Setup Database

1. Open MySQL Workbench or MySQL CLI
2. Create the database:

```sql
CREATE DATABASE smart_pocket_ai;
```

3. The tables will be created automatically when you run the app

#### Run Backend Server

```bash
python app.py
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default configuration should work if your backend is running on port 5000.

#### Run Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📖 Usage

### 1. Register an Account

- Navigate to `http://localhost:5173`
- Click "Get Started"
- Fill in your details and create an account

### 2. Add Financial Data

- After logging in, go to "Financial Input" from the sidebar
- Enter your monthly income and expenses
- Add job and location details
- Click "Analyze My Finances"

### 3. Explore Features

- **Dashboard** - View your financial overview
- **Budget Analysis** - See AI-powered insights about your spending
- **Expense Advisor** - Get tips to reduce expenses
- **Savings Prediction** - View your projected savings
- **Health Score** - Check your financial health

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes (authentication required)
- ✅ Input validation on frontend and backend
- ✅ CORS configuration
- ✅ Environment variables for sensitive data

## 🎨 UI/UX Features

- ✅ Modern, responsive design
- ✅ Dark mode support
- ✅ Interactive charts and visualizations
- ✅ Loading states
- ✅ Error handling with toast notifications
- ✅ Form validation
- ✅ Mobile-friendly interface

## 📁 Project Structure

```
smart-pocket-ai/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (not in git)
│   ├── .env.example          # Environment template
│   └── database_schema.sql    # Database schema
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable React components
    │   ├── pages/            # Page components
    │   ├── services/         # API service layer
    │   ├── hooks/            # Custom React hooks
    │   └── lib/              # Utility functions
    ├── .env                  # Environment variables (not in git)
    ├── .env.example         # Environment template
    └── package.json         # Node dependencies
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Financial Data

- `POST /api/financial-data` - Create/Update financial data (protected)
- `GET /api/financial-data` - Get user's financial data (protected)

### Analysis

- `GET /api/analysis/dashboard` - Dashboard overview (protected)
- `GET /api/analysis/insights` - Budget insights (protected)
- `GET /api/analysis/expense-tips` - Expense tips (protected)
- `GET /api/analysis/savings-projection` - Savings projection (protected)
- `GET /api/analysis/location-recommendations` - Location recommendations (protected)
- `GET /api/analysis/ai-insights` - AI-powered insights (protected)

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test
```

### Backend Tests

```bash
cd backend
python -m pytest
```

## 🚢 Production Deployment

### Important Security Steps

1. **Change Secret Keys**

   ```env
   SECRET_KEY=<generate-strong-random-key>
   JWT_SECRET_KEY=<generate-strong-random-key>
   ```

2. **Disable Debug Mode**

   ```env
   DEBUG=False
   ```

3. **Use Strong MySQL Password**

4. **Enable HTTPS**

5. **Set Proper CORS Origins**

6. **Use Environment-Specific Configuration**

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**

```
Error: Can't connect to MySQL server
```

**Solution:** Check MySQL is running and credentials in `.env` are correct

**Port Already in Use:**

```
Error: Address already in use
```

**Solution:** Change PORT in `.env` or kill the process using port 5000

### Frontend Issues

**API Connection Error:**

```
Failed to fetch
```

**Solution:** Ensure backend is running on port 5000 and `VITE_API_URL` is correct

**Authentication Issues:**

```
401 Unauthorized
```

**Solution:** Clear localStorage and login again

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Developed with ❤️ for smart financial planning

## 🙏 Acknowledgments

- Google Gemini AI for AI-powered insights
- Shadcn/ui for beautiful UI components
- Recharts for data visualization

---

**Happy Budgeting! 💰**
