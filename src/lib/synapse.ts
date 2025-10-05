/**
 * Synapse SDK Integration
 * Handles warm storage, proof orchestration, and CDN-backed downloads
 */

import { ethers } from 'ethers';
import { RPC_URL, CHAIN_ID, WARM_STORAGE_ADDRESS } from './config';

// Synapse SDK types (simplified - adjust based on actual SDK)
interface SynapseConfig {
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
}

interface StorageContext {
  preflightUpload: (size: number) => Promise<{ canUpload: boolean; reason?: string }>;
  upload: (file: File, callbacks?: UploadCallbacks) => Promise<UploadResult>;
  download: (pieceCid: string) => Promise<Blob>;
}

interface UploadCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UploadResult {
  pieceCid: string; // CommP
  txHash: string;
  size: number;
  timestamp: number;
}

interface PaymentsAPI {
  deposit: (amount: bigint) => Promise<string>; // Returns tx hash
  approveService: (serviceAddress: string, rateAllowance: bigint, lockupAllowance: bigint, maxLockupPeriod: bigint) => Promise<string>;
  getBalance: () => Promise<{ wallet: bigint; paymentsAccount: bigint }>;
  getAllowance: (serviceAddress: string) => Promise<{ rate: bigint; lockup: bigint; period: bigint }>;
}

/**
 * Initialize Synapse SDK with MetaMask provider
 */
export async function initializeSynapse(): Promise<{
  storage: {
    createStorage: (options: { withCDN: boolean }) => Promise<StorageContext>;
  };
  payments: PaymentsAPI;
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
}> {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask to use this feature.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  // Check if on correct network
  if (Number(network.chainId) !== CHAIN_ID) {
    throw new Error(`Please switch to Filecoin Calibration (Chain ID: ${CHAIN_ID})`);
  }

  const signer = await provider.getSigner();

  // Mock Synapse SDK implementation
  // TODO: Replace with actual @filoz/synapse-sdk when integrated
  const storage = {
    createStorage: async (options: { withCDN: boolean }): Promise<StorageContext> => {
      console.log('Creating storage context with CDN:', options.withCDN);
      
      return {
        preflightUpload: async (size: number) => {
          // Check if user has sufficient allowance
          const allowance = await getStorageAllowance(signer);
          const estimatedCost = BigInt(Math.ceil(size / 1024 / 1024)); // Rough estimate: 1 USDFC per MB
          
          if (allowance.rate < estimatedCost) {
            return {
              canUpload: false,
              reason: `Insufficient allowance. Need ~${estimatedCost} USDFC, have ${allowance.rate}`
            };
          }
          
          return { canUpload: true };
        },
        
        upload: async (file: File, callbacks?: UploadCallbacks): Promise<UploadResult> => {
          console.log('Uploading file:', file.name, file.size);
          
          // Simulate upload progress
          if (callbacks?.onProgress) {
            for (let i = 0; i <= 100; i += 20) {
              await new Promise(resolve => setTimeout(resolve, 200));
              callbacks.onProgress(i);
            }
          }
          
          // Mock result - in real implementation, this would interact with Warm Storage
          const pieceCid = `baga6ea4seaq${Math.random().toString(36).substring(2, 15)}`;
          const result: UploadResult = {
            pieceCid,
            txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            size: file.size,
            timestamp: Date.now()
          };
          
          // Store in localStorage for history
          const history = JSON.parse(localStorage.getItem('upload_history') || '[]');
          history.unshift({ ...result, fileName: file.name });
          localStorage.setItem('upload_history', JSON.stringify(history.slice(0, 10)));
          
          if (callbacks?.onComplete) {
            callbacks.onComplete(result);
          }
          
          return result;
        },
        
        download: async (pieceCid: string): Promise<Blob> => {
          console.log('Downloading pieceCid:', pieceCid);
          
          // Try FilCDN first if available
          const address = await signer.getAddress();
          const cdnUrl = `https://${address}.calibration.filcdn.io/${pieceCid}`;
          
          try {
            const response = await fetch(cdnUrl);
            if (response.ok) {
              return await response.blob();
            }
          } catch (err) {
            console.warn('FilCDN download failed, falling back:', err);
          }
          
          // Fallback to direct retrieval
          // In real implementation, this would use Synapse SDK's download method
          throw new Error('Download not available. File may not be ready yet.');
        }
      };
    }
  };

  const payments: PaymentsAPI = {
    deposit: async (amount: bigint): Promise<string> => {
      console.log('Depositing USDFC:', amount.toString());
      
      // Mock transaction
      // TODO: Implement actual USDFC deposit via Synapse SDK
      const tx = await signer.sendTransaction({
        to: WARM_STORAGE_ADDRESS,
        value: 0,
        data: '0x' // Mock data
      });
      
      await tx.wait();
      return tx.hash;
    },
    
    approveService: async (
      serviceAddress: string,
      rateAllowance: bigint,
      lockupAllowance: bigint,
      maxLockupPeriod: bigint
    ): Promise<string> => {
      console.log('Approving service:', { serviceAddress, rateAllowance, lockupAllowance, maxLockupPeriod });
      
      // Mock transaction
      // TODO: Implement actual approval via Synapse SDK
      const tx = await signer.sendTransaction({
        to: serviceAddress,
        value: 0,
        data: '0x' // Mock data
      });
      
      await tx.wait();
      
      // Store approval locally
      localStorage.setItem('service_approval', JSON.stringify({
        serviceAddress,
        rateAllowance: rateAllowance.toString(),
        lockupAllowance: lockupAllowance.toString(),
        maxLockupPeriod: maxLockupPeriod.toString(),
        timestamp: Date.now()
      }));
      
      return tx.hash;
    },
    
    getBalance: async (): Promise<{ wallet: bigint; paymentsAccount: bigint }> => {
      // Mock balances
      // TODO: Get actual balances from USDFC contract and Synapse payments account
      return {
        wallet: BigInt(100) * BigInt(10 ** 18), // 100 USDFC
        paymentsAccount: BigInt(50) * BigInt(10 ** 18) // 50 USDFC
      };
    },
    
    getAllowance: async (serviceAddress: string) => {
      const stored = localStorage.getItem('service_approval');
      if (stored) {
        const approval = JSON.parse(stored);
        if (approval.serviceAddress === serviceAddress) {
          return {
            rate: BigInt(approval.rateAllowance),
            lockup: BigInt(approval.lockupAllowance),
            period: BigInt(approval.maxLockupPeriod)
          };
        }
      }
      
      return {
        rate: BigInt(0),
        lockup: BigInt(0),
        period: BigInt(0)
      };
    }
  };

  return {
    storage,
    payments,
    provider,
    signer
  };
}

/**
 * Get storage allowance for the connected wallet
 */
async function getStorageAllowance(signer: ethers.Signer): Promise<{ rate: bigint; lockup: bigint }> {
  const stored = localStorage.getItem('service_approval');
  if (stored) {
    const approval = JSON.parse(stored);
    return {
      rate: BigInt(approval.rateAllowance || 0),
      lockup: BigInt(approval.lockupAllowance || 0)
    };
  }
  
  return { rate: BigInt(0), lockup: BigInt(0) };
}

/**
 * Format USDFC amount for display
 */
export function formatUSDFC(amount: bigint): string {
  return (Number(amount) / 10 ** 18).toFixed(4);
}

/**
 * Parse USDFC amount from user input
 */
export function parseUSDFC(amount: string): bigint {
  return BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
}

/**
 * Get FilCDN URL for a piece CID
 */
export function getFilCDNUrl(userAddress: string, pieceCid: string): string {
  return `https://${userAddress}.calibration.filcdn.io/${pieceCid}`;
}

/**
 * Get upload history from localStorage
 */
export function getUploadHistory(): Array<UploadResult & { fileName: string }> {
  const history = localStorage.getItem('upload_history');
  return history ? JSON.parse(history) : [];
}

/**
 * Get retrieval history from localStorage
 */
export function getRetrievalHistory(): Array<{ pieceCid: string; timestamp: number; success: boolean }> {
  const history = localStorage.getItem('retrieval_history');
  return history ? JSON.parse(history) : [];
}

/**
 * Save retrieval to history
 */
export function saveRetrievalHistory(pieceCid: string, success: boolean) {
  const history = getRetrievalHistory();
  history.unshift({ pieceCid, timestamp: Date.now(), success });
  localStorage.setItem('retrieval_history', JSON.stringify(history.slice(0, 5)));
}
