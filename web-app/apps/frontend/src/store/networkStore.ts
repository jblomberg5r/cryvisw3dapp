import { create } from 'zustand';
import { DeploymentNetwork } from '../types/network';
import { supportedNetworks, defaultDevelopmentNetworks } from '../config/networks'; // Using defaultDevelopmentNetworks for now

interface NetworkState {
  availableNetworks: DeploymentNetwork[];
  selectedNetworkId: string | null;
  selectedNetwork: DeploymentNetwork | null; // Derived state
  setSelectedNetworkId: (networkId: string | null) => void;
  getNetworkById: (networkId: string) => DeploymentNetwork | undefined;
  // Future: addCustomNetwork, removeCustomNetwork, etc.
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  availableNetworks: defaultDevelopmentNetworks, // Initialize with networks from config
  selectedNetworkId: null, // No network selected by default
  selectedNetwork: null,   // Derived from selectedNetworkId

  setSelectedNetworkId: (networkId) => {
    const network = get().availableNetworks.find(n => n.id === networkId);
    set({
      selectedNetworkId: networkId,
      selectedNetwork: network || null
    });
  },

  getNetworkById: (networkId) => {
    return get().availableNetworks.find(n => n.id === networkId);
  },
}));

// Optionally, set a default network when the store initializes
// For example, set to Sepolia or a local network if available
const initialDefaultNetwork = defaultDevelopmentNetworks.find(n => n.id === 'sepolia_testnet');
if (initialDefaultNetwork) {
  useNetworkStore.getState().setSelectedNetworkId(initialDefaultNetwork.id);
} else if (defaultDevelopmentNetworks.length > 0) {
  // Fallback to the first available network if Sepolia is not found
  useNetworkStore.getState().setSelectedNetworkId(defaultDevelopmentNetworks[0].id);
}
