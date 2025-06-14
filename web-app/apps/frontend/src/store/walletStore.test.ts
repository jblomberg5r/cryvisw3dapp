// web-app/apps/frontend/src/store/walletStore.test.ts
import { useWalletStore } from './walletStore';
import { act, renderHook } from '@testing-library/react';
import { BrowserProvider, JsonRpcSigner } from 'ethers'; // For mock provider/signer types

// Mock ethers objects if needed, or use simple objects for state
const mockProvider = {} as BrowserProvider;
const mockSigner = {} as JsonRpcSigner;

describe('walletStore', () => {
  beforeEach(() => {
    act(() => {
      useWalletStore.getState().resetWallet();
    });
  });

  it('should set wallet data', () => {
    const { result } = renderHook(() => useWalletStore());
    const testData = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      isConnected: true,
      provider: mockProvider,
      signer: mockSigner,
    };
    act(() => {
      result.current.setWalletData(testData);
    });
    expect(result.current.address).toBe(testData.address);
    expect(result.current.chainId).toBe(testData.chainId);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.provider).toBe(mockProvider);
    expect(result.current.signer).toBe(mockSigner);
  });

  it('should reset wallet data', () => {
    const { result } = renderHook(() => useWalletStore());
    // Set some initial data
    act(() => {
      result.current.setWalletData({
        address: '0xsomeAddress',
        chainId: 4,
        isConnected: true,
        provider: mockProvider,
        signer: mockSigner,
      });
    });
    // Now reset
    act(() => {
      result.current.resetWallet();
    });
    expect(result.current.address).toBeNull();
    expect(result.current.chainId).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.provider).toBeNull();
    expect(result.current.signer).toBeNull();
  });

  it('should update partial wallet data', () => {
    const { result } = renderHook(() => useWalletStore());
     act(() => { // Initial full set
      result.current.setWalletData({
        address: '0xinitialAddress',
        chainId: 1,
        isConnected: true,
        provider: mockProvider,
        signer: mockSigner,
      });
    });
    act(() => { // Partial update
      result.current.setWalletData({ chainId: 5, address: '0xnewAddress' });
    });
    expect(result.current.address).toBe('0xnewAddress');
    expect(result.current.chainId).toBe(5);
    expect(result.current.isConnected).toBe(true); // Should remain from initial set
    expect(result.current.provider).toBe(mockProvider); // Should remain
  });
});
