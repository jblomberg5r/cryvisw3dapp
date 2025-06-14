import { create } from 'zustand';
import { StakingPoolInfo, UserStakedPosition, MOCK_STAKING_POOLS } from '../types/staking';
import { ethers } from 'ethers'; // For BigNumber operations
import { logActivity } from './activityStore';

interface StakingState {
  stakingPools: StakingPoolInfo[];
  userPositions: Record<string, UserStakedPosition>; // poolId -> UserStakedPosition
  isLoading: boolean; // For actions like stake, unstake, claim
  selectedPoolId: string | null;

  fetchPools: () => Promise<void>; // Simulate fetching pool data
  selectPool: (poolId: string | null) => void;

  stake: (poolId: string, amount: string) => Promise<void>; // amount in display units (e.g., "1.5" ETH)
  unstake: (poolId: string, amount: string) => Promise<void>; // amount in display units
  claimRewards: (poolId: string) => Promise<void>;

  // Mock function to simulate rewards accruing over time
  _simulateRewardAccrual: (poolId: string) => void;
}

export const useStakingStore = create<StakingState>((set, get) => ({
  stakingPools: [],
  userPositions: {},
  isLoading: false,
  selectedPoolId: null,

  fetchPools: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    set({ stakingPools: MOCK_STAKING_POOLS, isLoading: false });
  },

  selectPool: (poolId) => {
    set({ selectedPoolId: poolId });
    if (poolId && !get().userPositions[poolId]) {
      // Initialize mock position if none exists for selected pool
      const pool = get().stakingPools.find(p => p.id === poolId);
      if (pool) {
        set(state => ({
          userPositions: {
            ...state.userPositions,
            [poolId]: {
              poolId,
              stakedAmount: ethers.parseUnits("0", pool.asset.decimals).toString(),
              pendingRewards: ethers.parseUnits("0", pool.rewardToken.decimals).toString(),
              lastUpdateTime: new Date(),
            }
          }
        }));
      }
    }
  },

  stake: async (poolId, amountString) => {
    const pool = get().stakingPools.find(p => p.id === poolId);
    if (!pool) {
      logActivity('ERROR', `Staking failed: Pool ${poolId} not found.`, { poolId, amount: amountString }, 'ErrorOutline');
      throw new Error("Pool not found");
    }
    if (parseFloat(amountString) <= 0) {
        logActivity('WARNING', `Staking attempt with invalid amount for ${pool.name}.`, { poolId, amount: amountString }, 'WarningAmber');
        throw new Error("Amount must be greater than 0");
    }

    set({ isLoading: true });
    logActivity('INFO', `Staking ${amountString} ${pool.asset.symbol} in ${pool.name}...`, { poolId, amount: amountString }, 'HourglassTop');
    // TODO: Real Staking:
    // 1. Check allowance: await assetContract.allowance(userAddress, pool.contractAddress)
    // 2. If allowance < amountToStakeWei, request approval: await assetContract.approve(pool.contractAddress, amountToStakeWei)
    // 3. Call staking contract: await stakingContract.stake(amountToStakeWei)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction

    const amountWei = ethers.parseUnits(amountString, pool.asset.decimals);

    set(state => {
      const currentPosition = state.userPositions[poolId] || {
        poolId,
        stakedAmount: ethers.parseUnits("0", pool.asset.decimals).toString(),
        pendingRewards: ethers.parseUnits("0", pool.rewardToken.decimals).toString(),
        lastUpdateTime: new Date(),
      };
      const newStakedAmount = (BigInt(currentPosition.stakedAmount) + BigInt(amountWei)).toString();
      return {
        userPositions: {
          ...state.userPositions,
          [poolId]: { ...currentPosition, stakedAmount: newStakedAmount, lastUpdateTime: new Date() },
        },
        isLoading: false,
      };
    });
    logActivity('INFO', `Successfully staked ${amountString} ${pool.asset.symbol} in ${pool.name}.`, { poolId, amount: amountString }, 'CheckCircleOutline');
    get()._simulateRewardAccrual(poolId); // Start mock accrual
  },

  unstake: async (poolId, amountString) => {
    const pool = get().stakingPools.find(p => p.id === poolId);
    if (!pool) {
      logActivity('ERROR', `Unstaking failed: Pool ${poolId} not found.`, { poolId, amount: amountString }, 'ErrorOutline');
      throw new Error("Pool not found");
    }
     if (parseFloat(amountString) <= 0) {
        logActivity('WARNING', `Unstaking attempt with invalid amount for ${pool.name}.`, { poolId, amount: amountString }, 'WarningAmber');
        throw new Error("Amount must be greater than 0");
    }

    set({ isLoading: true });
    logActivity('INFO', `Unstaking ${amountString} ${pool.asset.symbol} from ${pool.name}...`, { poolId, amount: amountString }, 'HourglassBottom');
    // TODO: Real Unstaking: await stakingContract.unstake(amountToUnstakeWei)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const amountWei = ethers.parseUnits(amountString, pool.asset.decimals);

    set(state => {
      const currentPosition = state.userPositions[poolId];
      if (!currentPosition || BigInt(currentPosition.stakedAmount) < BigInt(amountWei)) {
         logActivity('ERROR', `Unstaking failed: Insufficient staked balance in ${pool.name}.`, { poolId, amount: amountString, currentStaked: currentPosition?.stakedAmount }, 'ErrorOutline');
        // In a real app, this check should be more robust, potentially before calling the contract.
        return { ...state, isLoading: false }; // Or throw error
      }
      const newStakedAmount = (BigInt(currentPosition.stakedAmount) - BigInt(amountWei)).toString();
      return {
        userPositions: {
          ...state.userPositions,
          [poolId]: { ...currentPosition, stakedAmount: newStakedAmount, lastUpdateTime: new Date() },
        },
        isLoading: false,
      };
    });
     logActivity('INFO', `Successfully unstaked ${amountString} ${pool.asset.symbol} from ${pool.name}.`, { poolId, amount: amountString }, 'CheckCircleOutline');
  },

  claimRewards: async (poolId) => {
    const pool = get().stakingPools.find(p => p.id === poolId);
     if (!pool) {
      logActivity('ERROR', `Reward claim failed: Pool ${poolId} not found.`, { poolId }, 'ErrorOutline');
      throw new Error("Pool not found");
    }
    const position = get().userPositions[poolId];
    if(!position || BigInt(position.pendingRewards) <= BigInt(0)){
        logActivity('INFO', `No rewards to claim from ${pool.name}.`, { poolId }, 'InfoOutlined');
        // throw new Error("No rewards to claim"); // Or just do nothing
        return;
    }


    set({ isLoading: true });
    const rewardsToClaim = ethers.formatUnits(position.pendingRewards, pool.rewardToken.decimals);
    logActivity('INFO', `Claiming ${rewardsToClaim} ${pool.rewardToken.symbol} from ${pool.name}...`, { poolId, amount: rewardsToClaim }, 'Redeem');
    // TODO: Real Claim: await stakingContract.claimRewards() or .getReward()
    await new Promise(resolve => setTimeout(resolve, 1200));

    set(state => ({
      userPositions: {
        ...state.userPositions,
        [poolId]: {
            ...state.userPositions[poolId],
            pendingRewards: ethers.parseUnits("0", pool.rewardToken.decimals).toString(),
            lastUpdateTime: new Date()
        },
      },
      isLoading: false,
    }));
    logActivity('INFO', `Successfully claimed ${rewardsToClaim} ${pool.rewardToken.symbol} from ${pool.name}.`, { poolId, amount: rewardsToClaim }, 'CheckCircleOutline');
  },

  // This is a mock simulation of rewards. Real reward calculation is complex and on-chain.
  _simulateRewardAccrual: (poolId) => {
    const intervalId = `rewardInterval_${poolId}`;
    // @ts-ignore
    if (global[intervalId]) clearInterval(global[intervalId]);

    // @ts-ignore
    global[intervalId] = setInterval(() => {
      const pool = get().stakingPools.find(p => p.id === poolId);
      const position = get().userPositions[poolId];
      if (pool && position && BigInt(position.stakedAmount) > BigInt(0)) {
        // Mock reward: 0.01% of staked amount per interval (e.g., per 5 seconds)
        const rewardRate = BigInt(100); // 0.0001 * 1000000 = 100 for fixed point math (1 = 0.0001%)
        const staked = BigInt(position.stakedAmount);

        // This mock rate is very simplified. Real rates are annual/block-based.
        // And this should use pool.asset.decimals for staked amount, pool.rewardToken.decimals for rewards.
        // Let's assume rewardToken has 18 decimals for this mock.
        const mockRewardIncrement = (staked * rewardRate) / BigInt(1000000) ; // 0.01%

        if (mockRewardIncrement > BigInt(0)) {
            set(state => ({
                userPositions: {
                ...state.userPositions,
                [poolId]: {
                    ...state.userPositions[poolId],
                    pendingRewards: (BigInt(state.userPositions[poolId].pendingRewards) + mockRewardIncrement).toString(),
                    lastUpdateTime: new Date(),
                },
                },
            }));
        }
      } else {
        // @ts-ignore
        clearInterval(global[intervalId]);
      }
    }, 5000); // Accrue every 5 seconds
  },
}));

// Initial fetch of pools
// useStakingStore.getState().fetchPools(); // Can be called from a component's useEffect instead
// Start simulating rewards for any initially staked positions (if any were persisted)
// Object.keys(useStakingStore.getState().userPositions).forEach(poolId => {
//   if (BigInt(useStakingStore.getState().userPositions[poolId].stakedAmount) > 0) {
//     useStakingStore.getState()._simulateRewardAccrual(poolId);
//   }
// });
