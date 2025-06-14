import { TokenInfo, MOCK_TOKENS, mockChainId } from './swap'; // Re-use TokenInfo and mock tokens for assets/rewards

export interface StakingPoolInfo {
  id: string; // Unique identifier for the staking pool
  name: string; // e.g., "Stake WETH, Earn MyRewardToken"
  description?: string;
  asset: TokenInfo; // The token that users stake
  rewardToken: TokenInfo; // The token distributed as rewards
  apr?: string; // Annual Percentage Rate, e.g., "12.5%" (can be variable in real contracts)
  tvl?: string; // Total Value Locked in the pool (e.g., "$1,234,567 USD" or "1,000 WETH")
  minStakeAmount?: string; // Minimum amount to stake, in smallest unit of asset
  maxStakeAmount?: string; // Maximum amount per user, in smallest unit
  earlyUnstakeFee?: string; // e.g., "1%" if unstaking before a certain period
  lockupPeriod?: string; // e.g., "30 days"
  contractAddress: string; // Address of the staking smart contract
  chainId: number; // Chain where this staking pool is deployed
  // status: 'active' | 'upcoming' | 'ended';
}

export interface UserStakedPosition {
  poolId: string;
  stakedAmount: string; // Amount of 'asset' staked by the user, in smallest unit
  pendingRewards: string; // Amount of 'rewardToken' claimable by the user, in smallest unit
  lastUpdateTime?: Date; // For calculating rewards if done client-side or for display
  // userShare?: string; // User's percentage share of the pool
}


// Mock Staking Pools
// Ensure addresses are distinct and make sense for a given mockChainId (e.g., Sepolia)
const weth = MOCK_TOKENS.find(t => t.symbol === 'WETH' && t.chainId === mockChainId);
const usdc = MOCK_TOKENS.find(t => t.symbol === 'USDC' && t.chainId === mockChainId);
const dai = MOCK_TOKENS.find(t => t.symbol === 'DAI' && t.chainId === mockChainId);
const mockRewardToken = { // A mock reward token for this example
    chainId: mockChainId,
    address: '0xMockRewardTokenAddressOnSepolia',
    name: 'My Reward Token',
    symbol: 'MRT',
    decimals: 18,
    logoURI: 'https://example.com/icons/mrt.png',
};
MOCK_TOKENS.push(mockRewardToken); // Add to general MOCK_TOKENS if it's selectable elsewhere

export const MOCK_STAKING_POOLS: StakingPoolInfo[] = [
  {
    id: 'weth_mrt_pool_01',
    name: 'Stake WETH, Earn MRT',
    description: 'High APR pool for early WETH stakers. Standard lockup applies.',
    asset: weth!, // Non-null assertion, ensure weth is found
    rewardToken: mockRewardToken,
    apr: '25.5%',
    tvl: '1,500 WETH ($4.5M USD)',
    minStakeAmount: ethers.parseUnits('0.1', weth!.decimals).toString(), // 0.1 WETH
    lockupPeriod: '14 days',
    contractAddress: '0xPoolContractAddressWETH_MRT',
    chainId: mockChainId,
  },
  {
    id: 'usdc_mrt_pool_02',
    name: 'Stake USDC, Earn MRT',
    description: 'Stablecoin staking with competitive MRT rewards.',
    asset: usdc!,
    rewardToken: mockRewardToken,
    apr: '12.0%',
    tvl: '2,500,000 USDC',
    minStakeAmount: ethers.parseUnits('100', usdc!.decimals).toString(), // 100 USDC
    contractAddress: '0xPoolContractAddressUSDC_MRT',
    chainId: mockChainId,
  },
  {
    id: 'dai_weth_pool_03',
    name: 'Stake DAI, Earn WETH',
    description: 'Stake DAI to earn wrapped Ether as rewards. Good for ETH bulls.',
    asset: dai!,
    rewardToken: weth!,
    apr: '8.5%',
    tvl: '1,200,000 DAI',
    earlyUnstakeFee: '0.5%',
    contractAddress: '0xPoolContractAddressDAI_WETH',
    chainId: mockChainId,
  },
];

// Helper to ensure ethers is available for default values
import { ethers } from 'ethers';
