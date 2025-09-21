import { ethers } from 'ethers';

// Filecoin Calibration Testnet Configuration
export const FILECOIN_CONFIG = {
  chainId: 3141592,
  rpcUrl: process.env.REACT_APP_RPC_URL || 'https://calibration.filfox.info/rpc/v1',
  symbol: 'tFIL',
  name: 'Filecoin Calibration Testnet',
  blockExplorer: 'https://calibration.filscan.io'
};

export const CONTRACT_ADDRESS = '0x569C43c4Cb8e332037Bc02ae997177F35cd8a017';

// Full ABI for DataForge Hub contract
export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "string", "name": "_cid", "type": "string"},
      {"internalType": "uint256", "name": "_price", "type": "uint256"},
      {"internalType": "bool", "name": "_isVerified", "type": "bool"}
    ],
    "name": "registerDataset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "processPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
    "name": "getDataset",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "cid", "type": "string"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "bool", "name": "isVerified", "type": "bool"}
        ],
        "internalType": "struct DatasetRegistry.Dataset",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "cid", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "isVerified", "type": "bool"}
    ],
    "name": "DatasetRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "PaymentProcessed",
    "type": "event"
  }
];

export interface Dataset {
  id: number;
  name: string;
  description: string;
  cid: string;
  price: number;
  isVerified: boolean;
  owner?: string;
}

// Mock datasets for development
export const MOCK_DATASETS: Dataset[] = [
  {
    id: 1,
    name: "Cultural Diversity ImageNet",
    description: "Curated image dataset with balanced representation across cultures, verified through PDP proofs",
    cid: "bafybeihkoviema7g3gxyt6la7b7kbbdvguvzd4mrvm4gggqwdgxo2ckgju",
    price: 10,
    isVerified: true
  },
  {
    id: 2,
    name: "Synthetic Speech Corpus",
    description: "Multi-language speech synthesis training data with bias auditing reports",
    cid: "bafybeidyz7vgfnhxnqg5g3ujtzotadrr2m75s2wuqbojjjwgglozj3f6hi",
    price: 25,
    isVerified: true
  },
  {
    id: 3,
    name: "DePIN Network Telemetry",
    description: "Real-world IoT sensor data from distributed physical infrastructure",
    cid: "bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354",
    price: 50,
    isVerified: false
  },
  {
    id: 4,
    name: "Climate Model Training Set",
    description: "Satellite imagery and weather data for climate prediction models",
    cid: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzgevtenxquvyku",
    price: 75,
    isVerified: true
  },
  {
    id: 5,
    name: "Medical Imaging Commons",
    description: "Anonymized medical scans with privacy-preserving verification",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    price: 100,
    isVerified: true
  }
];

// Utility functions
export const getProvider = () => {
  return new ethers.JsonRpcProvider(FILECOIN_CONFIG.rpcUrl);
};

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

export const formatPrice = (price: number) => {
  return `${price} USDFC`;
};

export const truncateAddress = (address: string, chars = 6) => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const generateMockPDPData = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() > 0.05 ? 1 : 0, // 95% success rate
      success: Math.random() > 0.05
    });
  }
  
  return data;
};

export const generateMockBiasData = () => {
  return [
    { name: 'Balanced Demographics', value: 60, color: '#10B981' },
    { name: 'Geographic Distribution', value: 25, color: '#3B82F6' },
    { name: 'Temporal Coverage', value: 10, color: '#8B5CF6' },
    { name: 'Edge Cases', value: 5, color: '#F59E0B' }
  ];
};