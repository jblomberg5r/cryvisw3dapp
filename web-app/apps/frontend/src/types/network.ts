export interface DeploymentNetwork {
  id: string; // e.g., 'ethereum_mainnet', 'polygon_mumbai'
  name: string; // e.g., 'Ethereum Mainnet', 'Polygon Mumbai Testnet'
  chainId: number;
  rpcUrl?: string; // Optional, as it might be configured in user's wallet
  blockExplorerUrl?: string;
  currencySymbol?: string;
  isTestnet: boolean;
  // Future:
  // logoUrl?: string;
  // bridgeUrl?: string;
  // faucetUrl?: string; (for testnets)
}
