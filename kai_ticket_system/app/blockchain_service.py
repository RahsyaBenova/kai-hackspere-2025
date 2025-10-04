import hashlib
import json
import time
import logging
from datetime import datetime

# For standalone Flask app, we'll create a simple database connection
try:
    from app import db
    from app.models import BlockchainTransaction
except ImportError:
    # Fallback for standalone app
    db = None
    BlockchainTransaction = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KAIBlockchain:
    def __init__(self):
        self.chain = []
        self.pending_transactions = []
        self.transaction_cache = {}  # Cache for faster lookups
        self.block_cache = {}  # Cache for block data
        self.create_block(proof=1, previous_hash='0')  # Genesis block
        logger.info("KAI Blockchain initialized with genesis block")
    
    def create_block(self, proof, previous_hash):
        try:
            block_index = len(self.chain) + 1
            timestamp = datetime.now()
            
            block = {
                'index': block_index,
                'timestamp': str(timestamp),
                'proof': proof,
                'previous_hash': previous_hash,
                'transactions': self.pending_transactions.copy(),
                'merkle_root': self.calculate_merkle_root()
            }
            
            # Cache the block for faster access
            self.block_cache[block_index] = block
            
            # Clear pending transactions
            self.pending_transactions = []
            self.chain.append(block)
            
            logger.info(f"Block {block_index} created successfully with {len(block['transactions'])} transactions")
            return block
            
        except Exception as e:
            logger.error(f"Blockchain block creation error: {e}")
            return None
    
    def get_previous_block(self):
        return self.chain[-1] if self.chain else None
    
    def proof_of_work(self, previous_proof):
        new_proof = 1
        check_proof = False
        
        while not check_proof:
            hash_operation = hashlib.sha256(
                str(new_proof**2 - previous_proof**2).encode()
            ).hexdigest()
            
            if hash_operation[:4] == '0000':
                check_proof = True
            else:
                new_proof += 1
        
        return new_proof
    
    def hash(self, block):
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()
    
    def calculate_merkle_root(self):
        if not self.pending_transactions:
            return "0"
        
        transactions = [json.dumps(tx, sort_keys=True) for tx in self.pending_transactions]
        
        while len(transactions) > 1:
            if len(transactions) % 2 != 0:
                transactions.append(transactions[-1])
            
            new_level = []
            for i in range(0, len(transactions), 2):
                combined = transactions[i] + transactions[i + 1]
                new_hash = hashlib.sha256(combined.encode()).hexdigest()
                new_level.append(new_hash)
            
            transactions = new_level
        
        return transactions[0] if transactions else "0"
    
    def add_payment_transaction(self, payment_id, user_id, amount, ticket_id):
        """Add payment transaction to blockchain with enhanced error handling"""
        try:
            # Validate input parameters
            if not all([payment_id, user_id, amount, ticket_id]):
                raise ValueError("Missing required transaction parameters")
            
            if amount <= 0:
                raise ValueError("Amount must be greater than zero")
            
            transaction = {
                'type': 'PAYMENT',
                'payment_id': payment_id,
                'user_id': user_id,
                'ticket_id': ticket_id,
                'amount': amount,
                'status': 'CONFIRMED',
                'timestamp': str(datetime.now()),
                'transaction_id': f"PAY_{payment_id}_{int(time.time())}"
            }
            
            # Add to pending transactions
            self.pending_transactions.append(transaction)
            
            # Cache transaction for faster lookup
            self.transaction_cache[payment_id] = transaction
            
            previous_block = self.get_previous_block()
            if not previous_block:
                raise Exception("No previous block found")
            
            # Create new block with proof of work
            proof = self.proof_of_work(previous_block['proof'])
            previous_hash = self.hash(previous_block)
            block = self.create_block(proof, previous_hash)
            
            if not block:
                raise Exception("Failed to create block")
            
            # Store in database with transaction rollback protection
            try:
                if db and BlockchainTransaction:
                    blockchain_tx = BlockchainTransaction(
                        payment_id=payment_id,
                        ticket_id=ticket_id,
                        transaction_type='PAYMENT',
                        blockchain_tx_hash=self.hash(block),
                        block_number=block['index'],
                        status='confirmed'
                    )
                    db.session.add(blockchain_tx)
                    db.session.commit()
                    
                    logger.info(f"Payment transaction {payment_id} added to blockchain in block {block['index']}")
                else:
                    logger.info(f"Payment transaction {payment_id} added to blockchain in block {block['index']} (no database)")
                
                return {
                    'success': True,
                    'block_index': block['index'],
                    'tx_hash': self.hash(block),
                    'transaction_id': transaction['transaction_id']
                }
                
            except Exception as db_error:
                if db:
                    db.session.rollback()
                logger.error(f"Database error for payment {payment_id}: {db_error}")
                # Continue without database error
                return {
                    'success': True,
                    'block_index': block['index'],
                    'tx_hash': self.hash(block),
                    'transaction_id': transaction['transaction_id']
                }
            
        except Exception as e:
            logger.error(f"Blockchain payment error for {payment_id}: {e}")
            return {'success': False, 'error': str(e)}
    
    def mint_nft_ticket(self, ticket_id, ticket_data):
        """Mint NFT ticket on blockchain"""
        try:
            nft_transaction = {
                'type': 'NFT_MINT',
                'ticket_id': ticket_id,
                'ticket_data': ticket_data,
                'status': 'MINTED',
                'timestamp': str(datetime.now()),
                'nft_metadata': {
                    'name': f'KAI Ticket #{ticket_data["ticket_short_id"]}',
                    'description': f'Ticket for {ticket_data["origin"]} to {ticket_data["destination"]}',
                    'attributes': {
                        'train': ticket_data['train_name'],
                        'class': ticket_data['travel_class'],
                        'seat': ticket_data['seat_number'],
                        'face_verified': ticket_data['face_verified']
                    }
                }
            }
            
            self.pending_transactions.append(nft_transaction)
            
            previous_block = self.get_previous_block()
            if previous_block:
                proof = self.proof_of_work(previous_block['proof'])
                previous_hash = self.hash(previous_block)
                block = self.create_block(proof, previous_hash)
                
                if block:
                    blockchain_tx = BlockchainTransaction(
                        ticket_id=ticket_id,
                        transaction_type='NFT_MINT',
                        blockchain_tx_hash=self.hash(block),
                        block_number=block['index'],
                        status='confirmed'
                    )
                    db.session.add(blockchain_tx)
                    
                    return {
                        'success': True,
                        'block_index': block['index'],
                        'tx_hash': self.hash(block),
                        'nft_token_id': f"KAI_NFT_{ticket_id}",
                        'merkle_root': block['merkle_root']
                    }
            
            return {'success': False, 'error': 'Blockchain operation failed'}
            
        except Exception as e:
            print(f"Blockchain NFT minting error: {e}")
            return {'success': False, 'error': str(e)}
    
    def verify_ticket(self, ticket_id):
        """Verify ticket authenticity on blockchain with caching"""
        try:
            # Check cache first for faster lookup
            if ticket_id in self.transaction_cache:
                cached_tx = self.transaction_cache[ticket_id]
                if cached_tx.get('ticket_id') == ticket_id:
                    return {
                        'verified': True,
                        'cached': True,
                        'transaction_type': cached_tx.get('type'),
                        'timestamp': cached_tx.get('timestamp')
                    }
            
            # Search through blockchain
            for block in self.chain:
                for tx in block.get('transactions', []):
                    if (tx.get('ticket_id') == ticket_id and 
                        tx.get('type') in ['PAYMENT', 'NFT_MINT']):
                        
                        # Cache the result for future lookups
                        self.transaction_cache[ticket_id] = tx
                        
                        return {
                            'verified': True,
                            'block_index': block['index'],
                            'timestamp': block['timestamp'],
                            'transaction_type': tx['type'],
                            'tx_hash': self.hash(block)
                        }
            
            return {'verified': False, 'reason': 'Ticket not found on blockchain'}
            
        except Exception as e:
            logger.error(f"Blockchain verification error for ticket {ticket_id}: {e}")
            return {'verified': False, 'error': str(e)}
    
    def get_chain_data(self):
        """Get blockchain data for display with performance metrics"""
        try:
            total_transactions = sum(len(block.get('transactions', [])) for block in self.chain)
            
            # Calculate performance metrics
            performance_metrics = {
                'cache_hit_rate': len(self.transaction_cache) / max(total_transactions, 1),
                'average_block_size': total_transactions / max(len(self.chain), 1),
                'pending_transaction_count': len(self.pending_transactions)
            }
            
            return {
                'chain_length': len(self.chain),
                'chain': self.chain,
                'pending_transactions': self.pending_transactions,
                'total_transactions': total_transactions,
                'performance_metrics': performance_metrics,
                'cache_size': len(self.transaction_cache)
            }
        except Exception as e:
            logger.error(f"Blockchain data error: {e}")
            return {
                'chain_length': 0, 
                'chain': [], 
                'pending_transactions': [], 
                'total_transactions': 0,
                'performance_metrics': {},
                'cache_size': 0
            }
    
    def get_blockchain_stats(self):
        """Get comprehensive blockchain statistics"""
        try:
            stats = {
                'total_blocks': len(self.chain),
                'total_transactions': 0,
                'payment_transactions': 0,
                'nft_transactions': 0,
                'pending_transactions': len(self.pending_transactions),
                'cache_entries': len(self.transaction_cache),
                'last_block_time': None,
                'average_transactions_per_block': 0
            }
            
            if self.chain:
                stats['last_block_time'] = self.chain[-1].get('timestamp')
                
                for block in self.chain:
                    transactions = block.get('transactions', [])
                    stats['total_transactions'] += len(transactions)
                    
                    for tx in transactions:
                        if tx.get('type') == 'PAYMENT':
                            stats['payment_transactions'] += 1
                        elif tx.get('type') == 'NFT_MINT':
                            stats['nft_transactions'] += 1
                
                stats['average_transactions_per_block'] = stats['total_transactions'] / len(self.chain)
            
            return stats
            
        except Exception as e:
            logger.error(f"Blockchain stats error: {e}")
            return {
                'total_blocks': 0,
                'total_transactions': 0,
                'payment_transactions': 0,
                'nft_transactions': 0,
                'pending_transactions': 0,
                'cache_entries': 0,
                'last_block_time': None,
                'average_transactions_per_block': 0
            }
    
    def clear_cache(self):
        """Clear transaction cache for memory management"""
        try:
            cache_size = len(self.transaction_cache)
            self.transaction_cache.clear()
            logger.info(f"Cleared transaction cache with {cache_size} entries")
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False

# Initialize blockchain instance
kai_blockchain = KAIBlockchain()