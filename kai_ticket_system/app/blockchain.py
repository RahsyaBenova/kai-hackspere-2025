import hashlib
import json
import time
from datetime import datetime

class Blockchain:
    def __init__(self):
        self.chain = []
        self.pending_transactions = []
        self.create_block(proof=1, previous_hash='0')  # Genesis block
    
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
        return block
    
    def get_previous_block(self):
        return self.chain[-1]
    
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
    
    def is_chain_valid(self, chain):
        previous_block = chain[0]
        block_index = 1
        
        while block_index < len(chain):
            block = chain[block_index]
            
            # Check previous hash
            if block['previous_hash'] != self.hash(previous_block):
                return False
            
            # Check proof of work
            previous_proof = previous_block['proof']
            proof = block['proof']
            hash_operation = hashlib.sha256(
                str(proof**2 - previous_proof**2).encode()
            ).hexdigest()
            
            if hash_operation[:4] != '0000':
                return False
            
            previous_block = block
            block_index += 1
        
        return True
    
    def add_transaction(self, ticket_id, user_id, amount, status):
        """Add payment transaction to pending transactions"""
        transaction = {
            'ticket_id': ticket_id,
            'user_id': user_id,
            'amount': amount,
            'status': status,
            'timestamp': str(datetime.now())
        }
        
        self.pending_transactions.append(transaction)
        return self.get_previous_block()['index'] + 1
    
    def create_nft_ticket(self, ticket_id, user_id, journey_info):
        """Create NFT-like digital ticket on blockchain"""
        nft_data = {
            'ticket_id': ticket_id,
            'user_id': user_id,
            'journey_info': journey_info,
            'created_at': str(datetime.now()),
            'type': 'NFT_TICKET'
        }
        
        self.pending_transactions.append(nft_data)
        
        # Mine the block immediately for NFT
        previous_block = self.get_previous_block()
        proof = self.proof_of_work(previous_block['proof'])
        previous_hash = self.hash(previous_block)
        block = self.create_block(proof, previous_hash)
        
        return block

# Initialize blockchain
blockchain = Blockchain()