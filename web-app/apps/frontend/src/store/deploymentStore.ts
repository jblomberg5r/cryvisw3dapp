import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DeploymentInfo, DeploymentStatus } from '../types/deployment';
import { useNetworkStore } from './networkStore';
import { logActivity } from './activityStore'; // Import the helper

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
    const estimatedGasString = `${randomGas} ${network?.currencySymbol || 'ETH'}`;
    set({ estimatedGas: estimatedGasString, isEstimatingGas: false });
    logActivity('GAS_ESTIMATED', `Gas estimated for contract on ${network?.name || networkId}: ${estimatedGasString}`, { networkId, contractLength: contractCode.length }, 'Speed');
  },

  deployContract: async (contractName, contractCode, networkId) => {
    if (!contractCode || !networkId) {
      console.error("Contract code and network ID are required to deploy.");
      logActivity('ERROR', `Deployment failed: Contract code or network ID missing.`, {contractName, networkId}, 'ErrorOutline');
      return;
    }
    const network = useNetworkStore.getState().getNetworkById(networkId);
    const newDeploymentId = uuidv4();
    const deploymentTimestamp = new Date();
    const initialDeployment: DeploymentInfo = {
      id: newDeploymentId,
      contractName,
      status: 'pending',
      networkId,
      timestamp: deploymentTimestamp,
    };

    set(state => ({
      currentDeployments: [initialDeployment, ...state.currentDeployments.slice(0, 4)],
      isDeploying: true,
      estimatedGas: null
    }));
    logActivity('DEPLOYMENT_STARTED', `Deployment of "${contractName}" initiated on ${network?.name || networkId}.`, { deploymentId: newDeploymentId, contractName, networkId }, 'RocketLaunch');

    // Simulate pending phase
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockTxHash = `0x${uuidv4().replace(/-/g, '')}`;
    set(state => ({
      currentDeployments: state.currentDeployments.map(d =>
        d.id === newDeploymentId ? { ...d, status: 'broadcasting', transactionHash: mockTxHash } : d
      ),
    }));
    logActivity('DEPLOYMENT_STATUS_CHANGED', `Deployment of "${contractName}" broadcasting (Tx: ${mockTxHash.substring(0,12)}...).`, { deploymentId: newDeploymentId, txHash: mockTxHash, status: 'broadcasting' }, 'SettingsEthernet', newDeploymentId);

    // Simulate broadcasting/confirmation phase
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const success = Math.random() > 0.2;

    if (success) {
      const mockContractAddress = `0x${uuidv4().substring(0,40)}`;
      set(state => ({
        currentDeployments: state.currentDeployments.map(d =>
          d.id === newDeploymentId ? { ...d, status: 'confirmed', contractAddress: mockContractAddress } : d
        ),
        isDeploying: false,
      }));
      logActivity('DEPLOYMENT_SUCCEEDED', `Contract "${contractName}" deployed successfully to ${mockContractAddress.substring(0,10)}... on ${network?.name || networkId}.`, { deploymentId: newDeploymentId, contractAddress: mockContractAddress, networkId, txHash: mockTxHash }, 'CheckCircleOutline', newDeploymentId);
    } else {
      const errorMsg = 'Simulated transaction reverted by EVM. Check gas or contract logic.';
      set(state => ({
        currentDeployments: state.currentDeployments.map(d =>
          d.id === newDeploymentId ? { ...d, status: 'failed', error: errorMsg } : d
        ),
        isDeploying: false,
      }));
      logActivity('DEPLOYMENT_FAILED', `Deployment of "${contractName}" failed on ${network?.name || networkId}. Reason: ${errorMsg}`, { deploymentId: newDeploymentId, error: errorMsg, networkId, txHash: mockTxHash }, 'ErrorOutline', newDeploymentId);
    }
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
