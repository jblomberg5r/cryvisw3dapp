import { create } from 'zustand';
import { TokenInfo, SwapQuote, MOCK_TOKENS, mockChainId } from '../types/swap';
import { ethers } from 'ethers'; // For BigNumber calculations if needed for mock

interface SwapState {
  fromToken: TokenInfo | null;
  toToken: TokenInfo | null;
  fromAmount: string; // User input for the amount they want to send
  toAmount: string;   // Calculated amount they will receive (from quote)

  mockTokens: TokenInfo[]; // List of available tokens for selection
  isLoadingQuote: boolean;
  currentQuote: SwapQuote | null;
  isConfirmModalOpen: boolean;

  setFromToken: (token: TokenInfo | null) => void;
  setToToken: (token: TokenInfo | null) => void;
  setFromAmount: (amount: string) => void;
  // setToAmount: (amount: string) => void; // Usually set by quote

  getMockQuote: () => Promise<void>;
  clearSwapState: () => void;
  openConfirmModal: () => void;
  closeConfirmModal: () => void;
  executeSwap: () => Promise<void>; // Placeholder for actual swap execution
}

const defaultFromToken = MOCK_TOKENS.find(t => t.symbol === 'WETH') || null;
const defaultToToken = MOCK_TOKENS.find(t => t.symbol === 'USDC') || null;

export const useSwapStore = create<SwapState>((set, get) => ({
  fromToken: defaultFromToken,
  toToken: defaultToToken,
  fromAmount: '',
  toAmount: '',
  mockTokens: MOCK_TOKENS.filter(token => token.chainId === mockChainId), // Filter by current mock chain
  isLoadingQuote: false,
  currentQuote: null,
  isConfirmModalOpen: false,

  setFromToken: (token) => set({ fromToken: token, currentQuote: null, toAmount: '' }),
  setToToken: (token) => set({ toToken: token, currentQuote: null, toAmount: '' }),
  setFromAmount: (amount) => set({ fromAmount: amount, currentQuote: null, toAmount: '' }),

  getMockQuote: async () => {
    const { fromToken, toToken, fromAmount } = get();
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      set({ currentQuote: null, toAmount: '' });
      return;
    }

    set({ isLoadingQuote: true, currentQuote: null, toAmount: '' });
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

    // Mock conversion rate (highly simplified)
    let rate = 1;
    if (fromToken.symbol === 'WETH' && toToken.symbol === 'USDC') rate = 3000;
    else if (fromToken.symbol === 'USDC' && toToken.symbol === 'WETH') rate = 1 / 3000;
    else if (fromToken.symbol === 'WETH' && toToken.symbol === 'DAI') rate = 2950;
    else if (fromToken.symbol === 'DAI' && toToken.symbol === 'WETH') rate = 1 / 2950;
    else if (fromToken.symbol === 'USDC' && toToken.symbol === 'DAI') rate = 0.99;
    else if (fromToken.symbol === 'DAI' && toToken.symbol === 'USDC') rate = 1.01;
    else rate = Math.random() * 10 + 0.5; // Generic random rate for other pairs

    // Handle decimals for calculation (conceptual)
    // In a real scenario, amounts are usually handled as BigNumber or string in wei/smallest unit
    const calculatedToAmount = (parseFloat(fromAmount) * rate).toFixed(toToken.decimals);

    const newQuote: SwapQuote = {
      fromToken,
      toToken,
      fromAmount: ethers.parseUnits(fromAmount, fromToken.decimals).toString(), // Convert to smallest unit
      toAmount: ethers.parseUnits(calculatedToAmount, toToken.decimals).toString(), // Convert to smallest unit
      priceImpact: `${(Math.random() * 0.1).toFixed(2)}%`, // Mock price impact
      estimatedGasUSD: `$${(Math.random() * 5 + 1).toFixed(2)}`, // Mock gas
      route: `Mock Route: ${fromToken.symbol} -> ${toToken.symbol}`,
    };

    set({
        isLoadingQuote: false,
        currentQuote: newQuote,
        toAmount: calculatedToAmount // Store displayable amount, quote has smallest unit
    });
  },

  executeSwap: async () => {
    const { currentQuote } = get();
    if (!currentQuote) {
        console.error("No quote available to execute swap.");
        // Potentially show error to user
        return;
    }
    set({ isLoadingQuote: true }); // Reuse isLoadingQuote for swap execution phase
    console.log("Simulating swap execution with quote:", currentQuote);
    // TODO:
    // 1. Check allowances (ERC20 approve)
    // 2. Get transaction data from DEX aggregator API / build it
    // 3. Get signer from walletStore
    // 4. signer.sendTransaction(...)
    // 5. Handle transaction monitoring (pending, success, fail)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time

    // Mock success
    console.log("Mock Swap Successful!");
    logActivity('INFO', `Mock swap executed: ${currentQuote.fromAmount} ${currentQuote.fromToken.symbol} for ${currentQuote.toAmount} ${currentQuote.toToken.symbol}`, currentQuote, 'SwapHoriz');

    set(state => ({
        isLoadingQuote: false,
        isConfirmModalOpen: false,
        fromAmount: '', // Clear amounts after successful swap
        toAmount: '',
        currentQuote: null,
    }));
  },

  clearSwapState: () => {
    set({
      fromToken: defaultFromToken,
      toToken: defaultToToken,
      fromAmount: '',
      toAmount: '',
      isLoadingQuote: false,
      currentQuote: null,
      isConfirmModalOpen: false,
    });
  },

  openConfirmModal: () => set({ isConfirmModalOpen: true }),
  closeConfirmModal: () => set({ isConfirmModalOpen: false }),
}));

// Helper for activity logging (if not already universally available)
const logActivity = (type: any, message: string, details?: any, icon?: string) => {
  // Assuming useActivityStore is available globally or passed/imported
  // For simplicity, this is a placeholder if you haven't set up global activity logging access here
  console.log(`Activity [${type}]: ${message}`, details);
};
