from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, flash, current_app
from flask_login import login_user, logout_user, login_required, current_user
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
import qrcode
import base64
import requests
from io import BytesIO
from app import db, mail
from app.models import User, Route, Schedule, Ticket, Payment, AdminUser

# Blueprints
main_bp = Blueprint('main', __name__)
auth_bp = Blueprint('auth', __name__)
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
payment_bp = Blueprint('payment', __name__)

# Payment Service
class MidtransPayment:
    def __init__(self, app):
        self.server_key = app.config['MIDTRANS_SERVER_KEY']
        self.client_key = app.config['MIDTRANS_CLIENT_KEY']
        self.is_production = app.config['MIDTRANS_IS_PRODUCTION']
        self.base_url = "https://app.sandbox.midtrans.com" if not self.is_production else "https://app.midtrans.com"
    
    def create_transaction(self, order_id, gross_amount, customer_details, item_details):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {base64.b64encode(f"{self.server_key}:".encode()).decode()}',
            'Accept': 'application/json'
        }
        
        payload = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": gross_amount
            },
            "customer_details": customer_details,
            "item_details": item_details,
            "credit_card": {
                "secure": True
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/snap/v1/transactions",
                headers=headers,
                json=payload,
                timeout=30
            )
            return response.json()
        except Exception as e:
            print(f"Payment error: {e}")
            return None

# Utility Functions
def generate_qr_code(data):
    try:
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()
    except Exception as e:
        print(f"QR Error: {e}")
        return None

def send_email(to, subject, template):
    try:
        msg = Message(subject=subject, recipients=[to], html=template, sender=current_app.config['MAIL_USERNAME'])
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def init_sample_data():
    """Initialize sample data for testing"""
    if Route.query.first() is None:
        # Sample routes
        routes = [
            Route(origin='Jakarta', destination='Bandung', distance=150, duration=180, base_price=100000),
            Route(origin='Bandung', destination='Yogyakarta', distance=450, duration=360, base_price=200000),
            Route(origin='Jakarta', destination='Surabaya', distance=750, duration=480, base_price=300000),
        ]
        
        for route in routes:
            db.session.add(route)
        
        db.session.commit()
        
        # Sample schedules
        schedules = [
            Schedule(route_id=route.id, departure_time=datetime.strptime('08:00', '%H:%M').time(),
                    arrival_time=datetime.strptime('11:00', '%H:%M').time(), train_number='KA-001', train_name='Argo Parahyangan'),
            Schedule(route_id=route.id, departure_time=datetime.strptime('14:00', '%H:%M').time(),
                    arrival_time=datetime.strptime('17:00', '%H:%M').time(), train_number='KA-002', train_name='Turangga'),
        ]
        
        for schedule in schedules:
            db.session.add(schedule)
        
        # Admin user
        admin = AdminUser(username='admin', password=generate_password_hash('admin123'), role='admin')
        db.session.add(admin)
        
        db.session.commit()

# BLOCKCHAIN INTEGRATION FUNCTIONS
def record_payment_on_blockchain(ticket_id, user_id, amount):
    """Record payment on blockchain - non-blocking"""
    try:
        from app.payment_service import BlockchainPaymentService
        
        # Cari payment yang terkait
        payment = Payment.query.filter_by(ticket_id=ticket_id, payment_status='paid').first()
        
        if payment:
            blockchain_result = BlockchainPaymentService.process_blockchain_payment(
                payment_id=payment.id,
                ticket_id=ticket_id,
                user_id=user_id,
                amount=amount
            )
            
            if blockchain_result['success']:
                print(f"✓ Payment recorded on blockchain! TX: {blockchain_result['payment_tx_hash']}")
                return True
            else:
                print(f"⚠️ Blockchain recording failed: {blockchain_result.get('error')}")
                return False
                
    except Exception as e:
        print(f"⚠️ Blockchain integration error: {e}")
        return False

def record_face_verification_on_blockchain(ticket_id, passenger_name, confidence_score):
    """Record face verification on blockchain - non-blocking"""
    try:
        from app.blockchain_service import kai_blockchain
        
        verification_data = {
            'ticket_id': ticket_id,
            'passenger_name': passenger_name,
            'face_verified': True,
            'confidence_score': confidence_score,
            'verified_at': str(datetime.now())
        }
        
        # Add to blockchain sebagai verification record
        kai_blockchain.pending_transactions.append({
            'type': 'FACE_VERIFICATION',
            'ticket_id': ticket_id,
            'verification_data': verification_data,
            'timestamp': str(datetime.now())
        })
        
        print(f"✓ Face verification recorded on blockchain for ticket {ticket_id}")
        return True
        
    except Exception as e:
        print(f"⚠️ Blockchain verification record error: {e}")
        return False

# Main Routes
@main_bp.route('/')
def home():
    routes = Route.query.filter_by(active=True).all()
    return render_template('index.html', routes=routes)

@main_bp.route('/booking', methods=['GET', 'POST'])
@login_required
def booking():
    if request.method == 'POST':
        schedule_id = request.form['schedule_id']
        travel_class = request.form['travel_class']
        passenger_name = request.form['passenger_name']
        passenger_email = request.form['passenger_email']
        passenger_phone = request.form['passenger_phone']
        
        schedule = Schedule.query.get_or_404(schedule_id)
        
        # Calculate price based on class
        price_multiplier = {'Ekonomi': 1, 'Bisnis': 1.5, 'Eksekutif': 2}
        total_price = int(schedule.route.base_price * price_multiplier.get(travel_class, 1))
        
        # Create ticket
        ticket = Ticket(
            user_id=current_user.id,
            schedule_id=schedule_id,
            passenger_name=passenger_name,
            passenger_email=passenger_email,
            passenger_phone=passenger_phone,
            travel_class=travel_class,
            total_price=total_price,
            status='pending'
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        session['pending_ticket_id'] = ticket.id
        return redirect(url_for('payment.payment_page', ticket_id=ticket.id))
    
    routes = Route.query.filter_by(active=True).all()
    min_date = datetime.now().strftime('%Y-%m-%d')
    max_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    
    return render_template('booking.html', routes=routes, min_date=min_date, max_date=max_date)

@main_bp.route('/verification/<ticket_id>')
@login_required
def verification(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    if ticket.user_id != current_user.id:
        flash('Akses ditolak', 'error')
        return redirect(url_for('main.home'))
    
    return render_template('verification.html', ticket=ticket)

@main_bp.route('/verify_face', methods=['POST'])
@login_required
def verify_face():
    try:
        ticket_id = request.form.get('ticket_id')
        ticket = Ticket.query.get_or_404(ticket_id)
        
        if ticket.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Akses ditolak'}), 403
        
        # EXISTING CODE - Simulate face verification
        ticket.face_verified = True
        ticket.confidence_score = 0.95
        
        # ✅ NEW: Record face verification on blockchain (non-blocking)
        record_face_verification_on_blockchain(
            ticket_id=ticket.id,
            passenger_name=ticket.passenger_name,
            confidence_score=0.95
        )
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Verifikasi berhasil!',
            'redirect_url': url_for('main.ticket', ticket_id=ticket.id)
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@main_bp.route('/ticket/<ticket_id>')
@login_required
def ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    if ticket.user_id != current_user.id and not session.get('admin_logged_in'):
        flash('Akses ditolak', 'error')
        return redirect(url_for('main.home'))
    
    # ✅ NEW: Check blockchain verification status
    blockchain_verified = False
    try:
        from app.payment_service import BlockchainPaymentService
        verification = BlockchainPaymentService.verify_ticket_on_blockchain(ticket.id)
        blockchain_verified = verification.get('verified', False)
    except Exception as e:
        print(f"Blockchain verification error: {e}")
    
    return render_template('ticket.html', 
                         ticket=ticket, 
                         blockchain_verified=blockchain_verified)

@main_bp.route('/my_tickets')
@login_required
def my_tickets():
    tickets = Ticket.query.filter_by(user_id=current_user.id).order_by(Ticket.created_at.desc()).all()
    return render_template('my_tickets.html', tickets=tickets)

# ✅ NEW ROUTE: Blockchain verification page
@main_bp.route('/ticket/<ticket_id>/blockchain')
@login_required
def ticket_blockchain_info(ticket_id):
    """Halaman tambahan untuk melihat info blockchain ticket"""
    ticket = Ticket.query.get_or_404(ticket_id)
    
    if ticket.user_id != current_user.id and not session.get('admin_logged_in'):
        flash('Akses ditolak', 'error')
        return redirect(url_for('main.home'))
    
    # Cek status di blockchain
    blockchain_verified = False
    blockchain_data = None
    
    try:
        from app.payment_service import BlockchainPaymentService
        verification = BlockchainPaymentService.verify_ticket_on_blockchain(ticket.id)
        blockchain_verified = verification.get('verified', False)
        blockchain_data = verification
    except Exception as e:
        print(f"Blockchain verification error: {e}")
    
    return render_template('ticket_blockchain.html', 
                         ticket=ticket,
                         blockchain_verified=blockchain_verified,
                         blockchain_data=blockchain_data)

# Auth Routes
@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        full_name = request.form['full_name']
        phone = request.form['phone']
        
        if User.query.filter_by(email=email).first():
            flash('Email sudah terdaftar', 'error')
            return render_template('register.html')
        
        user = User(
            email=email,
            password=generate_password_hash(password),
            full_name=full_name,
            phone=phone
        )
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registrasi berhasil! Silakan login.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Login berhasil!', 'success')
            return redirect(url_for('main.home'))
        else:
            flash('Email atau password salah', 'error')
    
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Anda telah logout', 'info')
    return redirect(url_for('main.home'))

# Payment Routes
@payment_bp.route('/payment/<ticket_id>')
@login_required
def payment_page(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    if ticket.user_id != current_user.id:
        flash('Akses ditolak', 'error')
        return redirect(url_for('main.home'))
    
    return render_template('payment.html', ticket=ticket)

# ✅ FOCUS: Blockchain Payment Route yang Sederhana
@payment_bp.route('/blockchain-payment/<ticket_id>', methods=['GET', 'POST'])
@login_required
def blockchain_payment(ticket_id):
    """Halaman payment dengan blockchain"""
    ticket = Ticket.query.get_or_404(ticket_id)
    
    if ticket.user_id != current_user.id:
        flash('Akses ditolak', 'error')
        return redirect(url_for('main.home'))
    
    # Cek apakah sudah verifikasi wajah
    if not ticket.face_verified:
        flash('Silakan verifikasi wajah terlebih dahulu', 'warning')
        return redirect(url_for('main.verification', ticket_id=ticket.id))
    
    # Cek apakah sudah bayar
    if ticket.status == 'paid':
        flash('Tiket sudah dibayar', 'info')
        return redirect(url_for('main.ticket', ticket_id=ticket.id))
    
    if request.method == 'POST':
        # Proses payment blockchain
        wallet_address = request.form.get('wallet_address')
        blockchain_type = request.form.get('blockchain_type', 'ethereum')
        
        if not wallet_address:
            flash('Masukkan wallet address', 'error')
            return render_template('blockchain_payment.html', ticket=ticket)
        
        try:
            # Process blockchain payment
            from app.payment_service import BlockchainPaymentService
            
            # Create payment record
            payment = Payment(
                user_id=current_user.id,
                ticket_id=ticket_id,
                amount=ticket.total_price,
                payment_method=f'blockchain_{blockchain_type}',
                payment_status='pending'
            )
            db.session.add(payment)
            db.session.commit()
            
            # Process blockchain payment
            blockchain_result = BlockchainPaymentService.process_blockchain_payment(
                payment_id=payment.id,
                ticket_id=ticket_id,
                user_id=current_user.id,
                amount=ticket.total_price
            )
            
            if blockchain_result['success']:
                # Update payment status dan ticket
                payment.payment_status = 'paid'
                payment.paid_at = datetime.utcnow()
                
                ticket.status = 'paid'
                ticket.is_on_blockchain = True
                ticket.blockchain_tx_hash = blockchain_result['nft_tx_hash']
                ticket.nft_token_id = blockchain_result['nft_token_id']
                
                # ✅ GENERATE QR CODE SETELAH PAYMENT BERHASIL
                qr_data = f"""
KAI E-TICKET - BLOCKCHAIN
ID: {ticket.id}
Penumpang: {ticket.passenger_name}
NIK: {ticket.passenger_nik}
Rute: {ticket.schedule.route.origin} - {ticket.schedule.route.destination}
Kereta: {ticket.schedule.train_name}
Kelas: {ticket.travel_class}
TX: {blockchain_result['nft_tx_hash'][:16]}...
Status: PAID (BLOCKCHAIN)
                """.strip()
                
                ticket.qr_code_data = generate_qr_code(qr_data)
                db.session.commit()
                
                # Kirim email konfirmasi
                send_confirmation_email(ticket)
                
                flash('Pembayaran blockchain berhasil! QR Code telah digenerate.', 'success')
                return redirect(url_for('main.ticket', ticket_id=ticket.id))
                
            else:
                flash(f'Pembayaran gagal: {blockchain_result.get("error")}', 'error')
                return render_template('blockchain_payment.html', ticket=ticket)
                
        except Exception as e:
            db.session.rollback()
            flash(f'Error: {str(e)}', 'error')
            return render_template('blockchain_payment.html', ticket=ticket)
    
    return render_template('blockchain_payment.html', ticket=ticket)

# ✅ UPDATE: Verification route - redirect ke blockchain payment
@main_bp.route('/verification/<ticket_id>')
@login_required
def verification(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    if ticket.user_id != current_user.id:
        flash('Akses ditolak', 'error')
        return redirect(url_for('main.home'))
    
    # Jika sudah verifikasi, redirect ke payment
    if ticket.face_verified and ticket.status != 'paid':
        return redirect(url_for('payment.blockchain_payment', ticket_id=ticket.id))
    
    # Jika sudah bayar, redirect ke ticket
    if ticket.status == 'paid':
        return redirect(url_for('main.ticket', ticket_id=ticket.id))
    
    return render_template('verification.html', ticket=ticket)

@main_bp.route('/verify_face', methods=['POST'])
@login_required
def verify_face():
    try:
        ticket_id = request.form.get('ticket_id')
        ticket = Ticket.query.get_or_404(ticket_id)
        
        if ticket.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Akses ditolak'}), 403
        
        # Verifikasi wajah
        ticket.face_verified = True
        ticket.confidence_score = 0.95
        
        # Record di blockchain
        record_face_verification_on_blockchain(
            ticket_id=ticket.id,
            passenger_name=ticket.passenger_name,
            confidence_score=0.95
        )
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Verifikasi berhasil! Lanjutkan ke pembayaran blockchain.',
            'redirect_url': url_for('payment.blockchain_payment', ticket_id=ticket.id)  
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@payment_bp.route('/api/create_payment', methods=['POST'])
@login_required
def create_payment():
    try:
        data = request.get_json()
        ticket_id = data.get('ticket_id')
        
        ticket = Ticket.query.get_or_404(ticket_id)
        
        if ticket.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Akses ditolak'}), 403
        
        # Create payment record
        payment = Payment(
            user_id=current_user.id,
            ticket_id=ticket_id,
            amount=ticket.total_price,
            payment_method='credit_card',
            payment_status='pending'
        )
        db.session.add(payment)
        db.session.commit()
        
        # Initialize payment service
        midtrans = MidtransPayment(current_app)
        
        # Prepare customer details
        customer_details = {
            "first_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone
        }
        
        item_details = [{
            "id": ticket.id,
            "price": ticket.total_price,
            "quantity": 1,
            "name": f"Tiket KAI {ticket.schedule.route.origin} - {ticket.schedule.route.destination}"
        }]
        
        # Create transaction
        payment_result = midtrans.create_transaction(
            order_id=payment.id,
            gross_amount=ticket.total_price,
            customer_details=customer_details,
            item_details=item_details
        )
        
        if payment_result and 'token' in payment_result:
            payment.external_id = payment_result.get('transaction_id')
            payment.payment_url = payment_result.get('redirect_url')
            db.session.commit()
            
            return jsonify({
                'success': True,
                'token': payment_result['token'],
                'redirect_url': payment_result['redirect_url']
            })
        else:
            return jsonify({'success': False, 'message': 'Gagal membuat transaksi pembayaran'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@payment_bp.route('/api/create_blockchain_payment', methods=['POST'])
@login_required
def create_blockchain_payment():
    """Create blockchain payment and process transaction"""
    try:
        data = request.get_json()
        ticket_id = data.get('ticket_id')
        wallet_address = data.get('wallet_address')
        blockchain_type = data.get('blockchain_type', 'ethereum')
        
        ticket = Ticket.query.get_or_404(ticket_id)
        
        if ticket.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Akses ditolak'}), 403
        
        # Create payment record
        payment = Payment(
            user_id=current_user.id,
            ticket_id=ticket_id,
            amount=ticket.total_price,
            payment_method='blockchain',
            payment_status='pending'
        )
        db.session.add(payment)
        db.session.commit()
        
        # Process blockchain payment
        from app.payment_service import BlockchainPaymentService
        
        blockchain_result = BlockchainPaymentService.process_blockchain_payment(
            payment_id=payment.id,
            ticket_id=ticket_id,
            user_id=current_user.id,
            amount=ticket.total_price
        )
        
        if blockchain_result['success']:
            # Update payment status
            payment.payment_status = 'completed'
            payment.paid_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'success': True,
                'tx_hash': blockchain_result['payment_tx_hash'],
                'nft_tx_hash': blockchain_result['nft_tx_hash'],
                'nft_token_id': blockchain_result['nft_token_id'],
                'block_number': blockchain_result['block_index'],
                'gas_used': '21000',  # Standard gas for simple transaction
                'message': 'Pembayaran blockchain berhasil!'
            })
        else:
            return jsonify({
                'success': False, 
                'message': f'Gagal memproses pembayaran blockchain: {blockchain_result.get("error", "Unknown error")}'
            }), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@payment_bp.route('/blockchain/explorer')
def blockchain_explorer():
    """Blockchain transaction explorer for transparency"""
    try:
        from app.blockchain_service import kai_blockchain
        
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

# ✅ API Route untuk Blockchain Dashboard
@main_bp.route('/api/blockchain/stats')
def blockchain_stats_api():
    """API endpoint untuk blockchain statistics"""
    try:
        from app.payment_service import BlockchainPaymentService
        stats = BlockchainPaymentService.get_blockchain_stats()
        return jsonify(stats)
    except Exception as e:
        print(f"Blockchain stats API error: {e}")
        # Return dummy data jika error
        return jsonify({
            'total_blocks': 15,
            'total_transactions': 42,
            'payment_transactions': 25,
            'nft_transactions': 12,
            'verification_transactions': 5,
            'pending_transactions': 3
        })

@main_bp.route('/api/blockchain/live-data')
def blockchain_live_data():
    """API untuk data real-time blockchain"""
    try:
        from app.payment_service import BlockchainPaymentService
        from app.blockchain_service import kai_blockchain
        
        stats = BlockchainPaymentService.get_blockchain_stats()
        
        # Generate live activity based on recent blocks
        live_activity = "Blockchain synchronized"
        if kai_blockchain.pending_transactions:
            live_activity = f"Processing {len(kai_blockchain.pending_transactions)} pending transactions"
        elif stats['total_transactions'] > 0:
            live_activity = f"Block #{stats['total_blocks']} confirmed with {stats['total_transactions']} total transactions"
        
        return jsonify({
            'stats': stats,
            'live_activity': live_activity,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'network_status': 'online',
            'blockchain_height': stats['total_blocks']
        })
        
    except Exception as e:
        print(f"Live data API error: {e}")
        return jsonify({
            'error': str(e),
            'network_status': 'offline',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'stats': {
                'total_blocks': 0,
                'total_transactions': 0,
                'payment_transactions': 0,
                'nft_transactions': 0,
                'verification_transactions': 0,
                'pending_transactions': 0
            }
        })

@payment_bp.route('/wallet/connect')
def wallet_connect():
    """Wallet connection page"""
    return render_template('wallet_connect.html')

@payment_bp.route('/blockchain/dashboard')
def blockchain_dashboard():
    """Real-time blockchain dashboard"""
    try:
        from app.blockchain_service import kai_blockchain
        
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

@payment_bp.route('/api/smart-contract/validate/<ticket_id>')
def validate_ticket_smart_contract(ticket_id):
    """Validate ticket using smart contract"""
    try:
        from app.smart_contract import kai_smart_contract
        
        validation_result = kai_smart_contract.validate_ticket(ticket_id)
        return jsonify(validation_result)
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500

@payment_bp.route('/api/smart-contract/mint-nft/<ticket_id>', methods=['POST'])
def mint_nft_ticket(ticket_id):
    """Mint NFT ticket using smart contract"""
    try:
        from app.smart_contract import kai_smart_contract
        
        minting_result = kai_smart_contract.mint_nft_ticket(ticket_id)
        return jsonify(minting_result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@payment_bp.route('/api/smart-contract/info')
def smart_contract_info():
    """Get smart contract information"""
    try:
        from app.smart_contract import kai_smart_contract
        
        contract_info = kai_smart_contract.get_contract_info()
        return jsonify(contract_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/api/smart-contract/validation-history/<ticket_id>')
def get_validation_history(ticket_id):
    """Get validation history for a ticket"""
    try:
        from app.smart_contract import kai_smart_contract
        
        history = kai_smart_contract.get_validation_history(ticket_id)
        return jsonify(history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/payment/success/<ticket_id>')
@login_required
def payment_success(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    if ticket.user_id != current_user.id:
        flash('Akses ditolak', 'error')
        return redirect(url_for('main.home'))
    
    # EXISTING CODE - Generate QR code
    qr_data = f"""
KAI E-TICKET
ID: {ticket.id}
Nama: {ticket.passenger_name}
Rute: {ticket.schedule.route.origin} - {ticket.schedule.route.destination}
Tanggal: {ticket.schedule.departure_time}
Kelas: {ticket.travel_class}
Status: PAID
    """.strip()
    
    ticket.qr_code_data = generate_qr_code(qr_data)
    ticket.status = 'paid'
    
    # ✅ NEW: Record payment on blockchain (non-blocking)
    record_payment_on_blockchain(
        ticket_id=ticket.id,
        user_id=current_user.id,
        amount=ticket.total_price
    )
    
    db.session.commit()
    
    # Send confirmation email
    send_confirmation_email(ticket)
    
    flash('Pembayaran berhasil! Tiket telah dikirim ke email Anda.', 'success')
    return redirect(url_for('main.ticket', ticket_id=ticket.id))

# Admin Routes
@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username == current_app.config['ADMIN_USERNAME'] and password == current_app.config['ADMIN_PASSWORD']:
            session['admin_logged_in'] = True
            flash('Login admin berhasil!', 'success')
            return redirect(url_for('admin.admin_dashboard'))
        else:
            flash('Username atau password salah', 'error')
    
    return render_template('admin/login.html')

@admin_bp.route('/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    # Statistics
    total_tickets = Ticket.query.count()
    total_revenue = db.session.query(db.func.sum(Payment.amount)).filter(Payment.payment_status == 'success').scalar() or 0
    pending_tickets = Ticket.query.filter_by(status='pending').count()
    today_tickets = Ticket.query.filter(db.func.date(Ticket.created_at) == datetime.today().date()).count()
    
    recent_tickets = Ticket.query.order_by(Ticket.created_at.desc()).limit(5).all()
    
    # ✅ NEW: Blockchain stats
    blockchain_stats = {}
    try:
        from app.payment_service import BlockchainPaymentService
        blockchain_stats = BlockchainPaymentService.get_blockchain_stats()
    except Exception as e:
        print(f"Blockchain stats error: {e}")
    
    return render_template('admin/dashboard.html',
                         total_tickets=total_tickets,
                         total_revenue=total_revenue,
                         pending_tickets=pending_tickets,
                         today_tickets=today_tickets,
                         recent_tickets=recent_tickets,
                         blockchain_stats=blockchain_stats)

@admin_bp.route('/tickets')
def admin_tickets():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    return render_template('admin/tickets.html', tickets=tickets)

# ✅ NEW ROUTE: Blockchain explorer untuk admin
@admin_bp.route('/blockchain')
def admin_blockchain():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    try:
        from app.payment_service import BlockchainPaymentService
        stats = BlockchainPaymentService.get_blockchain_stats()
        blockchain_data = BlockchainPaymentService.get_blockchain_data()
    except Exception as e:
        stats = {}
        blockchain_data = {}
        flash(f'Error loading blockchain data: {e}', 'error')
    
    return render_template('admin/blockchain.html',
                         stats=stats,
                         blockchain_data=blockchain_data)

@admin_bp.route('/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('Logout admin berhasil', 'info')
    return redirect(url_for('admin.admin_login'))

# Email function
def send_confirmation_email(ticket):
    subject = f"Konfirmasi Tiket KAI - {ticket.id}"
    
    html_template = f"""
    <h2>Terima Kasih atas Pemesanan Anda!</h2>
    <p>Tiket KAI Anda telah berhasil dipesan dan dibayar.</p>
    
    <div style="border: 2px solid #0056b3; padding: 20px; border-radius: 10px;">
        <h3>E-TICKET KAI</h3>
        <p><strong>ID Tiket:</strong> {ticket.id}</p>
        <p><strong>Nama Penumpang:</strong> {ticket.passenger_name}</p>
        <p><strong>Rute:</strong> {ticket.schedule.route.origin} - {ticket.schedule.route.destination}</p>
        <p><strong>Tanggal & Waktu:</strong> {ticket.schedule.departure_time}</p>
        <p><strong>Kelas:</strong> {ticket.travel_class}</p>
    </div>
    
    <p>Terima kasih telah memilih KAI!</p>
    """
    
    return send_email(ticket.passenger_email, subject, html_template)

@main_bp.route('/blockchain/dashboard')
@login_required
def blockchain_dashboard():
    """Blockchain dashboard dengan data dummy"""
    try:
        from app.payment_service import BlockchainPaymentService
        
        # Get real stats jika ada
        stats = BlockchainPaymentService.get_blockchain_stats()
        
        # Data dummy untuk performance metrics
        performance_metrics = {
            'cache_hit_rate': 0.85,  # 85%
            'average_block_size': 2.3,
            'transaction_speed': 2.5,  # seconds
            'uptime_percentage': 99.9
        }
        
        # Data dummy untuk recent transactions
        recent_transactions = [
            {
                'type': 'PAYMENT',
                'ticket_id': 'TKT-001',
                'amount': 150000,
                'status': 'CONFIRMED',
                'timestamp': '2024-01-15 10:30:00',
                'block': 125
            },
            {
                'type': 'NFT_MINT',
                'ticket_id': 'TKT-002', 
                'amount': 200000,
                'status': 'CONFIRMED',
                'timestamp': '2024-01-15 10:25:00',
                'block': 124
            },
            {
                'type': 'PAYMENT',
                'ticket_id': 'TKT-003',
                'amount': 175000,
                'status': 'PENDING',
                'timestamp': '2024-01-15 10:20:00',
                'block': 123
            },
            {
                'type': 'FACE_VERIFICATION',
                'ticket_id': 'TKT-001',
                'amount': 0,
                'status': 'CONFIRMED',
                'timestamp': '2024-01-15 10:15:00',
                'block': 122
            },
            {
                'type': 'NFT_MINT',
                'ticket_id': 'TKT-004',
                'amount': 120000,
                'status': 'CONFIRMED',
                'timestamp': '2024-01-15 10:10:00',
                'block': 121
            }
        ]
        
        chain_data = {
            'performance_metrics': performance_metrics,
            'recent_transactions': recent_transactions
        }
        
        return render_template('blockchain_dashboard.html', 
                             stats=stats,
                             chain_data=chain_data)
                             
    except Exception as e:
        print(f"Blockchain dashboard error: {e}")
        # Fallback data jika error
        fallback_stats = {
            'total_blocks': 125,
            'total_transactions': 89,
            'payment_transactions': 45,
            'nft_transactions': 32,
            'verification_transactions': 12,
            'pending_transactions': 3
        }
        
        fallback_metrics = {
            'cache_hit_rate': 0.82,
            'average_block_size': 2.1,
            'transaction_speed': 2.8,
            'uptime_percentage': 99.8
        }
        
        fallback_transactions = [
            {
                'type': 'PAYMENT',
                'ticket_id': 'TKT-001',
                'amount': 150000,
                'status': 'CONFIRMED',
                'timestamp': '2024-01-15 10:30:00',
                'block': 125
            }
        ]
        
        return render_template('blockchain_dashboard.html',
                             stats=fallback_stats,
                             chain_data={'performance_metrics': fallback_metrics, 'recent_transactions': fallback_transactions})
    
@main_bp.route('/api/blockchain/live-data')
def blockchain_live_data():
    """API untuk data real-time blockchain"""
    try:
        from app.payment_service import BlockchainPaymentService
        
        # Get real stats
        stats = BlockchainPaymentService.get_blockchain_stats()
        
        # Generate some live activity
        activities = [
            "New block mined successfully",
            "Payment transaction processed", 
            "NFT ticket minted",
            "Face verification recorded",
            "Blockchain sync completed"
        ]
        
        import random
        live_data = {
            'stats': stats,
            'live_activity': random.choice(activities),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'network_status': 'online',
            'pending_count': random.randint(0, 5)
        }
        
        return jsonify(live_data)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'network_status': 'offline',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    
@main_bp.route('/blockchain/explorer')
@login_required
def blockchain_explorer():
    """Blockchain explorer dengan data dummy yang lengkap"""
    try:
        from app.payment_service import BlockchainPaymentService
        
        # Get real stats jika ada
        stats = BlockchainPaymentService.get_blockchain_stats()
        
    except Exception as e:
        print(f"Blockchain explorer error: {e}")
        # Fallback dummy stats
        stats = {
            'total_blocks': 15,
            'total_transactions': 42,
            'payment_transactions': 25,
            'nft_transactions': 12,
            'verification_transactions': 5,
            'pending_transactions': 3
        }
    
    # Data dummy untuk blockchain chain
    dummy_chain = [
        {
            'index': 1,
            'timestamp': '2024-01-15 08:00:00',
            'proof': 1,
            'previous_hash': '0',
            'merkle_root': 'a1b2c3d4e5f678901234567890123456',
            'transactions': []
        },
        {
            'index': 2,
            'timestamp': '2024-01-15 08:05:23',
            'proof': 533,
            'previous_hash': 'a1b2c3d4e5f678901234567890123456',
            'merkle_root': 'b2c3d4e5f67890123456789012345678',
            'transactions': [
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-001-ABC123',
                    'amount': 150000,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:05:20'
                },
                {
                    'type': 'NFT_MINT',
                    'ticket_id': 'TKT-001-ABC123',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:05:21'
                }
            ]
        },
        {
            'index': 3,
            'timestamp': '2024-01-15 08:12:45',
            'proof': 789,
            'previous_hash': 'b2c3d4e5f67890123456789012345678',
            'merkle_root': 'c3d4e5f6789012345678901234567890',
            'transactions': [
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-002-DEF456',
                    'amount': 200000,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:12:40'
                },
                {
                    'type': 'NFT_MINT',
                    'ticket_id': 'TKT-002-DEF456',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:12:41'
                },
                {
                    'type': 'FACE_VERIFICATION',
                    'ticket_id': 'TKT-001-ABC123',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:12:42'
                }
            ]
        },
        {
            'index': 4,
            'timestamp': '2024-01-15 08:20:15',
            'proof': 1245,
            'previous_hash': 'c3d4e5f6789012345678901234567890',
            'merkle_root': 'd4e5f678901234567890123456789012',
            'transactions': [
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-003-GHI789',
                    'amount': 175000,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:20:10'
                },
                {
                    'type': 'NFT_MINT',
                    'ticket_id': 'TKT-003-GHI789',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:20:11'
                }
            ]
        },
        {
            'index': 5,
            'timestamp': '2024-01-15 08:28:30',
            'proof': 1567,
            'previous_hash': 'd4e5f678901234567890123456789012',
            'merkle_root': 'e5f67890123456789012345678901234',
            'transactions': [
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-004-JKL012',
                    'amount': 120000,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:28:25'
                },
                {
                    'type': 'NFT_MINT',
                    'ticket_id': 'TKT-004-JKL012',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:28:26'
                },
                {
                    'type': 'FACE_VERIFICATION',
                    'ticket_id': 'TKT-002-DEF456',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:28:27'
                }
            ]
        },
        {
            'index': 6,
            'timestamp': '2024-01-15 08:35:42',
            'proof': 1890,
            'previous_hash': 'e5f67890123456789012345678901234',
            'merkle_root': 'f6789012345678901234567890123456',
            'transactions': [
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-005-MNO345',
                    'amount': 250000,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:35:38'
                },
                {
                    'type': 'NFT_MINT',
                    'ticket_id': 'TKT-005-MNO345',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:35:39'
                }
            ]
        },
        {
            'index': 7,
            'timestamp': '2024-01-15 08:42:18',
            'proof': 2123,
            'previous_hash': 'f6789012345678901234567890123456',
            'merkle_root': '78901234567890123456789012345678',
            'transactions': [
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-006-PQR678',
                    'amount': 180000,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:42:15'
                },
                {
                    'type': 'NFT_MINT',
                    'ticket_id': 'TKT-006-PQR678',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:42:16'
                },
                {
                    'type': 'FACE_VERIFICATION',
                    'ticket_id': 'TKT-003-GHI789',
                    'amount': 0,
                    'status': 'CONFIRMED',
                    'timestamp': '2024-01-15 08:42:17'
                }
            ]
        },
        {
            'index': 8,
            'timestamp': '2024-01-15 08:50:05',
            'proof': 2456,
            'previous_hash': '78901234567890123456789012345678',
            'merkle_root': '90123456789012345678901234567890',
            'transactions': [
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-007-STU901',
                    'amount': 220000,
                    'status': 'PENDING',
                    'timestamp': '2024-01-15 08:50:00'
                },
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-008-VWX234',
                    'amount': 190000,
                    'status': 'PENDING',
                    'timestamp': '2024-01-15 08:50:01'
                },
                {
                    'type': 'PAYMENT',
                    'ticket_id': 'TKT-009-YZA567',
                    'amount': 160000,
                    'status': 'PENDING',
                    'timestamp': '2024-01-15 08:50:02'
                }
            ]
        }
    ]
    
    # Performance metrics dummy
    performance_metrics = {
        'cache_hit_rate': 0.87,
        'average_block_size': 2.6,
        'pending_transaction_count': 3,
        'transaction_speed': 2.3,
        'uptime_percentage': 99.95
    }
    
    chain_data = {
        'chain': dummy_chain,
        'performance_metrics': performance_metrics
    }
    
    return render_template('blockchain_explorer.html', 
                         stats=stats,
                         chain_data=chain_data)