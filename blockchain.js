const Web3 = require('web3');
const contract = require('../blockchain/contract');

const web3 = new Web3(process.env.ETHEREUM_PROVIDER_URL);

// Contract instance
const medicalDataContract = new web3.eth.Contract(
  contract.ABI,
  contract.ADDRESS
);

// Private key for transaction signing
const PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

/**
 * Store data hash on blockchain
 * @param {string} publicId - Public ID of the medical profile
 * @param {string} dataHash - SHA256 hash of the medical data
 * @returns {Promise<string>} Transaction hash
 */
exports.storeDataOnBlockchain = async (publicId, dataHash) => {
  try {
    // Prepare transaction
    const tx = medicalDataContract.methods.storeDataHash(publicId, dataHash);
    
    // Estimate gas
    const gas = await tx.estimateGas({ from: account.address });
    
    // Send transaction
    const receipt = await tx.send({
      from: account.address,
      gas,
      gasPrice: web3.utils.toWei('20', 'gwei') // Adjust gas price as needed
    });
    
    return receipt.transactionHash;
  } catch (err) {
    console.error('Blockchain storage error:', err);
    throw new Error('Failed to store data on blockchain');
  }
};

/**
 * Verify data hash on blockchain
 * @param {string} publicId - Public ID of the medical profile
 * @param {string} dataHash - SHA256 hash of the medical data
 * @param {string} txHash - Transaction hash of the stored data
 * @returns {Promise<boolean>} Whether data is verified
 */
exports.verifyDataOnBlockchain = async (publicId, dataHash, txHash) => {
  try {
    // Get stored hash from blockchain
    const storedHash = await medicalDataContract.methods.getDataHash(publicId).call();
    
    // Verify hash matches
    return storedHash === dataHash;
  } catch (err) {
    console.error('Blockchain verification error:', err);
    return false;
  }
};