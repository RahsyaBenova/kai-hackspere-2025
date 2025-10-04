from flask_sqlalchemy import SQLAlchemy 
from flask_login import UserMixin 
from datetime import datetime
import uuid 
from app import db 

def generate_uuid(): 
    return str(uuid.uuid4())

class User(db.Model, UserMixin): 
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    nik = db.Column(db.String(20), unique=True, nullable=True)
    address = db.Column(db.Text, nullable=True)
    identity_verified = db.Column(db.Boolean, default=False)
    verified_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)


    # Blockchain fields
    blockchain_wallet = db.Column(db.String(120), unique=True, nullable=True)
    blockchain_public_key = db.Column(db.Text(120), nullable=True)

    tickets = db.relationship('Ticket', backref='user', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)
    booking_orders = db.relationship('BookingOrder', backref='user', lazy=True)

class Route(db.Model):
    __tablename__ = 'routes'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    distance = db.Column(db.Integer)  # in km
    duration = db.Column(db.Integer)  # in minutes
    base_price = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    schedules = db.relationship('Schedule', backref='route', lazy=True)

class Schedule(db.Model):
    __tablename__ = 'schedules'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    route_id = db.Column(db.String(36), db.ForeignKey('routes.id'), nullable=False)
    departure_time = db.Column(db.Time, nullable=False)
    arrival_time = db.Column(db.Time, nullable=False)
    train_number = db.Column(db.String(50), nullable=False)
    train_name = db.Column(db.String(100))
    available_seats = db.Column(db.Integer, default=100)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tickets = db.relationship('Ticket', backref='schedule', lazy=True)

class Ticket(db.Model):
    __tablename__ = 'tickets'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    schedule_id = db.Column(db.String(36), db.ForeignKey('schedules.id'), nullable=False)
    booking_order_id = db.Column(db.String(36), db.ForeignKey('booking_orders.id'), nullable=True)
    passenger_name = db.Column(db.String(100), nullable=False)
    passenger_email = db.Column(db.String(120), nullable=False)
    passenger_phone = db.Column(db.String(20))
    booker_nik = db.Column(db.String(20))
    travel_class = db.Column(db.String(50), nullable=False)
    seat_number = db.Column(db.String(10))
    total_price = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    face_verified = db.Column(db.Boolean, default=False)
    identity_verified = db.Column(db.Boolean, default=False)
    confidence_score = db.Column(db.Float)
    qr_code_data = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    blockchain_tx_hash = db.Column(db.String(256), nullable=True)
    nft_token_id = db.Column(db.String(120), nullable=True)
    is_on_blockchain = db.Column(db.Boolean, default=False)
    blockchain_metadata = db.Column(db.Text, nullable=True)

    @property 
    def short_id(self): 
        """Return first 8 characters of UUID in uppercase"""
        return self.id[:8].upper() 
    
    @classmethod
    def get_by_short_id(cls, short_id): 
        """Find ticket by short ID"""
        return cls.query.filter(cls.id.like(f"{short_id.lower()}%")).first()
    
    def to_blockchain_data(cls, short_id): 
        """Find tickey by short ID"""
        return cls.query.filter(cls.id.like(f"{short_id.lower()}%")).first()
    
    def to_blockchain_data(Self): 
        """Convert ticket data to blockchain-friendly format"""
        schedule = self.schedule 
        route = schedule.route 

        blockchain_data = {
            'ticket_id': self.id,
            'ticket_short_id': self.short_id,
            'passenger_name': self.passenger_name,
            'passenger_email': self.passenger_email,
            'train_number': schedule.train_number,
            'train_name': schedule.train_name,
            'origin': route.origin,
            'destination': route.destination,
            'departure_time': schedule.departure_time.isoformat() if schedule.departure_time else None,
            'arrival_time': schedule.arrival_time.isoformat() if schedule.arrival_time else None,
            'travel_class': self.travel_class,
            'seat_number': self.seat_number,
            'total_price': self.total_price,
            'face_verified': self.face_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        return blockchain_data

class Payment(db.Model):
    __tablename__ = 'payments'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    ticket_id = db.Column(db.String(36), db.ForeignKey('tickets.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(20), default='pending')
    external_id = db.Column(db.String(100))
    payment_url = db.Column(db.Text)
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    blockchain_tx_hash = db.Column(db.String(256), nullable=True)
    is_on_blockchain = db.Column(db.Boolean, default=False)

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='staff')
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BlockchainTransaction(db.Model): 
    __tablename__ = 'blockchain_transactions'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    ticket_id = db.Column(db.String(36), db.ForeignKey('ticket.id'), nullable=True)
    payment_id = db.Column(db.String(36), db.ForeignKey('payments.id'), nullable=True)
    transaction_type = db.Column(db.String(50), nullable=False)
    blockchain_tx_hash = db.Column(db.Integer, nullable=True)
    status =  db.Column(db.String(20), default='confirmed')
    gas_used = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    ticket = db.relationship('Ticket', backref='blockchain_transactions', lazy=True)
    payment = db.relationship('Payment', backref='blockchain_transactions', lazy=True)

class BookingOrder(db.Model):
    __tablename__ = 'booking_orders'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending') 
    payment_method = db.Column(db.String(50))
    
    identity_verified = db.Column(db.Boolean, default=False)
    verified_nik = db.Column(db.String(20))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='booking_orders', lazy=True)
    tickets = db.relationship('Ticket', backref='booking_order', lazy=True)

# Update User model - tambah identity fields
class User(db.Model, UserMixin): 
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    
    # ✅ NEW: Identity fields
    nik = db.Column(db.String(20), unique=True, nullable=True)
    address = db.Column(db.Text, nullable=True)
    identity_verified = db.Column(db.Boolean, default=False)
    verified_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Blockchain fields
    blockchain_wallet = db.Column(db.String(120), unique=True, nullable=True)
    blockchain_public_key = db.Column(db.Text, nullable=True)

    tickets = db.relationship('Ticket', backref='user', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)
    booking_orders = db.relationship('BookingOrder', backref='user', lazy=True)  # ✅ NEW

# Update Ticket model - tambah booking_order_id
class Ticket(db.Model):
    __tablename__ = 'tickets'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    schedule_id = db.Column(db.String(36), db.ForeignKey('schedules.id'), nullable=False)
    booking_order_id = db.Column(db.String(36), db.ForeignKey('booking_orders.id'), nullable=True)  # ✅ NEW
    
    # Data pemesan (yang bayar)
    booker_name = db.Column(db.String(100), nullable=False)
    booker_email = db.Column(db.String(120), nullable=False)
    booker_phone = db.Column(db.String(20))
    booker_nik = db.Column(db.String(20))  # ✅ NEW
    
    # Data penumpang (bisa sama dengan pemesan, bisa berbeda)
    passenger_name = db.Column(db.String(100), nullable=False)
    passenger_email = db.Column(db.String(120))
    passenger_phone = db.Column(db.String(20))
    passenger_nik = db.Column(db.String(20))  # ✅ NEW
    
    travel_class = db.Column(db.String(50), nullable=False)
    seat_number = db.Column(db.String(10))
    total_price = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    
    # Verifikasi
    face_verified = db.Column(db.Boolean, default=False)
    identity_verified = db.Column(db.Boolean, default=False)  # ✅ NEW
    confidence_score = db.Column(db.Float)
    qr_code_data = db.Column(db.Text)
    
    # Blockchain fields
    blockchain_tx_hash = db.Column(db.String(256), nullable=True)
    nft_token_id = db.Column(db.String(120), nullable=True)
    is_on_blockchain = db.Column(db.Boolean, default=False)
    blockchain_metadata = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)