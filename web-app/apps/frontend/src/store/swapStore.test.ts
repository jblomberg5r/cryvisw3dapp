// web-app/apps/frontend/src/store/swapStore.test.ts
import { useSwapStore } from './swapStore';
import { act, renderHook } from '@testing-library/react';
import { MOCK_TOKENS } from '../types/swap';

describe('swapStore', () => {
  const weth = MOCK_TOKENS.find(t => t.symbol === 'WETH');
  const usdc = MOCK_TOKENS.find(t => t.symbol === 'USDC');

  beforeEach(() => {
    act(() => {
      useSwapStore.getState().clearSwapState();
    });
  });

  it('should set fromToken and toToken', () => {
    const { result } = renderHook(() => useSwapStore());
    expect(result.current.fromToken?.symbol).not.toBe(usdc?.symbol); // Initially WETH or null
    expect(result.current.toToken?.symbol).not.toBe(weth?.symbol); // Initially USDC or null

    if (!weth || !usdc) throw new Error("Mock tokens WETH or USDC not found for test");

    act(() => {
      result.current.setFromToken(usdc);
      result.current.setToToken(weth);
    });
    expect(result.current.fromToken?.symbol).toBe(usdc.symbol);
    expect(result.current.toToken?.symbol).toBe(weth.symbol);
  });

  it('should set fromAmount', () => {
    const { result } = renderHook(() => useSwapStore());
    act(() => {
      result.current.setFromAmount('1.23');
    });
    expect(result.current.fromAmount).toBe('1.23');
  });

  it('should get a mock quote', async () => {
    const { result } = renderHook(() => useSwapStore());
    if (!weth || !usdc) throw new Error("Mock tokens not found for quote test");

    act(() => {
      result.current.setFromToken(weth);
      result.current.setToToken(usdc);
      result.current.setFromAmount('1');
    });

    await act(async () => {
      await result.current.getMockQuote();
    });

    expect(result.current.isLoadingQuote).toBe(false);
    expect(result.current.currentQuote).not.toBeNull();
    expect(result.current.toAmount).not.toBe('');
    if (result.current.currentQuote) { // Type guard
        expect(result.current.currentQuote.fromToken.symbol).toBe(weth.symbol);
        expect(result.current.currentQuote.toToken.symbol).toBe(usdc.symbol);
    }
  });

  it('should open and close confirmation modal', () => {
    const { result } = renderHook(() => useSwapStore());
    expect(result.current.isConfirmModalOpen).toBe(false);
    act(() => {
      result.current.openConfirmModal();
    });
    expect(result.current.isConfirmModalOpen).toBe(true);
    act(() => {
      result.current.closeConfirmModal();
    });
    expect(result.current.isConfirmModalOpen).toBe(false);
  });

  it('should simulate executing a swap', async () => {
    const { result } = renderHook(() => useSwapStore());
    if (!weth || !usdc) throw new Error("Mock tokens not found for swap execution test");

    act(() => {
      result.current.setFromToken(weth);
      result.current.setToToken(usdc);
      result.current.setFromAmount('0.5');
    });
     await act(async () => { // Get a quote first
      await result.current.getMockQuote();
    });
    expect(result.current.currentQuote).not.toBeNull();

    await act(async () => {
      await result.current.executeSwap();
    });
    expect(result.current.isLoadingQuote).toBe(false); // isLoadingQuote is reused for swap execution
    expect(result.current.isConfirmModalOpen).toBe(false); // Should close after mock "success"
    expect(result.current.fromAmount).toBe(''); // Amounts should be cleared
    expect(result.current.currentQuote).toBeNull(); // Quote should be cleared
  });
});
