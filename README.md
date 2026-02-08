# Ai Financial Management - Setup Guide

##Clone the repository

```bash
git clone https://github.com/Ragunath041/ai_financial_management.git
cd ai-financial-management
```

## Database Setup

1. Open MySQL Workbench or MySQL CLI
2. Create the database:

```sql
CREATE DATABASE ai_financial_management;
```

3. The tables will be created automatically when you run the backend

## Backend Setup

1. Navigate to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and update:

- `DB_PASSWORD` - Your MySQL password
- `GEMINI_API_KEY` - Your Google Gemini API key
- `SECRET_KEY` - A strong secret key for Flask
- `JWT_SECRET_KEY` - A strong secret key for JWT

4. Run backend:

```bash
python app.py
```

## Frontend Setup

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run frontend:

```bash
npm run dev
```
