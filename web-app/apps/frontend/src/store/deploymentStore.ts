import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DeploymentInfo, DeploymentStatus } from '../types/deployment';
import { useNetworkStore } from './networkStore'; // To get block explorer URL

interface DeploymentState {
  currentDeployments: DeploymentInfo[];
  estimatedGas: string | null;
  isEstimatingGas: boolean;
  isDeploying: boolean; // Tracks if any deployment is in an active phase (pending, broadcasting)

  estimateGas: (contractCode: string, networkId: string) => Promise<void>;
  deployContract: (contractName: string, contractCode: string, networkId: string) => Promise<void>;
  clearRecentDeployment: (id: string) => void;
  clearAllDeployments: () => void;
}

export const useDeploymentStore = create<DeploymentState>((set, get) => ({
  currentDeployments: [],
  estimatedGas: null,
  isEstimatingGas: false,
  isDeploying: false,

  estimateGas: async (contractCode, networkId) => {
    if (!contractCode || !networkId) {
      set({ estimatedGas: null });
      return;
    }
    set({ isEstimatingGas: true, estimatedGas: null });
    // console.log(`Simulating gas estimation for contract on network ${networkId}...`);
    // In a real app, this would involve:
    // 1. Compiling contractCode (if not already bytecode)
    // 2. Using ethers.js or viem to estimate gas with a provider for the networkId
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    const randomGas = (Math.random() * 0.05 + 0.001).toFixed(4);
    const network = useNetworkStore.getState().getNetworkById(networkId);
    set({ estimatedGas: `${randomGas} ${network?.currencySymbol || 'ETH'}`, isEstimatingGas: false });
  },

  deployContract: async (contractName, contractCode, networkId) => {
    if (!contractCode || !networkId) {
      console.error("Contract code and network ID are required to deploy.");
      return;
    }
    const newDeploymentId = uuidv4();
    const newDeployment: DeploymentInfo = {
      id: newDeploymentId,
      contractName,
      status: 'pending',
      networkId,
      timestamp: new Date(),
    };

    set(state => ({
      currentDeployments: [newDeployment, ...state.currentDeployments.slice(0, 4)], // Keep last 5
      isDeploying: true,
      estimatedGas: null // Clear gas estimate after starting deployment
    }));

    // Simulate pending phase
    await new Promise(resolve => setTimeout(resolve, 1000));
    set(state => ({
      currentDeployments: state.currentDeployments.map(d =>
        d.id === newDeploymentId ? { ...d, status: 'broadcasting', transactionHash: `0x${uuidv4().replace(/-/g, '')}` } : d
      ),
    }));

    // Simulate broadcasting/confirmation phase
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const success = Math.random() > 0.2; // 80% success rate for simulation

    if (success) {
      set(state => ({
        currentDeployments: state.currentDeployments.map(d =>
          d.id === newDeploymentId ? {
            ...d,
            status: 'confirmed',
            contractAddress: `0x${uuidv4().substring(0,40)}`
          } : d
        ),
        isDeploying: false, // Assuming only one deployment at a time for this flag
      }));
    } else {
      set(state => ({
        currentDeployments: state.currentDeployments.map(d =>
          d.id === newDeploymentId ? {
            ...d,
            status: 'failed',
            error: 'Simulated transaction reverted by EVM. Check gas or contract logic.'
          } : d
        ),
        isDeploying: false,
      }));
    }
    // Note: Actual deployment requires Web3 provider integration (ethers.js, viem)
    // and user's wallet interaction for signing transactions.
    // It would also involve compiling Solidity to bytecode and ABI.
  },

  clearRecentDeployment: (id: string) => {
    set(state => ({
      currentDeployments: state.currentDeployments.filter(d => d.id !== id),
    }));
  },

  clearAllDeployments: () => {
    set({ currentDeployments: [], isDeploying: false });
  },
}));
