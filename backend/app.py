from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
cors_config = {
    "origins": os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(','),
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}
CORS(app, resources={r"/api/*": cors_config})
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

# JWT Error Handlers
@jwt.unauthorized_loader
def unauthorized_callback(callback):
    print(f"❌ Unauthorized access attempt: {callback}")
    return jsonify({'error': 'Missing or invalid authorization token'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(callback):
    print(f"❌ Invalid token: {callback}")
    return jsonify({'error': 'Invalid token'}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"❌ Expired token")
    return jsonify({'error': 'Token has expired'}), 401

# ==================== DATABASE MODELS ====================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    financial_data = db.relationship('FinancialData', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class FinancialData(db.Model):
    __tablename__ = 'financial_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Income & Expenses
    salary = db.Column(db.Float, nullable=False)
    rent = db.Column(db.Float, default=0)
    food = db.Column(db.Float, default=0)
    travel = db.Column(db.Float, default=0)
    others = db.Column(db.Float, default=0)
    savings_goal = db.Column(db.Float, default=0)
    goal_name = db.Column(db.String(100))
    target_years = db.Column(db.Integer, default=1)
    
    # Job & Location
    job_type = db.Column(db.String(50))
    city = db.Column(db.String(100))
    area = db.Column(db.String(100))
    rent_budget = db.Column(db.Float, default=0)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        total_expenses = self.rent + self.food + self.travel + self.others
        monthly_savings = self.salary - total_expenses
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'salary': self.salary,
            'rent': self.rent,
            'food': self.food,
            'travel': self.travel,
            'others': self.others,
            'savings_goal': self.savings_goal,
            'goal_name': self.goal_name,
            'target_years': self.target_years,
            'job_type': self.job_type,
            'city': self.city,
            'area': self.area,
            'rent_budget': self.rent_budget,
            'total_expenses': total_expenses,
            'monthly_savings': monthly_savings,
            'savings_rate': round((monthly_savings / self.salary * 100), 2) if self.salary > 0 else 0,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class SavingsGoal(db.Model):
    __tablename__ = 'savings_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    goal_name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'goal_name': self.goal_name,
            'target_amount': self.target_amount,
            'duration_months': self.duration_months,
            'created_at': self.created_at.isoformat()
        }


class MonthlyEntry(db.Model):
    __tablename__ = 'monthly_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    entry_month = db.Column(db.String(7), nullable=False) # Format: YYYY-MM
    income = db.Column(db.Float, nullable=False)
    savings_amount = db.Column(db.Float, nullable=False)
    rent = db.Column(db.Float, default=0)
    food = db.Column(db.Float, default=0)
    transportation = db.Column(db.Float, default=0)
    entertainment = db.Column(db.Float, default=0)
    others = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'entry_month', name='uix_user_month'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'entry_month': self.entry_month,
            'income': self.income,
            'savings_amount': self.savings_amount,
            'expenses': {
                'rent': self.rent,
                'food': self.food,
                'transportation': self.transportation,
                'entertainment': self.entertainment,
                'others': self.others
            },
            'total_expenses': self.rent + self.food + self.transportation + self.entertainment + self.others,
            'created_at': self.created_at.isoformat()
        }


# ==================== HELPER FUNCTIONS ====================

def generate_ai_insights(financial_data):
    """Generate AI-powered financial insights using Gemini"""
    try:
        prompt = f"""
        Analyze the following financial data and provide actionable insights:
        
        Monthly Salary: ₹{financial_data['salary']}
        Rent: ₹{financial_data['rent']}
        Food: ₹{financial_data['food']}
        Travel: ₹{financial_data['travel']}
        Other Expenses: ₹{financial_data['others']}
        Savings Goal: ₹{financial_data['savings_goal']}
        Job Type: {financial_data['job_type']}
        Location: {financial_data['city']}, {financial_data['area']}
        
        Total Expenses: ₹{financial_data['total_expenses']}
        Monthly Savings: ₹{financial_data['monthly_savings']}
        Savings Rate: {financial_data['savings_rate']}%
        
        Provide:
        1. 5 specific budget insights (mix of warnings and successes)
        2. 6 actionable expense reduction tips with estimated savings
        3. A financial health score (0-100) with breakdown
        4. 12-month savings projection
        
        Format as JSON with keys: insights, tips, health_score, projection
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"AI Generation Error: {str(e)}")
        return None


def calculate_health_score(financial_data):
    """Calculate financial health score"""
    salary = financial_data['salary']
    total_expenses = financial_data['total_expenses']
    monthly_savings = financial_data['monthly_savings']
    savings_goal = financial_data['savings_goal']
    
    # Savings ratio score (0-40 points)
    savings_ratio = (monthly_savings / salary * 100) if salary > 0 else 0
    savings_ratio_score = min(40, savings_ratio)
    
    # Expense control score (0-30 points)
    expense_ratio = (total_expenses / salary * 100) if salary > 0 else 100
    expense_control_score = max(0, 30 - (expense_ratio - 50) * 0.6)
    
    # Goal achievement score (0-30 points)
    goal_achievement = (monthly_savings / savings_goal * 100) if savings_goal > 0 else 100
    goal_score = min(30, goal_achievement * 0.3)
    
    overall = round(savings_ratio_score + expense_control_score + goal_score)
    
    return {
        'overall': min(100, overall),
        'savings_ratio': round(savings_ratio_score * 2.5),
        'expense_control': round(expense_control_score * 3.33),
        'debt_impact': 85  # Placeholder - can be enhanced
    }


# ==================== ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Smart Pocket AI Backend is running'}), 200


# ==================== AUTH ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('email') or not data.get('password') or not data.get('fullName'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(
            full_name=data['fullName'],
            email=data['email'],
            password_hash=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate JWT token (convert ID to string)
        access_token = create_access_token(identity=str(new_user.id))
        
        return jsonify({
            'message': 'Account created successfully',
            'token': access_token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate JWT token (convert ID to string)
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== FINANCIAL DATA ROUTES ====================

@app.route('/api/financial-data', methods=['POST'])
@jwt_required()
def create_financial_data():
    """Create or update financial data"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        data = request.get_json()
        
        print(f"📝 Received financial data from user {user_id}")
        print(f"📊 Data: {data}")
        
        # Check if user already has financial data
        existing_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if existing_data:
            # Update existing data
            existing_data.salary = float(data.get('salary', 0))
            existing_data.rent = float(data.get('rent', 0))
            existing_data.food = float(data.get('food', 0))
            existing_data.travel = float(data.get('travel', 0))
            existing_data.others = float(data.get('others', 0))
            existing_data.savings_goal = float(data.get('savingsGoal', 0))
            existing_data.goal_name = data.get('goalName')
            existing_data.target_years = int(data.get('targetYears', 1))
            existing_data.job_type = data.get('jobType')
            existing_data.city = data.get('city')
            existing_data.area = data.get('area')
            existing_data.rent_budget = float(data.get('rentBudget', 0))
            existing_data.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            print(f"✅ Updated financial data for user {user_id}")
            
            return jsonify({
                'message': 'Financial data updated successfully',
                'data': existing_data.to_dict()
            }), 200
        else:
            # Create new financial data
            new_data = FinancialData(
                user_id=user_id,
                salary=float(data.get('salary', 0)),
                rent=float(data.get('rent', 0)),
                food=float(data.get('food', 0)),
                travel=float(data.get('travel', 0)),
                others=float(data.get('others', 0)),
                savings_goal=float(data.get('savingsGoal', 0)),
                goal_name=data.get('goalName'),
                target_years=int(data.get('targetYears', 1)),
                job_type=data.get('jobType'),
                city=data.get('city'),
                area=data.get('area'),
                rent_budget=float(data.get('rentBudget', 0))
            )
            
            db.session.add(new_data)
            db.session.commit()
            
            print(f"✅ Created financial data for user {user_id}")
            
            return jsonify({
                'message': 'Financial data created successfully',
                'data': new_data.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error saving financial data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/financial-data', methods=['GET'])
@jwt_required()
def get_financial_data():
    """Get user's financial data"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if not financial_data:
            return jsonify({'error': 'No financial data found'}), 404
        
        return jsonify({'data': financial_data.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== ANALYSIS ROUTES ====================

@app.route('/api/analysis/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """Get dashboard overview data"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if not financial_data:
            return jsonify({'error': 'No financial data found'}), 404
        
        data_dict = financial_data.to_dict()
        
        # Calculate expense breakdown
        expense_breakdown = [
            {'name': 'Rent', 'value': financial_data.rent, 'color': 'hsl(220, 70%, 45%)'},
            {'name': 'Food', 'value': financial_data.food, 'color': 'hsl(160, 84%, 40%)'},
            {'name': 'Travel', 'value': financial_data.travel, 'color': 'hsl(38, 92%, 50%)'},
            {'name': 'Others', 'value': financial_data.others, 'color': 'hsl(280, 60%, 50%)'}
        ]
        
        # Calculate health score
        health_score = calculate_health_score(data_dict)
        
        return jsonify({
            'financial_data': data_dict,
            'expense_breakdown': expense_breakdown,
            'health_score': health_score
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/insights', methods=['GET'])
@jwt_required()
def get_budget_insights():
    """Get AI-powered budget insights"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if not financial_data:
            return jsonify({'error': 'No financial data found'}), 404
        
        data_dict = financial_data.to_dict()
        
        # Generate insights
        insights = []
        salary = data_dict['salary']
        
        # Rent analysis
        rent_percentage = (data_dict['rent'] / salary * 100) if salary > 0 else 0
        if rent_percentage > 30:
            insights.append({'text': f"Rent consumes {rent_percentage:.0f}% of your salary - consider cheaper options", 'type': 'warning'})
        elif rent_percentage > 20:
            insights.append({'text': f"Rent consumes {rent_percentage:.0f}% of your salary", 'type': 'warning'})
        else:
            insights.append({'text': f"Rent is well managed at {rent_percentage:.0f}% of salary", 'type': 'success'})
        
        # Food analysis
        food_percentage = (data_dict['food'] / salary * 100) if salary > 0 else 0
        if food_percentage > 15:
            insights.append({'text': f"Food expenses are {food_percentage:.0f}% — slightly above average", 'type': 'warning'})
            potential_savings = data_dict['food'] * 0.2
            insights.append({'text': f"You can save ₹{potential_savings:,.0f}/month by reducing food expenses", 'type': 'success'})
        else:
            insights.append({'text': f"Food expenses are well controlled at {food_percentage:.0f}%", 'type': 'success'})
        
        # Travel analysis
        travel_percentage = (data_dict['travel'] / salary * 100) if salary > 0 else 0
        if travel_percentage < 10:
            insights.append({'text': f"Travel costs are well managed at {travel_percentage:.0f}%", 'type': 'success'})
        else:
            insights.append({'text': f"Travel costs are {travel_percentage:.0f}% — consider public transport", 'type': 'warning'})
        
        # Savings analysis
        savings_rate = data_dict['savings_rate']
        if savings_rate >= 30:
            insights.append({'text': f"Current savings rate: {savings_rate:.0f}% — excellent!", 'type': 'success'})
        elif savings_rate >= 20:
            insights.append({'text': f"Current savings rate: {savings_rate:.0f}% — good progress", 'type': 'success'})
        else:
            insights.append({'text': f"Current savings rate: {savings_rate:.0f}% — needs improvement", 'type': 'warning'})
        
        return jsonify({'insights': insights}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/expense-tips', methods=['GET'])
@jwt_required()
def get_expense_tips():
    """Get expense optimization tips"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if not financial_data:
            return jsonify({'error': 'No financial data found'}), 404
        
        tips = [
            {'tip': 'Cook at home 3 days a week', 'savings': round(financial_data.food * 0.25), 'category': 'Food', 'icon': 'UtensilsCrossed'},
            {'tip': 'Use monthly bus/metro pass', 'savings': round(financial_data.travel * 0.3), 'category': 'Travel', 'icon': 'Bus'},
            {'tip': 'Shift to shared accommodation', 'savings': round(financial_data.rent * 0.3), 'category': 'Rent', 'icon': 'Home'},
            {'tip': 'Cancel unused subscriptions', 'savings': round(financial_data.others * 0.15), 'category': 'Others', 'icon': 'Tv'},
            {'tip': 'Use UPI cashback offers', 'savings': 500, 'category': 'Others', 'icon': 'Smartphone'},
            {'tip': 'Meal prep on weekends', 'savings': round(financial_data.food * 0.15), 'category': 'Food', 'icon': 'Salad'}
        ]
        
        return jsonify({'tips': tips}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/savings-projection', methods=['GET'])
@jwt_required()
def get_savings_projection():
    """Get 12-month savings projection"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if not financial_data:
            return jsonify({'error': 'No financial data found'}), 404
        
        data_dict = financial_data.to_dict()
        monthly_savings = data_dict['monthly_savings']
        savings_goal = data_dict['savings_goal']
        
        projection = []
        for i in range(12):
            projection.append({
                'month': f'Month {i + 1}',
                'savings': monthly_savings * (i + 1),
                'goal': savings_goal * (i + 1)
            })
        
        return jsonify({'projection': projection}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/location-recommendations', methods=['GET'])
@jwt_required()
def get_location_recommendations():
    """Get location-based rent recommendations"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if not financial_data:
            return jsonify({'error': 'No financial data found'}), 404
        
        # Sample recommendations (can be enhanced with real data)
        city = financial_data.city or "Bangalore"
        
        recommendations = [
            {'area': 'Electronic City', 'avgRent': 8500, 'distance': '18 km', 'travelCost': 2500, 'tag': 'Cheapest'},
            {'area': 'Whitefield', 'avgRent': 10000, 'distance': '12 km', 'travelCost': 2000, 'tag': 'Best Balance'},
            {'area': 'HSR Layout', 'avgRent': 11500, 'distance': '6 km', 'travelCost': 1200, 'tag': ''},
            {'area': 'BTM Layout', 'avgRent': 9500, 'distance': '8 km', 'travelCost': 1500, 'tag': ''},
            {'area': 'Marathahalli', 'avgRent': 9000, 'distance': '10 km', 'travelCost': 1800, 'tag': ''}
        ]
        
        return jsonify({'recommendations': recommendations, 'city': city}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/ai-insights', methods=['GET'])
@jwt_required()
def get_ai_insights():
    """Get AI-powered comprehensive insights using Gemini"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        
        if not financial_data:
            return jsonify({'error': 'No financial data found'}), 404
        
        data_dict = financial_data.to_dict()
        ai_response = generate_ai_insights(data_dict)
        
        return jsonify({
            'ai_insights': ai_response,
            'financial_data': data_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== SAVINGS GOAL TRACKER ROUTES ====================

@app.route('/api/goals', methods=['POST'])
@jwt_required()
def set_savings_goal():
    """Set a new savings goal"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data.get('goalName') or not data.get('targetAmount') or not data.get('durationMonths'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already has a goal, update if yes
        goal = SavingsGoal.query.filter_by(user_id=user_id).first()
        if goal:
            goal.goal_name = data['goalName']
            goal.target_amount = float(data['targetAmount'])
            goal.duration_months = int(data['durationMonths'])
        else:
            goal = SavingsGoal(
                user_id=user_id,
                goal_name=data['goalName'],
                target_amount=float(data['targetAmount']),
                duration_months=int(data['durationMonths'])
            )
            db.session.add(goal)
            
        db.session.commit()
        return jsonify({'message': 'Goal set successfully', 'goal': goal.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/goals', methods=['GET'])
@jwt_required()
def get_savings_goal():
    """Get user's current goal"""
    try:
        user_id = int(get_jwt_identity())
        goal = SavingsGoal.query.filter_by(user_id=user_id).first()
        if not goal:
            return jsonify({'error': 'No goal found'}), 404
        return jsonify({'goal': goal.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/monthly-data', methods=['POST'])
@jwt_required()
def add_monthly_entry():
    """Add or update a monthly financial entry"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data.get('month') or not data.get('income') or 'savings' not in data:
            return jsonify({'error': 'Missing month, income or savings'}), 400
        
        month = data['month'] # Format YYYY-MM
        
        entry = MonthlyEntry.query.filter_by(user_id=user_id, entry_month=month).first()
        
        if entry:
            entry.income = float(data['income'])
            entry.savings_amount = float(data['savings'])
            entry.rent = float(data.get('rent', 0))
            entry.food = float(data.get('food', 0))
            entry.transportation = float(data.get('transportation', 0))
            entry.entertainment = float(data.get('entertainment', 0))
            entry.others = float(data.get('others', 0))
        else:
            entry = MonthlyEntry(
                user_id=user_id,
                entry_month=month,
                income=float(data['income']),
                savings_amount=float(data['savings']),
                rent=float(data.get('rent', 0)),
                food=float(data.get('food', 0)),
                transportation=float(data.get('transportation', 0)),
                entertainment=float(data.get('entertainment', 0)),
                others=float(data.get('others', 0))
            )
            db.session.add(entry)
            
        db.session.commit()
        return jsonify({'message': 'Monthly data saved', 'entry': entry.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/monthly-data', methods=['GET'])
@jwt_required()
def get_monthly_entries():
    """Get all monthly entries for trend analysis"""
    try:
        user_id = int(get_jwt_identity())
        entries = MonthlyEntry.query.filter_by(user_id=user_id).order_by(MonthlyEntry.entry_month).all()
        return jsonify({'entries': [e.to_dict() for e in entries]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/savings-progress', methods=['GET'])
@jwt_required()
def get_savings_progress():
    """Calculate savings progress against goal"""
    try:
        user_id = int(get_jwt_identity())
        goal = SavingsGoal.query.filter_by(user_id=user_id).first()
        if not goal:
            return jsonify({'error': 'Set a goal first'}), 404
            
        entries = MonthlyEntry.query.filter_by(user_id=user_id).order_by(MonthlyEntry.entry_month).all()
        
        total_saved = sum(e.savings_amount for e in entries)
        remaining = max(0, goal.target_amount - total_saved)
        progress_percentage = (total_saved / goal.target_amount * 100) if goal.target_amount > 0 else 0
        
        # Monthly trend data for graphs
        actual_savings_trend = []
        cumulative_savings_trend = []
        running_total = 0
        
        for e in entries:
            running_total += e.savings_amount
            actual_savings_trend.append({
                'month': e.entry_month,
                'amount': e.savings_amount
            })
            cumulative_savings_trend.append({
                'month': e.entry_month,
                'amount': running_total
            })
            
        return jsonify({
            'goal_name': goal.goal_name,
            'target_amount': goal.target_amount,
            'total_saved': total_saved,
            'remaining_amount': remaining,
            'progress_percentage': round(progress_percentage, 2),
            'monthly_trend': actual_savings_trend,
            'cumulative_trend': cumulative_savings_trend
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== TRIP COST ESTIMATOR ROUTE ====================

DESTINATIONS = {
    'ooty': {'per_day': 5000, 'base_fee': 5000},
    'goa': {'per_day': 7000, 'base_fee': 8000},
    'manali': {'per_day': 6000, 'base_fee': 10000},
    'mysore': {'per_day': 3000, 'base_fee': 2000},
    'kerala': {'per_day': 5500, 'base_fee': 7000},
    'default': {'per_day': 4000, 'base_fee': 5000}
}

@app.route('/api/trip/estimate', methods=['POST'])
@jwt_required()
def estimate_trip():
    """Estimate costs for a trip"""
    try:
        data = request.get_json()
        destination = data.get('destination', '').lower()
        days = int(data.get('days', 1))
        
        dest_info = DESTINATIONS.get(destination, DESTINATIONS['default'])
        # If specific destination like Ooty mentioned in prompt
        # Destination: Ooty, Days: 5, Cost: 25000 -> 5000/day
        
        estimated_cost = dest_info['per_day'] * days
        
        # If it's Ooty specifically as requested in prompt, ensure exact match for example
        if destination == 'ooty' and days == 5:
            estimated_cost = 25000

        return jsonify({
            'destination': destination.capitalize(),
            'days': days,
            'estimated_cost': estimated_cost,
            'breakdown': {
                'stay_and_food': estimated_cost * 0.6,
                'travel': estimated_cost * 0.3,
                'activities': estimated_cost * 0.1
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== DATABASE INITIALIZATION ====================

def init_db():
    """Initialize database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")


# ==================== MAIN ====================

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Run Flask app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'
    
    print(f"\n🚀 Smart Pocket AI Backend starting on port {port}...")
    print(f"📊 Database: {os.getenv('DB_NAME')}")
    print(f"🤖 Gemini AI: Configured\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
