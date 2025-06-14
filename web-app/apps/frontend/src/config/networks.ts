import { DeploymentNetwork } from '../types/network';

export const supportedNetworks: DeploymentNetwork[] = [
  // Mainnets
  {
    id: 'ethereum_mainnet',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID', // Replace with actual or leave for user
    blockExplorerUrl: 'https://etherscan.io',
    currencySymbol: 'ETH',
    isTestnet: false,
  },
  {
    id: 'polygon_mainnet',
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    currencySymbol: 'MATIC',
    isTestnet: false,
  },
  {
    id: 'bsc_mainnet',
    name: 'BNB Smart Chain Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorerUrl: 'https://bscscan.com',
    currencySymbol: 'BNB',
    isTestnet: false,
  },
  {
    id: 'arbitrum_one_mainnet',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    currencySymbol: 'ETH',
    isTestnet: false,
  },
  // Testnets
  {
    id: 'sepolia_testnet',
    name: 'Sepolia Testnet (Ethereum)',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID', // Replace with actual or leave for user
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    currencySymbol: 'SepoliaETH',
    isTestnet: true,
  },
  {
    id: 'mumbai_testnet',
    name: 'Polygon Mumbai Testnet',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    currencySymbol: 'MATIC',
    isTestnet: true,
  },
  {
    id: 'bsc_testnet',
    name: 'BNB Smart Chain Testnet',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    currencySymbol: 'tBNB',
    isTestnet: true,
  },
  // Local Development Network (example)
  {
    id: 'localhost_hardhat',
    name: 'Local Hardhat Node',
    chainId: 31337, // Default Hardhat chainId
    rpcUrl: 'http://127.0.0.1:8545/',
    blockExplorerUrl: undefined, // No specific block explorer usually
    currencySymbol: 'LocalETH',
    isTestnet: true, // Treat as testnet for UI purposes
  },
];

// You might want to filter out some networks by default or based on environment
export const defaultProductionNetworks = supportedNetworks.filter(net => !net.id.includes('localhost'));
export const defaultDevelopmentNetworks = supportedNetworks;
