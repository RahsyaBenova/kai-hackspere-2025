from flask import Flask 
from flask_sqlalchemy import SQLAlchemy 
from flask_login import LoginManager 
from flask_mail import Mail 
from flask_migrate import Migrate

db = SQLAlchemy() 
login_manager = LoginManager() 
mail = Mail() 
migrate = Migrate() 

def create_app(): 
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)

    # Login manager configuration 
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Silahkan login untuk mengakses halaman ini.'

    # Register blueprints 
    from app.routes import main_bp, auth_bp, admin_bp, payment_bp 
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(payment_bp)

    return app