# app/blockchain_service.py
import hashlib
import json
import time
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KAIBlockchain:
    def __init__(self):
        logger.info("Initializing KAI Blockchain...")
        self.chain = []
        self.pending_transactions = []
        self.create_block(proof=1, previous_hash='0')
        logger.info("KAI Blockchain initialized with genesis block")

    def create_block(self, proof, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': str(datetime.now()),
            'proof': proof,
            'previous_hash': previous_hash,
            'transactions': self.pending_transactions.copy()
        }
        self.pending_transactions = []
        self.chain.append(block)
        logger.info(f"Block {block['index']} created successfully with {len(block['transactions'])} transactions")
        return block

    def get_previous_block(self):
        return self.chain[-1] if self.chain else None

    def proof_of_work(self, previous_proof):
        new_proof = 1
        while not self.valid_proof(new_proof, previous_proof):
            new_proof += 1
        return new_proof

    def valid_proof(self, new_proof, previous_proof):
        guess = f'{new_proof**2 - previous_proof**2}'.encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"

    def hash(self, block):
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()

    def add_payment_transaction(self, payment_id, user_id, amount, ticket_id):
        """Simple payment transaction untuk testing"""
        try:
            transaction = {
                'type': 'PAYMENT',
                'payment_id': payment_id,
                'user_id': user_id,
                'ticket_id': ticket_id,
                'amount': amount,
                'status': 'CONFIRMED',
                'timestamp': str(datetime.now())
            }
            
            self.pending_transactions.append(transaction)
            
            # Mine block immediately
            previous_block = self.get_previous_block()
            proof = self.proof_of_work(previous_block['proof'])
            previous_hash = self.hash(previous_block)
            block = self.create_block(proof, previous_hash)
            
            return {
                'success': True,
                'block_index': block['index'],
                'tx_hash': self.hash(block)
            }
        except Exception as e:
            logger.error(f"Payment transaction error: {e}")
            return {'success': False, 'error': str(e)}

    def mint_nft_ticket(self, ticket_id, ticket_data):
        """Mint NFT ticket - simplified version"""
        try:
            nft_transaction = {
                'type': 'NFT_MINT',
                'ticket_id': ticket_id,
                'ticket_data': ticket_data,
                'status': 'MINTED',
                'timestamp': str(datetime.now()),
                'nft_token_id': f"KAI_NFT_{ticket_id}"
            }
            
            self.pending_transactions.append(nft_transaction)
            
            # Mine block immediately
            previous_block = self.get_previous_block()
            proof = self.proof_of_work(previous_block['proof'])
            previous_hash = self.hash(previous_block)
            block = self.create_block(proof, previous_hash)
            
            return {
                'success': True,
                'block_index': block['index'],
                'tx_hash': self.hash(block),
                'nft_token_id': f"KAI_NFT_{ticket_id}"
            }
        except Exception as e:
            logger.error(f"NFT minting error: {e}")
            return {'success': False, 'error': str(e)}

    def verify_ticket(self, ticket_id):
        """Verify ticket on blockchain"""
        try:
            for block in self.chain:
                for tx in block.get('transactions', []):
                    if tx.get('ticket_id') == ticket_id:
                        return {
                            'verified': True,
                            'block_index': block['index'],
                            'timestamp': block['timestamp'],
                            'transaction_type': tx.get('type', 'UNKNOWN')
                        }
            return {'verified': False}
        except Exception as e:
            logger.error(f"Verification error: {e}")
            return {'verified': False}

    def get_chain_data(self):
        """Get blockchain data untuk dashboard"""
        return {
            'chain_length': len(self.chain),
            'chain': self.chain,
            'pending_transactions': self.pending_transactions,
            'total_transactions': sum(len(block.get('transactions', [])) for block in self.chain)
        }

    def get_blockchain_stats(self):
        """Get statistics untuk dashboard"""
        chain_data = self.get_chain_data()
        
        payment_count = 0
        nft_count = 0
        verification_count = 0
        
        for block in chain_data['chain']:
            for tx in block.get('transactions', []):
                if tx.get('type') == 'PAYMENT':
                    payment_count += 1
                elif tx.get('type') == 'NFT_MINT':
                    nft_count += 1
                elif tx.get('type') == 'FACE_VERIFICATION':
                    verification_count += 1
        
        return {
            'total_blocks': chain_data['chain_length'],
            'total_transactions': chain_data['total_transactions'],
            'payment_transactions': payment_count,
            'nft_transactions': nft_count,
            'verification_transactions': verification_count,
            'pending_transactions': len(chain_data['pending_transactions'])
        }

# Initialize blockchain instance
kai_blockchain = KAIBlockchain()