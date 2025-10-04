# 🚄 KAI Intelligent Ticketing Platform

<div align="center">

![Hacksphere 2025](https://img.shields.io/badge/Hacksphere-2025-FF6B6B?style=for-the-badge&logo=hackthebox&logoColor=white)
![Compsphere](https://img.shields.io/badge/Compsphere-Event-4ECDC4?style=for-the-badge&logo=sparkles&logoColor=white)
![Team](https://img.shields.io/badge/Team-Enter%20Your%20Team%20Name-FFD93D?style=for-the-badge&logo=team&logoColor=black)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

### 🏆 Hacksphere 2025 Submission
**"Accelerating Innovation Through Intelligent Technology"**

**AI-Powered Train Ticket Booking System with Blockchain Integration**

Built by **Team: Enter Your Team Name** for Compsphere 2025

[Features](#-key-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Demo](#-demo)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

The **KAI Intelligent Ticketing Platform** is a next-generation train ticket booking and verification system built for Kereta Api Indonesia (Indonesian Railways). Combining cutting-edge AI technology with blockchain security, the platform delivers a seamless, conversational booking experience with transparent transaction tracking.

### Why This Platform?

- 🤖 **AI-Powered**: Natural language processing using Google Gemini for intuitive conversations
- 🔗 **Blockchain-Backed**: Immutable transaction records and NFT tickets
- 🔐 **Biometric Verification**: Face recognition for enhanced security
- 📱 **QR Code System**: Quick and easy ticket validation
- 🎯 **User-Centric**: Intuitive interface designed for all users

---

## 🚀 Key Features

### 1. Conversational AI Assistant
![AI Assistant](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white)

- Natural language train search and booking
- Context-aware responses and suggestions
- Multi-turn conversations with booking state management
- Function-calling capabilities for real-time data

### 2. Blockchain Integration
![Blockchain](https://img.shields.io/badge/Blockchain-Custom%20PoW-orange?style=flat-square&logo=blockchain.com&logoColor=white)

- Proof-of-work consensus mechanism
- Immutable payment transaction records
- NFT ticket minting via smart contracts
- Real-time blockchain explorer and dashboard

### 3. Biometric Verification
![Security](https://img.shields.io/badge/Security-Face%20Recognition-red?style=flat-square&logo=security&logoColor=white)

- Face verification with confidence scoring
- Enhanced ticket validation
- Fraud prevention system

### 4. QR Code Ticketing
![QR](https://img.shields.io/badge/Tickets-QR%20Code-black?style=flat-square&logo=qrcode&logoColor=white)

- Unique QR code per ticket
- Quick conductor verification
- Offline-capable validation

### 5. Secure Payment Processing
![Payment](https://img.shields.io/badge/Payment-Secure-green?style=flat-square&logo=cashapp&logoColor=white)

- Multiple payment methods
- Blockchain-recorded transactions
- Payment confirmation system

---

## 🎥 Demo

### Application Interface

> **Note**: Replace these placeholder links with actual screenshots/videos from your application

```
![Homepage](docs/images/homepage.png)
*Homepage with AI assistant interface*
```

```
![Booking Flow](docs/images/booking-flow.gif)
*Conversational booking experience*
```

```
![Blockchain Dashboard](docs/images/blockchain-dashboard.png)
*Real-time blockchain explorer*
```

### Live Demo Video

```
[![Watch the demo](docs/images/video-thumbnail.png)](https://your-demo-video-link.com)
*Click to watch the full demo video*
```

### Quick Demo Steps

1. **Search Trains**: "I want to travel from Jakarta to Surabaya tomorrow"
2. **Select Train**: AI suggests available options
3. **Book Ticket**: Choose seat and proceed to payment
4. **Get QR Ticket**: Receive blockchain-verified ticket with QR code
5. **Verify**: Conductor scans QR code for validation

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   React Frontend (Vite + TailwindCSS)                 │  │
│  │   - AI Chat Interface                                 │  │
│  │   - Booking Components                                │  │
│  │   - QR Code Generation                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Flask Backend (Application Factory Pattern)        │  │
│  │   - Authentication (Flask-Login)                     │  │
│  │   - Business Logic                                   │  │
│  │   - Payment Processing                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  Data Layer      │ │  AI Layer    │ │ Blockchain Layer │
│                  │ │              │ │                  │
│  SQLite + ORM    │ │ Google       │ │ Custom PoW       │
│  - Users         │ │ Gemini API   │ │ - Transactions   │
│  - Tickets       │ │              │ │ - Smart Contract │
│  - Routes        │ │ Function     │ │ - NFT Minting    │
│  - Payments      │ │ Calling      │ │                  │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

---

## 💻 Technology Stack

### Frontend
![React](https://img.shields.io/badge/React-18.3.1-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.14-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide%20Icons-latest-F56565?style=for-the-badge&logo=lucide&logoColor=white)

### Backend
![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Flask-Login](https://img.shields.io/badge/Flask--Login-Auth-4B8BBE?style=for-the-badge)

### AI & Blockchain
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Blockchain](https://img.shields.io/badge/Custom-Blockchain-orange?style=for-the-badge&logo=hyperledger&logoColor=white)
![Smart Contracts](https://img.shields.io/badge/Smart-Contracts-purple?style=for-the-badge)

### Development Tools
![ESLint](https://img.shields.io/badge/ESLint-Code%20Quality-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Git](https://img.shields.io/badge/Git-Version%20Control-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))
- **Git**

### Step 1: Clone Repository

```bash
git clone https://github.com/your-team/kai-hackathon-2025.git
cd kai-hackathon-2025
```

### Step 2: Frontend Setup

```bash
cd kai-assistant-app

# Install dependencies
npm install

# Add your Gemini API key 

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Step 3: Backend Setup

```bash
cd kai_ticket_system

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
flask db upgrade

# Run the application
flask run
```

The backend will be available at `http://localhost:5000`

### Step 4: Environment Configuration

Create a `config.py` file in `kai_ticket_system/`:

```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///kai_tickets.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Mail configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
```

---

## 🎯 Usage

### For Users

1. **Access the Platform**: Open your browser and navigate to `http://localhost:5173`
2. **Chat with AI**: Type your travel request in natural language
   ```
   "I need a train from Jakarta to Bandung on December 25th"
   ```
3. **Select Train**: Browse available trains and choose your preferred option
4. **Book Ticket**: Follow the conversational flow to complete booking
5. **Make Payment**: Choose payment method and complete transaction
6. **Receive Ticket**: Get your blockchain-verified ticket with QR code

### For Conductors

1. **Access Conductor Interface**: Navigate to the conductor portal
2. **Scan QR Code**: Use the scanner to verify passenger tickets
3. **Check Verification**: System automatically validates ticket authenticity
4. **Confirm Boarding**: Mark ticket as used after validation

### For Administrators

1. **Admin Dashboard**: Access at `/admin`
2. **Monitor Bookings**: View all ticket transactions
3. **Blockchain Explorer**: Check transaction history at `/blockchain/explorer`
4. **User Management**: Manage user accounts and permissions

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| GET | `/auth/logout` | User logout |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trains/search` | Search available trains |
| POST | `/api/booking/create` | Create new booking |
| GET | `/api/booking/<id>` | Get booking details |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/process_payment` | Process payment |
| GET | `/api/payment/status/<id>` | Check payment status |

### Blockchain Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blockchain/stats` | Get blockchain statistics |
| GET | `/blockchain/explorer` | View blockchain explorer |
| POST | `/api/smart-contract/validate/<ticket_id>` | Validate ticket |
| POST | `/api/smart-contract/mint-nft/<ticket_id>` | Mint NFT ticket |

### Verification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verify_face` | Submit face verification |
| GET | `/verification` | Verification page |

For complete API documentation, see [API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 📁 Project Structure

```
kai-hackathon-2025/
├── kai-assistant-app/          # Frontend React application
│   ├── src/
│   │   ├── main.jsx           # Application entry point
│   │   ├── KAIIntelligentPlatform copy.jsx  # AI assistant
│   │   ├── chatkondektur.jsx  # Conductor interface
│   │   └── components/        # React components
│   ├── public/                # Static assets
│   ├── package.json           # Dependencies
│   └── vite.config.js         # Vite configuration
│
├── kai_ticket_system/         # Backend Flask application
│   ├── app/
│   │   ├── __init__.py       # Application factory
│   │   ├── models.py         # Database models
│   │   ├── routes.py         # API routes
│   │   ├── blockchain_service.py  # Blockchain logic
│   │   ├── payment_service.py     # Payment processing
│   │   └── kai_smart_contract.py  # Smart contracts
│   ├── migrations/           # Database migrations
│   ├── config.py            # Configuration
│   └── requirements.txt     # Python dependencies
│
├── docs/                    # Documentation
│   ├── images/             # Screenshots and diagrams
│   ├── FRONTEND.md         # Frontend documentation
│   ├── BACKEND.md          # Backend documentation
│   └── API_REFERENCE.md    # API documentation
│
├── README.md               # This file
└── LICENSE                 # License file
```

---


## 👥 Team

<div align="center">

| Role | Name | GitHub |
|------|------|--------|
| 🎯 Project Lead | Rahsya Benova Akbar | [@RahsyaBenova](https://github.com/RahsyaBenova) |
| 💻 Fullstack Dev | Muhammad Ghiffari | [@muhammadghiffari](https://github.com/muhammadghiffari) |
| 🔗 Blockchain & Security Dev | Crishabel Wijaya | [@cristchaw](https://github.com/cristchaw) |


</div>

---

## 📄 License

This project is open for future developing together.

---

## 🙏 Acknowledgments

- **Kereta Api Indonesia (KAI)** for organizing the hackathon
- **Google** for Gemini API access
- **Open Source Community** for amazing libraries and tools

---

## 📞 Contact & Support

- **Email**: rahsya.akbar@student.president.ac.id
- **Email**: muhammmad.ghiffari@student.president.ac.id
- **Email**: crishabel.wijaya@student.president.ac.id
- **Documentation**: [Full Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-team/kai-hacksphere-2025/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-team/kai-hacksphere-2025/discussions)

---

<div align="center">

**Made with 🐈 for KAI Hackathon 2025**

[![Star this repo](https://img.shields.io/github/stars/RahsyaBenova/kai-hacksphere-2025?style=social)](https://github.com/RahsyaBenova/kai-hacksphere-2025)
[![Follow us](https://img.shields.io/github/followers/RahsyaBenova?style=social)](https://github.com/RahsyaBenova)
[![Follow us](https://img.shields.io/github/followers/cristchaw?style=social)](https://github.com/cristchaw)
[![Follow us](https://img.shields.io/github/followers/muhammadghiffari?style=social)](https://github.com/muhammadghiffari)

</div>
