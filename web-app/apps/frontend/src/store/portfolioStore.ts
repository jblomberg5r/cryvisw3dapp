import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // For persisting trackedWallets
import { TrackedWallet, PortfolioOverview, MOCK_PORTFOLIO_OVERVIEW } from '../types/portfolio';
import { logActivity } from './activityStore';
import { ethers } from 'ethers'; // For address validation

interface PortfolioState {
  trackedWallets: TrackedWallet[];
  // For simplicity, we'll use a single aggregated portfolio.
  // A real app might have `Record<string, PortfolioOverview>` to store data per address.
  aggregatedPortfolio: PortfolioOverview | null;
  isLoading: boolean;
  lastError: string | null;

  addTrackedWallet: (address: string, name?: string) => void;
  removeTrackedWallet: (address: string) => void;
  fetchPortfolioData: () => Promise<void>; // Will use mock data for now
  syncConnectedWallet: (address: string | null, name?: string) => void; // Add connected wallet if not already tracked
  clearPortfolioData: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      trackedWallets: [], // Persisted: user's list of wallets to track
      aggregatedPortfolio: null,
      isLoading: false,
      lastError: null,

      addTrackedWallet: (address, name) => {
        if (!ethers.isAddress(address)) {
          const errorMsg = "Invalid Ethereum address provided.";
          set({ lastError: errorMsg });
          logActivity('ERROR', errorMsg, { addressAttempted: address }, 'ErrorOutline');
          console.error(errorMsg);
          return;
        }
        const normalizedAddress = ethers.getAddress(address); // Get checksummed address
        const currentWallets = get().trackedWallets;
        if (!currentWallets.find(w => w.address === normalizedAddress)) {
          const newWallet: TrackedWallet = { address: normalizedAddress, name: name?.trim() || `Wallet ${normalizedAddress.substring(0,6)}...` };
          set({ trackedWallets: [...currentWallets, newWallet], lastError: null });
          logActivity('INFO', `Wallet added to portfolio: ${newWallet.name} (${newWallet.address})`, { address: newWallet.address, name: newWallet.name }, 'AccountBalanceWallet');
          get().fetchPortfolioData(); // Refresh data when a new wallet is added
        } else {
          const errorMsg = `Wallet ${normalizedAddress} is already being tracked.`;
          set({ lastError: errorMsg });
          console.warn(errorMsg);
        }
      },

      removeTrackedWallet: (address) => {
        const walletToRemove = get().trackedWallets.find(w => w.address === address);
        set(state => ({
          trackedWallets: state.trackedWallets.filter(w => w.address !== address),
          lastError: null,
        }));
        if (walletToRemove) {
          logActivity('INFO', `Wallet removed from portfolio: ${walletToRemove.name || walletToRemove.address}`, { address: walletToRemove.address }, 'DeleteOutline');
          if (get().trackedWallets.length === 0) {
            get().clearPortfolioData(); // Clear data if no wallets are tracked
          } else {
            get().fetchPortfolioData(); // Refresh data
          }
        }
      },

      fetchPortfolioData: async () => {
        const wallets = get().trackedWallets;
        if (wallets.length === 0) {
          set({ aggregatedPortfolio: null, isLoading: false, lastError: "No wallets are being tracked." });
          return;
        }
        set({ isLoading: true, lastError: null });
        logActivity('INFO', 'Fetching portfolio data...', { walletCount: wallets.length }, 'Sync');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // In a real app, this would involve:
        // 1. Iterating through `trackedWallets`.
        // 2. For each wallet, calling a portfolio API (e.g., Zerion, Zapper, Covalent, Debank)
        //    with the address and desired chain(s).
        // 3. Aggregating the results into the `PortfolioOverview` structure.
        // For now, we just use the MOCK_PORTFOLIO_OVERVIEW, scaled by number of wallets for some dynamism.

        const mockData = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_OVERVIEW)); // Deep clone
        mockData.totalValueUSD = (parseFloat(mockData.totalValueUSD) * wallets.length).toFixed(2);
        mockData.assets.forEach((asset: any) => {
            asset.quantity = (parseFloat(asset.quantity) * wallets.length).toFixed(Math.min(8, asset.tokenInfo.decimals)); // avoid too many decimals
            asset.valueUSD = (parseFloat(asset.valueUSD) * wallets.length).toFixed(2);
        });


        set({ aggregatedPortfolio: mockData, isLoading: false });
        logActivity('INFO', `Portfolio data updated. Total Value: $${mockData.totalValueUSD}`, { walletCount: wallets.length, totalValue: mockData.totalValueUSD }, 'BarChart');
      },

      syncConnectedWallet: (address, name) => {
        if (address && ethers.isAddress(address)) {
          const normalizedAddress = ethers.getAddress(address);
          const currentWallets = get().trackedWallets;
          if (!currentWallets.find(w => w.address === normalizedAddress)) {
            const walletName = name || `Connected Wallet (${normalizedAddress.substring(0,6)}...)`;
            logActivity('INFO', `Auto-adding connected wallet to portfolio: ${walletName}`, { address: normalizedAddress }, 'Link');
            get().addTrackedWallet(normalizedAddress, walletName); // This will trigger fetchPortfolioData
          }
        }
      },

      clearPortfolioData: () => {
        set({ aggregatedPortfolio: null, isLoading: false });
        logActivity('INFO', `Portfolio data cleared.`, {}, 'DeleteSweep');
      }
    }),
    {
      name: 'portfolio-store', // Name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ trackedWallets: state.trackedWallets }), // Only persist 'trackedWallets'
    }
  )
);

// Fetch initial data if there are already tracked wallets (e.g., from localStorage)
if (usePortfolioStore.getState().trackedWallets.length > 0) {
  usePortfolioStore.getState().fetchPortfolioData();
}
