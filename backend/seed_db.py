from app import app, db, User, FinancialData, bcrypt
from datetime import datetime

def seed_database():
    with app.app_context():
        print("⏳ Seeding database...")
        
        # Clear existing data
        try:
            db.session.query(FinancialData).delete()
            db.session.query(User).delete()
            db.session.commit()
            print("✨ Cleared existing data.")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error clearing data: {e}")
            return

        # Create sample users
        password_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
        
        users = [
            User(
                full_name='John Doe',
                email='john@example.com',
                password_hash=password_hash
            ),
            User(
                full_name='Jane Smith',
                email='jane@example.com',
                password_hash=password_hash
            ),
            User(
                full_name='Mike Ross',
                email='mike@example.com',
                password_hash=password_hash
            )
        ]

        for user in users:
            db.session.add(user)
        
        db.session.commit()
        print("👤 Seeded users.")

        # Re-fetch users to get their IDs
        user_john = User.query.filter_by(email='john@example.com').first()
        user_jane = User.query.filter_by(email='jane@example.com').first()
        user_mike = User.query.filter_by(email='mike@example.com').first()

        # Create sample financial data
        financial_records = [
            FinancialData(
                user_id=user_john.id,
                salary=50000.0,
                rent=15000.0,
                food=8000.0,
                travel=3000.0,
                others=5000.0,
                savings_goal=500000.0,
                goal_name='Buy a Car',
                target_years=3,
                job_type='Software Engineer',
                city='Bangalore',
                area='HSR Layout',
                rent_budget=18000.0
            ),
            FinancialData(
                user_id=user_jane.id,
                salary=75000.0,
                rent=20000.0,
                food=10000.0,
                travel=5000.0,
                others=10000.0,
                savings_goal=1000000.0,
                goal_name='House Downpayment',
                target_years=5,
                job_type='Data Scientist',
                city='Mumbai',
                area='Andheri',
                rent_budget=25000.0
            ),
            FinancialData(
                user_id=user_mike.id,
                salary=40000.0,
                rent=10000.0,
                food=7000.0,
                travel=4000.0,
                others=3000.0,
                savings_goal=200000.0,
                goal_name='Emergency Fund',
                target_years=1,
                job_type='Marketing Executive',
                city='Delhi',
                area='Saket',
                rent_budget=12000.0
            )
        ]

        for freq in financial_records:
            db.session.add(freq)
        
        db.session.commit()
        print("💰 Seeded financial data.")
        print("✅ Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
