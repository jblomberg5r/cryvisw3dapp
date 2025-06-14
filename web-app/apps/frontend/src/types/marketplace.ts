export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., "DeFi", "NFT", "DAO", "Utility", "Token"
  author?: string; // Wallet address or username
  version?: string; // e.g., "1.0.0"
  tags?: string[]; // Keywords for searching
  fullContractCode: string; // The complete Solidity code
  readme?: string; // Markdown content explaining the template
  iconUrl?: string; // URL to an icon representing the template
  usageCount?: number; // How many times it has been used/deployed
  rating?: number; // Average user rating (e.g., 1-5)
  // Future:
  // abi?: any[];
  // bytecode?: string;
  // sourceRepoUrl?: string;
  // license?: string;
  // publishedDate?: Date;
}

export const MarketplaceCategories = [
  "All", // For filtering
  "Tokens",
  "NFTs",
  "DeFi",
  "DAOs",
  "Utilities",
  "Games",
  "Social",
  "Other",
] as const;

export type MarketplaceCategory = typeof MarketplaceCategories[number];
