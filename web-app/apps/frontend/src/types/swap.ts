export interface TokenInfo {
  address: string; // Contract address of the token
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string; // URL to the token's logo
  chainId: number; // The chain ID where this token is primarily located
  // Optional: balance?: string; // User's balance, to be fetched dynamically
}

export interface SwapQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string; // Amount of fromToken to be swapped (in smallest unit, e.g., wei)
  toAmount: string;   // Amount of toToken to be received (in smallest unit)
  priceImpact?: string; // Percentage, e.g., "0.5%"
  estimatedGasUSD?: string; // e.g., "$5.20"
  slippageTolerance?: number; // e.g., 0.005 for 0.5%
  route?: string; // e.g., "WETH -> USDC via Uniswap V3" (from aggregator)
  // Provider specific fields might be needed
  // provider?: string; // e.g., '1inch', '0x', 'Uniswap'
}

// Mock list of tokens for a specific chain (e.g., Sepolia testnet or a mainnet)
// Addresses here are placeholders and should be replaced with actual token addresses on the target chain.
export const mockChainId = 11155111; // Sepolia

export const MOCK_TOKENS: TokenInfo[] = [
  {
    chainId: mockChainId,
    address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // Example WETH on Sepolia
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    chainId: mockChainId,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7a90', // Example USDC on Sepolia
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    chainId: mockChainId,
    address: '0x68194a729C245036108980603Ada82Fd798E738a', // Example DAI on Sepolia
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    chainId: mockChainId,
    address: '0xEXAMPLE_UNI_ADDRESS_ON_SEPOLIA', // Placeholder
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
  },
  {
    chainId: mockChainId,
    address: '0xEXAMPLE_LINK_ADDRESS_ON_SEPOLIA', // Placeholder
    name: 'ChainLink Token',
    symbol: 'LINK',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
  },
];
