/**
 * Blockchain Integration Utility
 * 
 * This utility simulates blockchain interactions for complaint recording and verification.
 * In a real implementation, this would be replaced with actual blockchain integration using
 * web3.js, ethers.js, or similar libraries interfacing with a blockchain network.
 */

/**
 * Records a complaint on the blockchain
 * @param {Object} complaintData - Complaint data to record
 * @returns {Object} - Mock transaction data
 */
exports.recordComplaint = async (complaintData) => {
  // Simulate blockchain transaction time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock transaction hash
  const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  
  // Mock transaction data
  return {
    transactionHash,
    blockNumber: Math.floor(Math.random() * 1000000) + 9000000,
    timestamp: Date.now(),
    gasUsed: Math.floor(Math.random() * 1000000) + 100000,
    status: 'confirmed',
  };
};

/**
 * Records a status change on the blockchain
 * @param {String} complaintId - Complaint ID
 * @param {String} status - New status
 * @param {String} updatedBy - User ID who updated the status
 * @returns {Object} - Mock transaction data
 */
exports.recordStatusChange = async (complaintId, status, updatedBy) => {
  // Simulate blockchain transaction time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock transaction hash
  const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  
  // Mock transaction data
  return {
    transactionHash,
    blockNumber: Math.floor(Math.random() * 1000000) + 9000000,
    timestamp: Date.now(),
    gasUsed: Math.floor(Math.random() * 500000) + 50000,
    status: 'confirmed',
  };
};

/**
 * Verifies a complaint's authenticity on the blockchain
 * @param {String} transactionHash - Transaction hash to verify
 * @returns {Object} - Verification result
 */
exports.verifyComplaint = async (transactionHash) => {
  // Simulate verification process
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock verification data
  return {
    verified: true,
    timestamp: Date.now() - Math.floor(Math.random() * 10000000),
    blockExplorerUrl: `https://explorer.example.com/tx/${transactionHash}`,
  };
};

/**
 * Gets the list of transactions for a complaint
 * @param {String} complaintId - Complaint ID
 * @returns {Array} - List of mock transactions
 */
exports.getTransactionHistory = async (complaintId) => {
  // Simulate retrieval time
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Generate 1-5 mock transactions
  const transactionCount = Math.floor(Math.random() * 4) + 1;
  const transactions = [];
  
  // Creation transaction
  transactions.push({
    type: 'creation',
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: Date.now() - Math.floor(Math.random() * 10000000),
    blockNumber: Math.floor(Math.random() * 1000000) + 9000000,
  });
  
  // Add status updates
  for (let i = 0; i < transactionCount; i++) {
    transactions.push({
      type: 'status_update',
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: Date.now() - Math.floor(Math.random() * 5000000),
      blockNumber: Math.floor(Math.random() * 1000000) + 9000000,
    });
  }
  
  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}; 