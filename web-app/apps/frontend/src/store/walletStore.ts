import { create } from 'zustand';
import { BrowserProvider, JsonRpcSigner } from 'ethers'; // Ethers v6 types

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null; // For ethers v6, this is typically BrowserProvider when using wallet providers
  signer: JsonRpcSigner | null;
  // Web3Modal hooks (useWeb3Modal, useWeb3ModalState, etc.) will be used directly in components
  // or in App.tsx to react to changes and call actions below.
  // No need to store the modal instance itself here if using hooks.

  setWalletData: (data: {
    address?: string | null;
    chainId?: number | null;
    isConnected?: boolean;
    provider?: BrowserProvider | null;
    signer?: JsonRpcSigner | null;
  }) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  chainId: null,
  provider: null,
  signer: null,

  setWalletData: ({ address, chainId, isConnected, provider, signer }) => {
    const update: Partial<WalletState> = {};
    if (address !== undefined) update.address = address;
    if (chainId !== undefined) update.chainId = chainId;
    if (isConnected !== undefined) update.isConnected = isConnected;
    if (provider !== undefined) update.provider = provider;
    if (signer !== undefined) update.signer = signer;

    set(state => ({ ...state, ...update }));
  },

  resetWallet: () => {
    set({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null,
    });
  },
}));
