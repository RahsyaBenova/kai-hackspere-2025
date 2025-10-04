import os 
from datetime import timedelta 

class Config: 
    SECRET_KEY = os.environ.get('SECRET KEY') or 'kai-secret-key-2025-prod'

    # Database config 
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'instance', 'kai_tickets.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False 

    PERMANENT_SESSION_LIFETIME = timedelta(days=1)

    MIDTRANS_SERVER_KEY = os.environ.get('MIDTRANS_SERVER_KEY') or 'SB-Mid-server-your-key here'
    MIDTRANS_CLIENT_KEY = os.environ.get('MIDTRANS_CLIENT_KEY') or 'SB-Mid-client-your-key here'
    MIDTRANS_IS_PRODUCTION = False 

    # Email config 
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gamil.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = True 
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'your-email!gmail.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'your-app-password'

    #Admin Config 
    ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME') or 'admin'
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'admin123'
