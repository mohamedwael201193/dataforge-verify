/**
 * Filecoin Onchain Cloud Configuration
 * All environment variables for Synapse SDK, Filecoin Pay, and FilCDN
 */

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID) || 314159;
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://calibration.filfox.info/rpc/v1';
export const NETWORK = import.meta.env.VITE_NETWORK || 'calibration';

// Token and Service Addresses (Calibration Testnet)
export const USDFC_ADDRESS = import.meta.env.VITE_USDFC_ADDRESS || '0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0';
export const WARM_STORAGE_ADDRESS = import.meta.env.VITE_WARM_STORAGE_ADDRESS || '0xf49ba5eaCdFD5EE3744efEdf413791935FE4D4c5';
export const FILPAY_ADDRESS = import.meta.env.VITE_FILPAY_ADDRESS || '0x0E690D3e60B0576D01352AB03b258115eb84A047';
export const PDP_VERIFIER_PROXY = import.meta.env.VITE_PDP_VERIFIER_PROXY || '0x445238Eca6c6aB8Dff1Aa6087d9c05734D22f137';

// Provider and Validator (Optional)
export const PROVIDER_ADDRESS = import.meta.env.VITE_PROVIDER_ADDRESS || '';
export const VALIDATOR_ADDRESS = import.meta.env.VITE_VALIDATOR_ADDRESS || '';

// Optional Services
export const SUBGRAPH_ENDPOINT = import.meta.env.VITE_SUBGRAPH_ENDPOINT || '';
export const GLIF_AUTH = import.meta.env.GLIF_AUTH || ''; // Server-only, should not have VITE_ prefix

// Explorer URLs
export const BLOCK_EXPLORER_URL = 'https://calibration.filfox.info/en';

// Currency
export const CURRENCY = 'tFIL';
export const CURRENCY_SYMBOL = 'tFIL';

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${BLOCK_EXPLORER_URL}/tx/${txHash}`;
}

/**
 * Get explorer URL for an address
 */
export function getExplorerAddressUrl(address: string): string {
  return `${BLOCK_EXPLORER_URL}/address/${address}`;
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!RPC_URL) errors.push('RPC_URL is required');
  if (!USDFC_ADDRESS) errors.push('USDFC_ADDRESS is required');
  if (!WARM_STORAGE_ADDRESS) errors.push('WARM_STORAGE_ADDRESS is required');
  if (!FILPAY_ADDRESS) errors.push('FILPAY_ADDRESS is required');

  return {
    valid: errors.length === 0,
    errors
  };
}
