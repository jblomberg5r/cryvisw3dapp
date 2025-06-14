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
  "Tokens", // ERC20, ERC721, ERC1155 specific templates
  "NFTs",   // More complex NFT systems, marketplaces, utilities
  "DeFi",   // Staking, Swaps, Lending, Yield Farming
  "DAOs",   // Governance, Voting, Treasury Management
  "Gaming", // Game mechanics, On-chain assets for games
  "Utility",// Common tools, Libraries, Proxies
  "Security",// Multisigs, Escrows, Access Control patterns
  "Social", // Decentralized identity, Social networks, Reputation
  "Storage",// Decentralized storage interaction patterns
  "Identity",// DID, Verifiable Credentials related contracts
  "Bridge", // Cross-chain bridge related contracts/logic
  "Other",  // Miscellaneous templates
] as const;

export type MarketplaceCategory = typeof MarketplaceCategories[number];
