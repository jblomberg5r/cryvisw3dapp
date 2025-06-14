// web-app/apps/frontend/src/store/portfolioStore.test.ts
import { usePortfolioStore } from './portfolioStore';
import { act, renderHook } from '@testing-library/react';
import { MOCK_PORTFOLIO_OVERVIEW } from '../types/portfolio';

// Mock localStorage for zustand persist middleware
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('portfolioStore', () => {
  beforeEach(() => {
    act(() => {
      usePortfolioStore.getState().clearPortfolioData();
      usePortfolioStore.setState({ trackedWallets: [], aggregatedPortfolio: null, isLoading: false, lastError: null });
      localStorageMock.clear(); // Clear mock localStorage
    });
  });

  it('should add a tracked wallet', () => {
    const { result } = renderHook(() => usePortfolioStore());
    const testAddress = '0x1234567890123456789012345678901234567890';
    act(() => {
      result.current.addTrackedWallet(testAddress, 'Test Wallet');
    });
    expect(result.current.trackedWallets.length).toBe(1);
    expect(result.current.trackedWallets[0].address).toBe(testAddress);
    expect(result.current.trackedWallets[0].name).toBe('Test Wallet');
  });

  it('should not add an invalid wallet address', () => {
    const { result } = renderHook(() => usePortfolioStore());
    act(() => {
      result.current.addTrackedWallet('invalid-address');
    });
    expect(result.current.trackedWallets.length).toBe(0);
    expect(result.current.lastError).toBe("Invalid Ethereum address provided.");
  });

  it('should remove a tracked wallet', () => {
    const { result } = renderHook(() => usePortfolioStore());
    const testAddress = '0x1234567890123456789012345678901234567890';
    act(() => {
      result.current.addTrackedWallet(testAddress, 'Test Wallet');
    });
    expect(result.current.trackedWallets.length).toBe(1);
    act(() => {
      result.current.removeTrackedWallet(testAddress);
    });
    expect(result.current.trackedWallets.length).toBe(0);
  });

  it('should fetch portfolio data (mock)', async () => {
    const { result } = renderHook(() => usePortfolioStore());
    // Add a wallet first to trigger fetch
    act(() => {
      result.current.addTrackedWallet('0x1234567890123456789012345678901234567890');
    });
    // addTrackedWallet calls fetchPortfolioData internally if successful
    // Wait for state changes from async fetchPortfolioData
    await act(async () => {
      // Give time for the async fetchPortfolioData to complete (even if it's just mock with timeout)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Adjust if fetchPortfolioData timeout changes
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.aggregatedPortfolio).not.toBeNull();
    expect(result.current.aggregatedPortfolio?.totalValueUSD).toEqual(MOCK_PORTFOLIO_OVERVIEW.totalValueUSD); // Assuming 1 wallet, mock data is not scaled here directly
  });

  it('should sync connected wallet if not already tracked', () => {
    const { result } = renderHook(() => usePortfolioStore());
    const connectedAddress = '0x0987654321098765432109876543210987654321';
    act(() => {
      result.current.syncConnectedWallet(connectedAddress, 'My Connected Wallet');
    });
    expect(result.current.trackedWallets.length).toBe(1);
    expect(result.current.trackedWallets[0].address).toBe(connectedAddress);
    expect(result.current.trackedWallets[0].name).toContain('My Connected Wallet');
    // Try syncing again, should not add duplicate
    act(() => {
      result.current.syncConnectedWallet(connectedAddress, 'My Connected Wallet');
    });
    expect(result.current.trackedWallets.length).toBe(1);

  });
});
