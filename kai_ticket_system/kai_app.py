from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
import qrcode
import base64
from io import BytesIO
import os
import uuid

app = Flask(__name__)
app.secret_key = 'kai-secret-key-2025-prod'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kai_tickets.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Route(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    base_price = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Ticket(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    route_id = db.Column(db.String(36), db.ForeignKey('route.id'), nullable=False)
    passenger_name = db.Column(db.String(100), nullable=False)
    passenger_email = db.Column(db.String(120), nullable=False)
    passenger_phone = db.Column(db.String(20))
    travel_date = db.Column(db.String(10), nullable=False)
    travel_time = db.Column(db.String(5), nullable=False)
    travel_class = db.Column(db.String(20), nullable=False)
    total_price = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    face_verified = db.Column(db.Boolean, default=False)
    confidence_score = db.Column(db.Float)
    qr_code_data = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='tickets')
    route = db.relationship('Route', backref='tickets')

# Initialize database
def init_db():
    with app.app_context():
        db.create_all()
        
        # Add sample data if empty
        if Route.query.count() == 0:
            sample_routes = [
                Route(origin='Jakarta', destination='Bandung', base_price=100000, duration=180),
                Route(origin='Bandung', destination='Yogyakarta', base_price=200000, duration=360),
                Route(origin='Jakarta', destination='Surabaya', base_price=300000, duration=480),
            ]
            db.session.bulk_save_objects(sample_routes)
            db.session.commit()
            print("✅ Sample routes added to database")

init_db()

def generate_qr_code(data):
    """Generate QR code and return as base64 string"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return qr_code_base64
    except Exception as e:
        print(f"Error generating QR code: {e}")
        return None

# Authentication decorator
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Silakan login terlebih dahulu', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Helper function to format currency
def format_currency(amount):
    return "Rp {:,}".format(amount)

# Add to Jinja2 filters
app.jinja_env.filters['currency'] = format_currency

@app.route('/')
def home():
    routes = Route.query.filter_by(active=True).all()
    return render_template('index.html', routes=routes)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        full_name = request.form['full_name']
        phone = request.form['phone']
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            flash('Email sudah terdaftar', 'error')
            return render_template('register.html')
        
        # Create new user
        user = User(
            email=email,
            password=generate_password_hash(password),
            full_name=full_name,
            phone=phone
        )
        db.session.add(user)
        db.session.commit()
        
        # Auto login after registration
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['user_name'] = user.full_name
        
        flash('Registrasi berhasil!', 'success')
        return redirect(url_for('home'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['user_email'] = user.email
            session['user_name'] = user.full_name
            flash('Login berhasil!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Email atau password salah', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Anda telah logout', 'info')
    return redirect(url_for('home'))

@app.route('/booking', methods=['GET', 'POST'])
@login_required
def booking():
    if request.method == 'POST':
        route_id = request.form['route_id']
        travel_date = request.form['travel_date']
        travel_class = request.form['travel_class']
        passenger_name = request.form['passenger_name']
        passenger_email = request.form.get('passenger_email', '')
        passenger_phone = request.form.get('passenger_phone', '')
        
        route = Route.query.get(route_id)
        if not route:
            flash('Rute tidak ditemukan', 'error')
            return redirect(url_for('booking'))
        
        # Calculate price based on class
        price_multiplier = {
            'Ekonomi': 1.0,
            'Bisnis': 1.5, 
            'Eksekutif': 2.0
        }
        total_price = int(route.base_price * price_multiplier.get(travel_class, 1.0))
        
        # Create ticket
        ticket = Ticket(
            user_id=session['user_id'],
            route_id=route_id,
            passenger_name=passenger_name,
            passenger_email=passenger_email or session['user_email'],
            passenger_phone=passenger_phone or '',
            travel_date=travel_date,
            travel_time=request.form.get('travel_time', '08:00'),
            travel_class=travel_class,
            total_price=total_price,
            status='pending'
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        # Store ticket ID in session for verification
        session['pending_ticket_id'] = ticket.id
        
        return redirect(url_for('verification'))
    
    routes = Route.query.filter_by(active=True).all()
    min_date = datetime.now().strftime('%Y-%m-%d')
    max_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    available_times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    
    return render_template('booking.html', 
                         routes=routes, 
                         min_date=min_date, 
                         max_date=max_date,
                         available_times=available_times)

@app.route('/verification')
@login_required
def verification():
    ticket_id = session.get('pending_ticket_id')
    if not ticket_id:
        flash('Silakan lakukan pemesanan terlebih dahulu', 'warning')
        return redirect(url_for('booking'))
    
    ticket = db.session.get(Ticket, ticket_id)
    if not ticket or ticket.user_id != session['user_id']:
        flash('Tiket tidak valid', 'error')
        return redirect(url_for('booking'))
    
    return render_template('verification.html', ticket=ticket)

@app.route('/verify_face', methods=['POST'])
@login_required
def verify_face():
    try:
        ticket_id = session.get('pending_ticket_id')
        if not ticket_id:
            return jsonify({
                'success': False, 
                'message': 'Data tiket tidak ditemukan'
            }), 400
        
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket or ticket.user_id != session['user_id']:
            return jsonify({
                'success': False, 
                'message': 'Akses ditolak'
            }), 403
        
        # Check if face image was uploaded
        if 'face_image' not in request.files:
            return jsonify({
                'success': False, 
                'message': 'Gambar wajah tidak ditemukan'
            }), 400
        
        face_image = request.files['face_image']
        if face_image.filename == '':
            return jsonify({
                'success': False, 
                'message': 'Gambar wajah tidak ditemukan'
            }), 400
        
        # Simulate face verification (in real app, you would use face recognition)
        ticket.face_verified = True
        ticket.confidence_score = 0.95
        ticket.status = 'verified'
        
        # Generate QR Code
        qr_data = f"""
KAI E-TICKET
ID: {ticket.id}
Nama: {ticket.passenger_name}
Rute: {ticket.route.origin} - {ticket.route.destination}
Tanggal: {ticket.travel_date}
Waktu: {ticket.travel_time}
Kelas: {ticket.travel_class}
Harga: Rp {ticket.total_price:,}
Status: TERVERIFIKASI
        """.strip()
        
        print(f"🔍 Generating QR code for ticket: {ticket.id}")
        qr_code_result = generate_qr_code(qr_data)
        if qr_code_result:
            ticket.qr_code_data = qr_code_result
            print(f"✅ QR code generated successfully")
        else:
            print(f"❌ Failed to generate QR code")
        
        db.session.commit()
        print(f"💾 Ticket saved to database")
        
        # Clear pending ticket from session
        session.pop('pending_ticket_id', None)
        
        redirect_url = url_for('ticket', ticket_id=ticket.id)
        print(f"🔗 Redirect URL: {redirect_url}")
        
        return jsonify({
            'success': True,
            'message': 'Verifikasi berhasil!',
            'redirect_url': redirect_url
        })
        
    except Exception as e:
        print(f"Error in verify_face: {e}")
        return jsonify({
            'success': False,
            'message': f'Terjadi error: {str(e)}'
        }), 500

@app.route('/ticket/<ticket_id>')
@login_required
def ticket(ticket_id):
    try:
        print(f"🔍 Mencari ticket dengan: {ticket_id}")
        print(f"👤 User: {session['user_id']}")
        
        # CASE 1: Jika ticket_id pendek (8 karakter), cari yang mengandung
        if len(ticket_id) == 8:
            print("🔄 Menggunakan partial match untuk short ID")
            ticket = Ticket.query.filter(Ticket.id.like(f"{ticket_id.lower()}%")).first()
        else:
            # CASE 2: Jika ticket_id panjang, cari exact match
            ticket = Ticket.query.get(ticket_id)
        
        if not ticket:
            print(f"❌ Ticket tidak ditemukan: {ticket_id}")
            flash(f'Tiket {ticket_id} tidak ditemukan', 'error')
            return redirect(url_for('my_tickets'))
        
        print(f"✅ Ticket ditemukan: {ticket.id}")
        print(f"📋 Passenger: {ticket.passenger_name}")
        print(f"🎫 Status: {ticket.status}")
        print(f"👤 Face verified: {ticket.face_verified}")
        print(f"📱 QR code available: {ticket.qr_code_data is not None}")
        
        # Check ownership
        if str(ticket.user_id) != str(session['user_id']):
            flash('Anda tidak memiliki akses ke tiket ini', 'error')
            return redirect(url_for('my_tickets'))
        
        return render_template('ticket.html', ticket=ticket)
        
    except Exception as e:
        print(f"💥 Error: {e}")
        flash('Terjadi error saat memuat tiket', 'error')
        return redirect(url_for('my_tickets'))

@app.route('/my_tickets')
@login_required
def my_tickets():
    tickets = Ticket.query.filter_by(user_id=session['user_id']).order_by(Ticket.created_at.desc()).all()
    return render_template('my_tickets.html', tickets=tickets)

@app.route('/about')
def about():
    return render_template('about.html')

# Blockchain Routes
@app.route('/blockchain/explorer')
def blockchain_explorer():
    """Blockchain transaction explorer for transparency"""
    try:
        # Import blockchain service
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from blockchain_service import kai_blockchain
        
        # Get blockchain data
        chain_data = kai_blockchain.get_chain_data()
        stats = kai_blockchain.get_blockchain_stats()
        
        return render_template('blockchain_explorer.html', 
                            chain_data=chain_data, 
                            stats=stats)
    except Exception as e:
        flash(f'Error loading blockchain data: {str(e)}', 'error')
        return render_template('blockchain_explorer.html', 
                            chain_data={'chain': [], 'performance_metrics': {}}, 
                            stats={'total_blocks': 0, 'total_transactions': 0, 'payment_transactions': 0, 'nft_transactions': 0})

@app.route('/blockchain/dashboard')
def blockchain_dashboard():
    """Real-time blockchain dashboard"""
    try:
        # Import blockchain service
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from blockchain_service import kai_blockchain
        
        # Get blockchain data
        chain_data = kai_blockchain.get_chain_data()
        stats = kai_blockchain.get_blockchain_stats()
        
        return render_template('blockchain_dashboard.html', 
                            chain_data=chain_data, 
                            stats=stats)
    except Exception as e:
        flash(f'Error loading blockchain dashboard: {str(e)}', 'error')
        return render_template('blockchain_dashboard.html', 
                            chain_data={'performance_metrics': {}}, 
                            stats={'total_blocks': 0, 'total_transactions': 0, 'payment_transactions': 0, 'nft_transactions': 0, 'pending_transactions': 0})

@app.route('/wallet/connect')
def wallet_connect():
    """Wallet connection page"""
    return render_template('wallet_connect.html')

@app.route('/api/blockchain/stats')
def blockchain_stats_api():
    """API endpoint for blockchain statistics"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from blockchain_service import kai_blockchain
        stats = kai_blockchain.get_blockchain_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/smart-contract/validate/<ticket_id>')
def validate_ticket_smart_contract(ticket_id):
    """Validate ticket using smart contract"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from smart_contract import kai_smart_contract
        
        validation_result = kai_smart_contract.validate_ticket(ticket_id)
        return jsonify(validation_result)
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500

@app.route('/api/smart-contract/mint-nft/<ticket_id>', methods=['POST'])
def mint_nft_ticket(ticket_id):
    """Mint NFT ticket using smart contract"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from smart_contract import kai_smart_contract
        
        minting_result = kai_smart_contract.mint_nft_ticket(ticket_id)
        return jsonify(minting_result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/smart-contract/info')
def smart_contract_info():
    """Get smart contract information"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from smart_contract import kai_smart_contract
        
        contract_info = kai_smart_contract.get_contract_info()
        return jsonify(contract_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/smart-contract/validation-history/<ticket_id>')
def get_validation_history(ticket_id):
    """Get validation history for a ticket"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from smart_contract import kai_smart_contract
        
        history = kai_smart_contract.get_validation_history(ticket_id)
        return jsonify(history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting KAI Ticket System...")
    print("📊 Database initialized with sample routes")
    print("🌐 Server running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)

@app.route('/debug_urls')
def debug_urls():
    """Debug untuk cek semua routes"""
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'path': str(rule)
        })
    return jsonify(routes)