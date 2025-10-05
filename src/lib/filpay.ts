/**
 * Filecoin Pay Integration
 * Handles USDFC streaming payment rails
 */

import { ethers } from 'ethers';
import { FILPAY_ADDRESS } from './config';

// Filecoin Pay ABI (simplified - essential functions only)
const FILPAY_ABI = [
  'function ensureAccount() external',
  'function getBalance(address account) external view returns (uint256 locked, uint256 available, uint256 obligations)',
  'function createOrUpdateRail(address payer, address payee, uint256 maxRate, uint256 lockupPeriod, address validator) external returns (bytes32 railId)',
  'function settle(bytes32 railId) external',
  'function terminate(bytes32 railId) external',
  'function getRailInfo(bytes32 railId) external view returns (address payer, address payee, uint256 maxRate, uint256 lockupPeriod, address validator, uint256 lastSettlementEpoch)',
  'event RailCreated(bytes32 indexed railId, address indexed payer, address indexed payee)',
  'event RailSettled(bytes32 indexed railId, uint256 amount, uint256 epoch)',
  'event RailTerminated(bytes32 indexed railId)'
];

export interface RailConfig {
  payer: string;
  payee: string;
  maxRate: bigint; // USDFC per epoch
  lockupPeriod: bigint; // Seconds
  validator?: string; // Optional validator address
}

export interface RailInfo {
  payer: string;
  payee: string;
  maxRate: bigint;
  lockupPeriod: bigint;
  validator: string;
  lastSettlementEpoch: bigint;
}

export interface AccountBalance {
  locked: bigint;
  available: bigint;
  obligations: bigint;
}

/**
 * Get Filecoin Pay contract instance
 */
export function getFilPayContract(signerOrProvider: ethers.Signer | ethers.Provider): ethers.Contract {
  return new ethers.Contract(FILPAY_ADDRESS, FILPAY_ABI, signerOrProvider);
}

/**
 * Ensure account exists in Filecoin Pay
 */
export async function ensureAccount(signer: ethers.Signer): Promise<string> {
  const contract = getFilPayContract(signer);
  
  try {
    const tx = await contract.ensureAccount();
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error ensuring account:', error);
    throw error;
  }
}

/**
 * Get account balances
 */
export async function getBalances(
  provider: ethers.Provider,
  account: string
): Promise<AccountBalance> {
  const contract = getFilPayContract(provider);
  
  try {
    const result = await contract.getBalance(account);
    return {
      locked: result.locked,
      available: result.available,
      obligations: result.obligations
    };
  } catch (error) {
    console.error('Error getting balances:', error);
    return {
      locked: BigInt(0),
      available: BigInt(0),
      obligations: BigInt(0)
    };
  }
}

/**
 * Create or update a payment rail
 */
export async function createOrUpdateRail(
  signer: ethers.Signer,
  config: RailConfig
): Promise<{ railId: string; txHash: string }> {
  const contract = getFilPayContract(signer);
  
  try {
    const tx = await contract.createOrUpdateRail(
      config.payer,
      config.payee,
      config.maxRate,
      config.lockupPeriod,
      config.validator || ethers.ZeroAddress
    );
    
    const receipt = await tx.wait();
    
    // Parse event to get railId
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'RailCreated';
      } catch {
        return false;
      }
    });
    
    let railId = '';
    if (event) {
      const parsed = contract.interface.parseLog(event);
      railId = parsed?.args.railId || '';
    }
    
    // Store rail in localStorage for quick access
    const rails = JSON.parse(localStorage.getItem('payment_rails') || '[]');
    rails.push({
      railId,
      ...config,
      maxRate: config.maxRate.toString(),
      lockupPeriod: config.lockupPeriod.toString(),
      createdAt: Date.now(),
      txHash: tx.hash
    });
    localStorage.setItem('payment_rails', JSON.stringify(rails));
    
    return {
      railId,
      txHash: tx.hash
    };
  } catch (error) {
    console.error('Error creating rail:', error);
    throw error;
  }
}

/**
 * Settle a payment rail
 */
export async function settle(signer: ethers.Signer, railId: string): Promise<string> {
  const contract = getFilPayContract(signer);
  
  try {
    const tx = await contract.settle(railId);
    await tx.wait();
    
    // Update settlement history
    const history = JSON.parse(localStorage.getItem('settlement_history') || '[]');
    history.unshift({
      railId,
      timestamp: Date.now(),
      txHash: tx.hash
    });
    localStorage.setItem('settlement_history', JSON.stringify(history.slice(0, 10)));
    
    return tx.hash;
  } catch (error) {
    console.error('Error settling rail:', error);
    throw error;
  }
}

/**
 * Terminate a payment rail
 */
export async function terminate(signer: ethers.Signer, railId: string): Promise<string> {
  const contract = getFilPayContract(signer);
  
  try {
    const tx = await contract.terminate(railId);
    await tx.wait();
    
    // Remove from active rails
    const rails = JSON.parse(localStorage.getItem('payment_rails') || '[]');
    const updated = rails.filter((r: any) => r.railId !== railId);
    localStorage.setItem('payment_rails', JSON.stringify(updated));
    
    return tx.hash;
  } catch (error) {
    console.error('Error terminating rail:', error);
    throw error;
  }
}

/**
 * Get rail information
 */
export async function getRailInfo(
  provider: ethers.Provider,
  railId: string
): Promise<RailInfo | null> {
  const contract = getFilPayContract(provider);
  
  try {
    const result = await contract.getRailInfo(railId);
    return {
      payer: result.payer,
      payee: result.payee,
      maxRate: result.maxRate,
      lockupPeriod: result.lockupPeriod,
      validator: result.validator,
      lastSettlementEpoch: result.lastSettlementEpoch
    };
  } catch (error) {
    console.error('Error getting rail info:', error);
    return null;
  }
}

/**
 * Get active payment rails from localStorage
 */
export function getActiveRails(): Array<any> {
  const rails = localStorage.getItem('payment_rails');
  return rails ? JSON.parse(rails) : [];
}

/**
 * Get settlement history from localStorage
 */
export function getSettlementHistory(): Array<{ railId: string; timestamp: number; txHash: string }> {
  const history = localStorage.getItem('settlement_history');
  return history ? JSON.parse(history) : [];
}

/**
 * Format rate for display (USDFC per epoch)
 */
export function formatRate(rate: bigint): string {
  return (Number(rate) / 10 ** 18).toFixed(6);
}

/**
 * Calculate expected payment for a duration
 */
export function calculateExpectedPayment(maxRate: bigint, durationSeconds: bigint, epochLength: bigint = BigInt(30)): bigint {
  const epochs = durationSeconds / epochLength;
  return maxRate * epochs;
}
