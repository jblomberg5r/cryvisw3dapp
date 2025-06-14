import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MarketplaceTemplate, MarketplaceCategory } from '../types/marketplace';

interface MarketplaceState {
  templates: MarketplaceTemplate[];
  isLoading: boolean;
  selectedTemplate: MarketplaceTemplate | null;
  fetchTemplates: () => Promise<void>;
  selectTemplate: (templateId: string | null) => void;
  getTemplateById: (templateId: string) => MarketplaceTemplate | undefined;
}

const mockMarketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: uuidv4(),
    name: 'Basic ERC20 Token',
    description: 'A standard ERC20 fungible token with basic features like minting and burning.',
    category: 'Tokens',
    author: 'OpenZeppelin (Modified)',
    version: '1.0.0',
    tags: ['erc20', 'fungible', 'token', 'basic'],
    fullContractCode: `pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicERC20 is ERC20, ERC20Burnable, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address initialOwner)
        ERC20(name, symbol)
        Ownable(initialOwner)
    {
        _mint(initialOwner, initialSupply * (10 ** decimals()));
    }

    function mint(address to, uint256 amount) public virtual onlyOwner {
        _mint(to, amount);
    }
}`,
    readme: `# Basic ERC20 Token\n\nThis contract implements a standard ERC20 token with:\n- Fixed initial supply minted to the deployer.\n- Minting new tokens (restricted to owner).\n- Burning tokens.\n\nUses OpenZeppelin contracts.`,
    iconUrl: 'https://example.com/icons/erc20.png', // Replace with actual or placeholder
    usageCount: 150,
    rating: 4.5,
  },
  {
    id: uuidv4(),
    name: 'Simple NFT Collection (ERC721)',
    description: 'A simple ERC721 Non-Fungible Token collection with sequential ID minting.',
    category: 'NFTs',
    author: 'Community Contributor',
    version: '0.9.0',
    tags: ['erc721', 'nft', 'collectible', 'simple'],
    fullContractCode: `pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(string memory name, string memory symbol, address initialOwner)
        ERC721(name, symbol)
        Ownable(initialOwner)
    {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}`,
    readme: `# Simple NFT Collection\n\nThis contract provides a basic ERC721 NFT collection:\n- Name and Symbol for the collection.\n- Owner-restricted minting.\n- Token IDs are auto-incremented.\n\nIdeal for small collections or learning purposes.`,
    iconUrl: 'https://example.com/icons/nft.png',
    usageCount: 230,
    rating: 4.2,
  },
  {
    id: uuidv4(),
    name: 'Basic Staking Contract',
    description: 'Allows users to stake ERC20 tokens and earn rewards over time.',
    category: 'DeFi',
    author: 'DeFi Builder Co.',
    version: '1.1.0',
    tags: ['defi', 'staking', 'erc20', 'rewards', 'yield'],
    fullContractCode: `pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BasicStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken; // Could be the same as stakingToken

    // More state variables and logic needed here...
    // mapping(address => uint256) public stakedBalance;
    // mapping(address => uint256) public rewards;

    constructor(address _stakingToken, address _rewardToken, address initialOwner) Ownable(initialOwner) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) external nonReentrant {
        // require(amount > 0, "Cannot stake 0");
        // stakingToken.transferFrom(msg.sender, address(this), amount);
        // stakedBalance[msg.sender] += amount;
        // TODO: Update rewards, handle time-based calculations
        // emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        // require(amount > 0, "Cannot withdraw 0");
        // require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        // stakedBalance[msg.sender] -= amount;
        // stakingToken.transfer(msg.sender, amount);
        // TODO: Claim pending rewards before withdrawing
        // emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        // uint256 reward = rewards[msg.sender];
        // require(reward > 0, "No rewards to claim");
        // rewards[msg.sender] = 0;
        // rewardToken.transfer(msg.sender, reward);
        // emit RewardClaimed(msg.sender, reward);
    }

    // Placeholder for calculating rewards
    // function calculateReward(address user) public view returns (uint256) { return 0; }
}`,
    readme: `# Basic Staking Contract\n\nAllows users to stake one ERC20 token to earn another (or the same) ERC20 token as rewards.\n\n**Features (Conceptual - requires full implementation):**\n- Stake tokens.\n- Withdraw staked tokens.\n- Claim rewards.\n- Owner-managed (e.g., for setting reward rates if applicable).\n\n**Note:** This is a highly simplified template. Real staking contracts require careful consideration of reward calculation logic, security (reentrancy, etc.), and potentially complex time-based accruals.`,
    iconUrl: 'https://example.com/icons/defi.png',
    usageCount: 85,
    rating: 4.0,
  },
  {
    id: uuidv4(),
    name: 'Simple DAO Voting',
    description: 'A basic contract for creating proposals and allowing token holders to vote.',
    category: 'DAOs',
    author: 'Governance Guild',
    version: '0.5.0',
    tags: ['dao', 'governance', 'voting', 'erc20-votes'],
    fullContractCode: `pragma solidity ^0.8.20;

// This is a very simplified conceptual structure.
// Real DAOs often use OpenZeppelin Governor or similar robust frameworks.
// import "@openzeppelin/contracts/governance/Governor.sol";
// import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
// import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract SimpleDAOVoting {
    // struct Proposal { ... }
    // mapping(uint256 => Proposal) public proposals;
    // IERC20Votes public governanceToken; // Assumes an ERC20Votes compatible token

    constructor(/* address _token */) {
        // governanceToken = IERC20Votes(_token);
    }

    function createProposal(string memory description /*, address[] memory targets, uint256[] memory values, bytes[] memory calldatas */) public /* returns (uint256 proposalId) */ {
        // Placeholder
        // require(governanceToken.getVotes(msg.sender) > proposalThreshold, "Proposer votes below threshold");
        // ...
    }

    function vote(uint256 proposalId, uint8 support) public {
        // support: 0 for Against, 1 for For, 2 for Abstain
        // Placeholder
        // uint256 votingPower = governanceToken.getPastVotes(msg.sender, proposals[proposalId].voteStartBlock);
        // require(votingPower > 0, "No voting power");
        // ...
    }
}`,
    readme: `# Simple DAO Voting\n\nA conceptual template for on-chain governance.\n\n**Note:** This is **highly simplified** and not a production-ready DAO. Real DAOs are complex and should leverage well-audited frameworks like OpenZeppelin Governor along with compatible token standards (e.g., ERC20Votes, ERC721Votes).\n\n**Conceptual Features:**\n- Proposal creation (by users with sufficient voting power).\n- Voting on proposals (For, Against, Abstain).\n- Requires a governance token that implements voting power (e.g., ERC20Votes).`,
    usageCount: 30,
    rating: 3.5,
  }
];

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  templates: [],
  isLoading: false,
  selectedTemplate: null,

  fetchTemplates: async () => {
    set({ isLoading: true, templates: [] });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ templates: mockMarketplaceTemplates, isLoading: false });
  },

  selectTemplate: (templateId) => {
    if (templateId === null) {
      set({ selectedTemplate: null });
    } else {
      const template = get().templates.find(t => t.id === templateId);
      set({ selectedTemplate: template || null });
    }
  },

  getTemplateById: (templateId: string) => {
    return get().templates.find(t => t.id === templateId);
  }
}));

// Initial fetch when store is created (optional)
// useMarketplaceStore.getState().fetchTemplates();
