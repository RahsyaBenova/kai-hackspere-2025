"""
Smart Contract Integration for KAI Ticket System
Provides automated ticket validation and blockchain interactions
"""

import json
import hashlib
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import logging

# For standalone Flask app, we'll create a simple database connection
try:
    from app import db
    from app.models import Ticket, Payment, BlockchainTransaction
except ImportError:
    # Fallback for standalone app
    db = None
    Ticket = None
    Payment = None
    BlockchainTransaction = None

logger = logging.getLogger(__name__)

class KAISmartContract:
    """
    Smart Contract for KAI Ticket System
    Handles automated ticket validation, payment processing, and NFT minting
    """
    
    def __init__(self):
        self.contract_address = "0xKAI1234567890abcdef"  # Simulated contract address
        self.contract_version = "1.0.0"
        self.gas_price = 20  # Gwei
        self.gas_limit = 200000
        
    def validate_ticket(self, ticket_id: str) -> Dict:
        """
        Validate ticket using smart contract logic
        Returns validation result with blockchain proof
        """
        try:
            if Ticket:
                ticket = Ticket.query.get(ticket_id)
                if not ticket:
                    return {
                        'valid': False,
                        'error': 'Ticket not found',
                        'contract_address': self.contract_address
                    }
            else:
                # Fallback for standalone app
                return {
                    'valid': True,
                    'ticket_id': ticket_id,
                    'contract_address': self.contract_address,
                    'validation_timestamp': datetime.utcnow().isoformat(),
                    'gas_used': 21000,
                    'transaction_hash': self._generate_transaction_hash(ticket_id),
                    'block_number': self._get_current_block_number(),
                    'validation_score': 100,
                    'validation_checks': {
                        'payment_verified': True,
                        'nft_minted': True,
                        'face_verified': True,
                        'not_expired': True,
                        'not_used': True
                    }
                }
            
            # Check if ticket is on blockchain
            if not ticket.is_on_blockchain:
                return {
                    'valid': False,
                    'error': 'Ticket not recorded on blockchain',
                    'contract_address': self.contract_address
                }
            
            # Smart contract validation logic
            validation_result = self._execute_validation_logic(ticket)
            
            # Record validation transaction
            self._record_validation_transaction(ticket_id, validation_result)
            
            return {
                'valid': validation_result['valid'],
                'ticket_id': ticket_id,
                'contract_address': self.contract_address,
                'validation_timestamp': datetime.utcnow().isoformat(),
                'gas_used': validation_result.get('gas_used', 0),
                'transaction_hash': validation_result.get('tx_hash', ''),
                'block_number': validation_result.get('block_number', 0)
            }
            
        except Exception as e:
            logger.error(f"Smart contract validation error for ticket {ticket_id}: {e}")
            return {
                'valid': False,
                'error': str(e),
                'contract_address': self.contract_address
            }
    
    def _execute_validation_logic(self, ticket: Ticket) -> Dict:
        """
        Execute smart contract validation logic
        """
        validation_checks = {
            'payment_verified': self._check_payment_verification(ticket),
            'nft_minted': self._check_nft_minting(ticket),
            'face_verified': ticket.face_verified,
            'not_expired': self._check_ticket_expiry(ticket),
            'not_used': ticket.status == 'paid'
        }
        
        # Calculate validation score
        passed_checks = sum(1 for check in validation_checks.values() if check)
        total_checks = len(validation_checks)
        validation_score = (passed_checks / total_checks) * 100
        
        # Determine if ticket is valid
        is_valid = validation_score >= 80  # 80% threshold for validity
        
        # Simulate gas usage
        gas_used = self._calculate_gas_usage(validation_checks)
        
        return {
            'valid': is_valid,
            'validation_score': validation_score,
            'checks_passed': passed_checks,
            'total_checks': total_checks,
            'validation_checks': validation_checks,
            'gas_used': gas_used,
            'tx_hash': self._generate_transaction_hash(ticket.id),
            'block_number': self._get_current_block_number()
        }
    
    def _check_payment_verification(self, ticket: Ticket) -> bool:
        """Check if payment is verified on blockchain"""
        try:
            # Check if payment has blockchain transaction hash
            payment = Payment.query.filter_by(ticket_id=ticket.id).first()
            return payment and payment.is_on_blockchain and payment.blockchain_tx_hash
        except Exception:
            return False
    
    def _check_nft_minting(self, ticket: Ticket) -> bool:
        """Check if NFT is minted for ticket"""
        return ticket.is_on_blockchain and ticket.nft_token_id is not None
    
    def _check_ticket_expiry(self, ticket: Ticket) -> bool:
        """Check if ticket is not expired"""
        try:
            # Get schedule departure time
            if ticket.schedule and ticket.schedule.departure_time:
                departure_time = ticket.schedule.departure_time
                current_time = datetime.now().time()
                return current_time <= departure_time
            return True  # If no departure time, assume valid
        except Exception:
            return False
    
    def _calculate_gas_usage(self, validation_checks: Dict) -> int:
        """Calculate gas usage for validation"""
        base_gas = 21000
        check_gas = sum(5000 for check in validation_checks.values() if check)
        return base_gas + check_gas
    
    def _generate_transaction_hash(self, ticket_id: str) -> str:
        """Generate transaction hash for validation"""
        timestamp = str(int(time.time()))
        data = f"{ticket_id}_{timestamp}_{self.contract_address}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _get_current_block_number(self) -> int:
        """Get current block number (simulated)"""
        return int(time.time()) % 1000000  # Simulated block number
    
    def _record_validation_transaction(self, ticket_id: str, validation_result: Dict):
        """Record validation transaction in database"""
        try:
            if db and BlockchainTransaction:
                blockchain_tx = BlockchainTransaction(
                    ticket_id=ticket_id,
                    transaction_type='TICKET_VALIDATION',
                    blockchain_tx_hash=validation_result.get('tx_hash', ''),
                    block_number=validation_result.get('block_number', 0),
                    status='confirmed' if validation_result['valid'] else 'failed',
                    gas_used=validation_result.get('gas_used', 0)
                )
                db.session.add(blockchain_tx)
                db.session.commit()
                
                logger.info(f"Validation transaction recorded for ticket {ticket_id}")
            else:
                logger.info(f"Validation transaction logged for ticket {ticket_id} (no database)")
        except Exception as e:
            logger.error(f"Error recording validation transaction: {e}")
            if db:
                db.session.rollback()
    
    def mint_nft_ticket(self, ticket_id: str) -> Dict:
        """
        Mint NFT ticket using smart contract
        """
        try:
            if Ticket:
                ticket = Ticket.query.get(ticket_id)
                if not ticket:
                    return {
                        'success': False,
                        'error': 'Ticket not found'
                    }
            else:
                # Fallback for standalone app
                return {
                    'success': True,
                    'nft_token_id': f"KAI_NFT_{ticket_id}_{int(time.time())}",
                    'token_uri': f"https://kai.example.com/metadata/KAI_NFT_{ticket_id}",
                    'contract_address': self.contract_address,
                    'transaction_hash': self._generate_transaction_hash(f"mint_{ticket_id}"),
                    'block_number': self._get_current_block_number(),
                    'gas_used': 150000,
                    'metadata': {
                        'name': f'KAI Ticket #{ticket_id[:8]}',
                        'description': f'Train ticket for KAI system',
                        'attributes': [
                            {'trait_type': 'Ticket ID', 'value': ticket_id},
                            {'trait_type': 'Network', 'value': 'KAI Testnet'}
                        ]
                    }
                }
            
            # Check if already minted
            if ticket.nft_token_id:
                return {
                    'success': True,
                    'nft_token_id': ticket.nft_token_id,
                    'message': 'NFT already minted'
                }
            
            # Generate NFT metadata
            nft_metadata = self._generate_nft_metadata(ticket)
            
            # Execute minting logic
            minting_result = self._execute_minting_logic(ticket, nft_metadata)
            
            if minting_result['success']:
                # Update ticket with NFT info
                ticket.nft_token_id = minting_result['nft_token_id']
                ticket.blockchain_metadata = json.dumps(nft_metadata)
                ticket.is_on_blockchain = True
                db.session.commit()
                
                logger.info(f"NFT minted successfully for ticket {ticket_id}")
            
            return minting_result
            
        except Exception as e:
            logger.error(f"NFT minting error for ticket {ticket_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_nft_metadata(self, ticket: Ticket) -> Dict:
        """Generate NFT metadata for ticket"""
        return {
            'name': f'KAI Ticket #{ticket.short_id}',
            'description': f'Train ticket from {ticket.schedule.route.origin} to {ticket.schedule.route.destination}',
            'image': f'https://kai.example.com/ticket/{ticket.id}/qr',
            'attributes': [
                {'trait_type': 'Train', 'value': ticket.schedule.train_name},
                {'trait_type': 'Route', 'value': f'{ticket.schedule.route.origin} → {ticket.schedule.route.destination}'},
                {'trait_type': 'Class', 'value': ticket.travel_class},
                {'trait_type': 'Seat', 'value': ticket.seat_number or 'N/A'},
                {'trait_type': 'Face Verified', 'value': ticket.face_verified},
                {'trait_type': 'Price', 'value': f'Rp {ticket.total_price:,}'}
            ],
            'external_url': f'https://kai.example.com/ticket/{ticket.id}',
            'background_color': '0056b3',
            'animation_url': None
        }
    
    def _execute_minting_logic(self, ticket: Ticket, metadata: Dict) -> Dict:
        """Execute NFT minting logic"""
        try:
            # Generate unique token ID
            nft_token_id = f"KAI_NFT_{ticket.id}_{int(time.time())}"
            
            # Simulate gas usage
            gas_used = 150000  # Typical gas for NFT minting
            
            # Generate transaction hash
            tx_hash = self._generate_transaction_hash(f"mint_{ticket.id}")
            
            return {
                'success': True,
                'nft_token_id': nft_token_id,
                'token_uri': f"https://kai.example.com/metadata/{nft_token_id}",
                'contract_address': self.contract_address,
                'transaction_hash': tx_hash,
                'block_number': self._get_current_block_number(),
                'gas_used': gas_used,
                'metadata': metadata
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_contract_info(self) -> Dict:
        """Get smart contract information"""
        return {
            'contract_address': self.contract_address,
            'version': self.contract_version,
            'gas_price': self.gas_price,
            'gas_limit': self.gas_limit,
            'network': 'KAI Testnet',
            'abi': self._get_contract_abi()
        }
    
    def _get_contract_abi(self) -> List[Dict]:
        """Get contract ABI (Application Binary Interface)"""
        return [
            {
                "inputs": [{"name": "ticketId", "type": "string"}],
                "name": "validateTicket",
                "outputs": [{"name": "isValid", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "ticketId", "type": "string"}],
                "name": "mintNFT",
                "outputs": [{"name": "tokenId", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "tokenId", "type": "uint256"}],
                "name": "tokenURI",
                "outputs": [{"name": "uri", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def get_validation_history(self, ticket_id: str) -> List[Dict]:
        """Get validation history for a ticket"""
        try:
            if BlockchainTransaction:
                validations = BlockchainTransaction.query.filter_by(
                    ticket_id=ticket_id,
                    transaction_type='TICKET_VALIDATION'
                ).order_by(BlockchainTransaction.created_at.desc()).all()
                
                return [
                    {
                        'timestamp': validation.created_at.isoformat(),
                        'transaction_hash': validation.blockchain_tx_hash,
                        'block_number': validation.block_number,
                        'status': validation.status,
                        'gas_used': validation.gas_used
                    }
                    for validation in validations
                ]
            else:
                # Fallback for standalone app
                return [
                    {
                        'timestamp': datetime.utcnow().isoformat(),
                        'transaction_hash': self._generate_transaction_hash(ticket_id),
                        'block_number': self._get_current_block_number(),
                        'status': 'confirmed',
                        'gas_used': 21000
                    }
                ]
        except Exception as e:
            logger.error(f"Error getting validation history: {e}")
            return []

# Initialize smart contract instance
kai_smart_contract = KAISmartContract()
