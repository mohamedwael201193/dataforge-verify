import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { FILECOIN_CONFIG, getContract } from '@/lib/contract';
import toast from 'react-hot-toast';

interface WalletContextType {
  account: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signer: ethers.Signer | null;
  provider: ethers.BrowserProvider | null;
  contract: ethers.Contract | null;
  switchToFilecoin: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const switchToFilecoin = async (): Promise<boolean> => {
    if (!window.ethereum) return false;

    try {
      // Try to switch to Filecoin Calibration network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${FILECOIN_CONFIG.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${FILECOIN_CONFIG.chainId.toString(16)}`,
                chainName: FILECOIN_CONFIG.name,
                nativeCurrency: {
                  name: FILECOIN_CONFIG.symbol,
                  symbol: FILECOIN_CONFIG.symbol,
                  decimals: 18,
                },
                rpcUrls: [FILECOIN_CONFIG.rpcUrl],
                blockExplorerUrls: [FILECOIN_CONFIG.blockExplorer],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          toast.error('Failed to add Filecoin network to MetaMask');
          return false;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        toast.error('Failed to switch to Filecoin network');
        return false;
      }
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected. Please install MetaMask.');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check and switch to Filecoin network
      const networkSwitched = await switchToFilecoin();
      if (!networkSwitched) {
        setIsConnecting(false);
        return;
      }

      // Create provider and signer
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();
      const ethContract = getContract(ethSigner);

      setProvider(ethProvider);
      setSigner(ethSigner);
      setContract(ethContract);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Get balance
      const bal = await ethProvider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(bal));

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance('0');
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setContract(null);
    toast.success('Wallet disconnected');
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          // Update balance for new account
          if (provider) {
            provider.getBalance(accounts[0]).then(bal => {
              setBalance(ethers.formatEther(bal));
            });
          }
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes for simplicity
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, provider]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts.length > 0) {
            const ethProvider = new ethers.BrowserProvider(window.ethereum);
            const chainId = await ethProvider.getNetwork();
            
            // Only auto-connect if on Filecoin network
            if (chainId.chainId === BigInt(FILECOIN_CONFIG.chainId)) {
              const ethSigner = await ethProvider.getSigner();
              const ethContract = getContract(ethSigner);
              
              setProvider(ethProvider);
              setSigner(ethSigner);
              setContract(ethContract);
              setAccount(accounts[0]);
              setIsConnected(true);
              
              const bal = await ethProvider.getBalance(accounts[0]);
              setBalance(ethers.formatEther(bal));
            }
          }
        } catch (error) {
          console.error('Failed to check connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const value: WalletContextType = {
    account,
    balance,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    signer,
    provider,
    contract,
    switchToFilecoin,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}