// Base properties for all token standards
export interface BaseTokenConfig {
  name: string;
  symbol: string;
}

// --- ERC20 ---
export interface ERC20Features {
  pausable?: boolean;
  mintable?: boolean; // Typically with access control (e.g., Ownable)
  burnable?: boolean;
  permits?: boolean; // EIP-2612 permits
  votes?: boolean; // EIP-20 Votes + EIP-6372 (Checkpointing)
  flashMinting?: boolean; // EIP-3156 Flash Loans
  snapshots?: boolean; // For governance or other state tracking
}

export interface ERC20Config extends BaseTokenConfig {
  standard: 'ERC20';
  decimals: number; // Typically 18
  initialSupply: string; // String to handle large numbers, e.g., "1000000"
  premintReceiver?: string; // Address to receive the initialSupply, defaults to deployer
  features?: ERC20Features;
}

// --- ERC721 ---
export interface ERC721Features {
  pausable?: boolean;
  mintable?: boolean; // Typically with access control
  burnable?: boolean;
  autoIncrementIds?: boolean; // Instead of requiring manual ID provision
  enumerable?: boolean; // EIP-721 Enumerable extension
  uriStorage?: boolean; // EIP-721 URI Storage extension (allows tokenURI to be set per token)
  votes?: boolean; // EIP-721 Votes
}

export interface ERC721Config extends BaseTokenConfig {
  standard: 'ERC721';
  baseUri?: string; // Optional base URI for token metadata
  features?: ERC721Features;
}

// --- ERC1155 ---
export interface ERC1155Features {
  pausable?: boolean;
  mintable?: boolean; // Typically with access control
  burnable?: boolean;
  supplyTracking?: boolean; // EIP-1155 Supply extension
  // URI per ID is typically handled by overriding uri(uint256 id)
}

export interface ERC1155Config extends BaseTokenConfig {
  standard: 'ERC1155';
  uri: string; // Base URI, can contain {id} placeholder
  features?: ERC1155Features;
}

// Discriminated union for all token configurations
export type TokenConfig = ERC20Config | ERC721Config | ERC1155Config;

// Helper type for partial updates
export type PartialTokenConfig = Partial<Omit<TokenConfig, 'standard'>> & { standard?: TokenConfig['standard'] };


// Default configurations to initialize the store
export const defaultERC20Config: Omit<ERC20Config, 'name' | 'symbol'> = {
  standard: 'ERC20',
  decimals: 18,
  initialSupply: '1000000', // 1 million tokens
  premintReceiver: '', // Placeholder for user input or deployer
  features: {
    mintable: true,
    burnable: true,
    pausable: false,
    permits: false,
    votes: false,
    flashMinting: false,
    snapshots: false,
  },
};

export const defaultERC721Config: Omit<ERC721Config, 'name' | 'symbol'> = {
  standard: 'ERC721',
  baseUri: '',
  features: {
    mintable: true,
    burnable: true,
    autoIncrementIds: true,
    enumerable: false,
    uriStorage: false,
    pausable: false,
    votes: false,
  },
};

export const defaultERC1155Config: Omit<ERC1155Config, 'name' | 'symbol'> = {
  standard: 'ERC1155',
  uri: '',
  features: {
    mintable: true,
    burnable: true,
    supplyTracking: false,
    pausable: false,
  },
};
