import { TokenInfo, MOCK_TOKENS, mockChainId } from './swap'; // Re-use TokenInfo and mock tokens

export interface TrackedWallet {
  address: string;
  name?: string; // User-defined alias for the wallet
  // Future: chainId?: number; // If we want to track addresses on specific chains
}

export interface PortfolioAsset {
  tokenInfo: TokenInfo;
  quantity: string; // Amount of the token held, in displayable units (e.g., "1.5")
  valueUSD: string; // Current market value of the held quantity in USD (e.g., "4500.00")
  allocationPercentage?: number; // Percentage of this asset in the total portfolio value
  chainId: number; // Chain where this asset is held (important for multi-chain portfolios)
  // Future:
  // priceUSD?: string; // Price per token in USD
  // change24hValueUSD?: string;
  // change24hPercentage?: number;
}

export interface PortfolioOverview {
  totalValueUSD: string; // Total value of all assets in USD
  assets: PortfolioAsset[];
  change24hValueUSD?: string; // Change in total value in the last 24 hours
  change24hPercentage?: number; // Percentage change in total value
  // lastUpdated?: Date;
  // sourceAddress?: string; // If this overview is for a single address
}


// Mock Portfolio Data
const ethPortfolioAsset: PortfolioAsset = {
  tokenInfo: MOCK_TOKENS.find(t => t.symbol === 'WETH' && t.chainId === mockChainId)!,
  quantity: '2.5', // 2.5 WETH
  valueUSD: '7500.00', // Assuming WETH at $3000
  allocationPercentage: 50,
  chainId: mockChainId,
};

const usdcPortfolioAsset: PortfolioAsset = {
  tokenInfo: MOCK_TOKENS.find(t => t.symbol === 'USDC' && t.chainId === mockChainId)!,
  quantity: '5000', // 5000 USDC
  valueUSD: '5000.00', // Assuming USDC at $1.00
  allocationPercentage: 33.33,
  chainId: mockChainId,
};

const linkPortfolioAsset: PortfolioAsset = {
  tokenInfo: MOCK_TOKENS.find(t => t.symbol === 'LINK' && t.chainId === mockChainId)!,
  quantity: '100', // 100 LINK
  valueUSD: '2500.00', // Assuming LINK at $25
  allocationPercentage: 16.67,
  chainId: mockChainId,
};

export const MOCK_PORTFOLIO_OVERVIEW: PortfolioOverview = {
  totalValueUSD: '15000.00',
  assets: [ethPortfolioAsset, usdcPortfolioAsset, linkPortfolioAsset],
  change24hPercentage: 2.5, // Mock 2.5% increase
  change24hValueUSD: '+375.00',
};
