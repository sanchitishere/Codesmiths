# app.py
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = '24722a7d2a59268ef9f5fa1afcb25aa19dab3be85d6f08111d197598c34c8a4e'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medalert.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    personal = db.relationship('Personal', backref='user', uselist=False, cascade="all, delete-orphan")
    medical = db.relationship('Medical', backref='user', uselist=False, cascade="all, delete-orphan")
    emergency_contacts = db.relationship('EmergencyContact', backref='user', cascade="all, delete-orphan")
    prescriptions = db.relationship('Prescription', backref='user', cascade="all, delete-orphan")

class Personal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    address = db.Column(db.Text)

class Medical(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    blood_type = db.Column(db.String(10))
    allergies = db.Column(db.Text)
    chronic_conditions = db.Column(db.Text)
    high_risk_to = db.Column(db.Text)

class EmergencyContact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String(100))
    relationship = db.Column(db.String(100))
    phone = db.Column(db.String(20))

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    medication = db.Column(db.String(100))
    dosage = db.Column(db.String(100))

# Create database tables
with app.app_context():
    db.create_all()
    
    # Check if demo user exists
    demo_user = User.query.filter_by(username='user').first()
    if not demo_user:
        # Create demo user
        demo_user = User(username='user', password=generate_password_hash('password'))
        db.session.add(demo_user)
        
        # Create personal info
        personal = Personal(
            user=demo_user,
            name='John Doe',
            age=35,
            gender='Male',
            address='123 Medical St, Healthcare City, HC 12345'
        )
        db.session.add(personal)
        
        # Create medical info
        medical = Medical(
            user=demo_user,
            blood_type='O+',
            allergies='Penicillin, Peanuts',
            chronic_conditions='Asthma, Hypertension',
            high_risk_to='Respiratory infections'
        )
        db.session.add(medical)
        
        # Add emergency contacts
        contacts = [
            EmergencyContact(
                user=demo_user,
                name='Jane Doe',
                relationship='Spouse',
                phone='(555) 123-4567'
            ),
            EmergencyContact(
                user=demo_user,
                name='Dr. Smith',
                relationship='Primary Physician',
                phone='(555) 987-6543'
            )
        ]
        for contact in contacts:
            db.session.add(contact)
        
        # Add prescriptions
        prescriptions = [
            Prescription(
                user=demo_user,
                medication='Albuterol Inhaler',
                dosage='2 puffs as needed'
            ),
            Prescription(
                user=demo_user,
                medication='Lisinopril',
                dosage='10mg once daily'
            )
        ]
        for prescription in prescriptions:
            db.session.add(prescription)
        
        # Save to database
        db.session.commit()

# Serve the main HTML file directly
@app.route('/')
def index():
    return render_template('index.html')

# API Routes for AJAX calls
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        # Store user ID in session
        session['user_id'] = user.id
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already taken'})
    
    # Create new user
    user = User(username=username, password=generate_password_hash(password))
    
    # Create personal info
    personal = Personal(
        user=user,
        name=data.get('personal', {}).get('name', ''),
        age=data.get('personal', {}).get('age', 0),
        gender=data.get('personal', {}).get('gender', ''),
        address=data.get('personal', {}).get('address', '')
    )
    
    # Create medical info
    medical = Medical(
        user=user,
        blood_type=data.get('medical', {}).get('bloodType', ''),
        allergies=data.get('medical', {}).get('allergies', ''),
        chronic_conditions=data.get('medical', {}).get('chronicConditions', ''),
        high_risk_to=data.get('medical', {}).get('highRiskTo', '')
    )
    
    db.session.add(user)
    db.session.add(personal)
    db.session.add(medical)
    
    # Add emergency contacts if provided
    if 'emergencyContacts' in data:
        for contact_data in data['emergencyContacts']:
            contact = EmergencyContact(
                user=user,
                name=contact_data.get('name', ''),
                relationship=contact_data.get('relationship', ''),
                phone=contact_data.get('phone', '')
            )
            db.session.add(contact)
    
    # Add prescriptions if provided
    if 'prescriptions' in data:
        for prescription_data in data['prescriptions']:
            prescription = Prescription(
                user=user,
                medication=prescription_data.get('medication', ''),
                dosage=prescription_data.get('dosage', '')
            )
            db.session.add(prescription)
    
    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True})

@app.route('/api/user_data', methods=['GET'])
def get_user_data():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'})
    
    # Build user data object
    user_data = {
        'username': user.username,
        'personal': {
            'name': user.personal.name if user.personal else '',
            'age': user.personal.age if user.personal else '',
            'gender': user.personal.gender if user.personal else '',
            'address': user.personal.address if user.personal else ''
        },
        'medical': {
            'bloodType': user.medical.blood_type if user.medical else '',
            'allergies': user.medical.allergies if user.medical else '',
            'chronicConditions': user.medical.chronic_conditions if user.medical else '',
            'highRiskTo': user.medical.high_risk_to if user.medical else ''
        },
        'emergencyContacts': [
            {
                'name': contact.name,
                'relationship': contact.relationship,
                'phone': contact.phone
            } for contact in user.emergency_contacts
        ],
        'prescriptions': [
            {
                'medication': prescription.medication,
                'dosage': prescription.dosage
            } for prescription in user.prescriptions
        ]
    }
    
    return jsonify({'success': True, 'user': user_data})

@app.route('/api/check_session', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    if user_id:
        return jsonify({'logged_in': True})
    else:
        return jsonify({'logged_in': False})

if __name__ == '__main__':
    app.run(debug=True)

    # Add these routes to app.py

@app.route('/api/update_medical', methods=['POST'])
def update_medical():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.get_json()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'})
    
    # Update medical info
    if not user.medical:
        user.medical = Medical(user=user)
    
    user.medical.blood_type = data.get('bloodType', '')
    user.medical.allergies = data.get('allergies', '')
    user.medical.chronic_conditions = data.get('chronicConditions', '')
    user.medical.high_risk_to = data.get('highRiskTo', '')
    
    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/add_contact', methods=['POST'])
def add_contact():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.get_json()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'})
    
    # Add new contact
    contact = EmergencyContact(
        user=user,
        name=data.get('name', ''),
        relationship=data.get('relationship', ''),
        phone=data.get('phone', '')
    )
    
    try:
        db.session.add(contact)
        db.session.commit()
        return jsonify({'success': True, 'contactId': contact.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/delete_contact/<int:contact_id>', methods=['POST'])
def delete_contact(contact_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    contact = EmergencyContact.query.get(contact_id)
    if not contact or contact.user_id != user_id:
        return jsonify({'success': False, 'message': 'Contact not found or unauthorized'})
    
    try:
        db.session.delete(contact)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/add_prescription', methods=['POST'])
def add_prescription():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.get_json()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'})
    
    # Add new prescription
    prescription = Prescription(
        user=user,
        medication=data.get('medication', ''),
        dosage=data.get('dosage', '')
    )
    
    try:
        db.session.add(prescription)
        db.session.commit()
        return jsonify({'success': True, 'prescriptionId': prescription.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/delete_prescription/<int:prescription_id>', methods=['POST'])
def delete_prescription(prescription_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    prescription = Prescription.query.get(prescription_id)
    if not prescription or prescription.user_id != user_id:
        return jsonify({'success': False, 'message': 'Prescription not found or unauthorized'})
    
    try:
        db.session.delete(prescription)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

