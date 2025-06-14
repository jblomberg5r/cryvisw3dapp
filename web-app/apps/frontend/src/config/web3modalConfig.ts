import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { supportedNetworks } from './networks'; // Reuse our supportedNetworks list
import { DeploymentNetwork } from '../types/network';

// 1. Get projectID from WalletConnect Cloud
// Ensure this is an environment variable in a real application
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID_PLACEHOLDER';

if (projectId === 'YOUR_WALLETCONNECT_PROJECT_ID_PLACEHOLDER') {
    console.warn("Web3Modal: VITE_WALLETCONNECT_PROJECT_ID is not set. Please set it in your .env file for WalletConnect functionality.");
}

// 2. Set up metadata for your application
const metadata = {
  name: 'My Smart Contract IDE',
  description: 'A web-based IDE for creating, testing, and deploying smart contracts.',
  url: window.location.origin, // Dynamically set to current host
  icons: [`${window.location.origin}/favicon.ico`] // Assuming favicon is at root
};

// 3. Map supportedNetworks to EthersConfig['chains'] (if needed, or use directly if compatible)
// Web3Modal's defaultConfig and createWeb3Modal for ethers typically expect chain objects
// that include chainId, name, currency, explorerUrl, and rpcUrl.
// Our DeploymentNetwork type is already quite similar.

const chains = supportedNetworks.map(network => ({
  chainId: network.chainId,
  name: network.name,
  currency: network.currencySymbol || 'ETH', // Default to ETH if not specified
  explorerUrl: network.blockExplorerUrl || '', // Default to empty string
  rpcUrl: network.rpcUrl || '', // Default to empty string - WalletConnect might use its own
}));

// 4. Create Ethers config
// Note: `defaultConfig` already sets up a lot for you, including providers.
// We primarily need to pass metadata and optionally customize supported chains if they
// differ significantly from what WalletConnect/default providers support.
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  // enableEIP6963: true, // true by default
  // enableInjected: true, // true by default
  // enableCoinbase: true, // true by default
  // rpcUrl: '...', // used for fallback if provided chain rpcUrl is not provided
  // defaultChainId: 1, // used when connecting if no chain is selected
});


// 5. Create a Web3Modal instance
// This function should be called once when your app initializes.
// We export it so it can be called in App.tsx or a similar root component.
export function initWeb3Modal() {
  if (!projectId || projectId === 'YOUR_WALLETCONNECT_PROJECT_ID_PLACEHOLDER') {
    console.error("Web3Modal: WalletConnect Project ID is missing. Web3Modal will not function correctly.");
    // Optionally, disable Web3Modal functionality or show a message to the user.
    return;
  }

  createWeb3Modal({
    ethersConfig,
    chains, // Pass our mapped chains
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    // Other options: themeMode, themeVariables, etc.
    // Refer to Web3Modal documentation for all options.
  });
  console.log("Web3Modal initialized with Project ID:", projectId);
}
