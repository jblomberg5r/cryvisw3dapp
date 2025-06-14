export type DeploymentStatus = 'pending' | 'broadcasting' | 'confirmed' | 'failed' | 'none';

export interface DeploymentInfo {
  id: string; // Unique ID for this deployment attempt
  contractName?: string; // Optional: name of the contract being deployed
  contractAddress?: string; // Available once confirmed
  transactionHash?: string; // Available once broadcasting/confirmed
  status: DeploymentStatus;
  error?: string; // For failed deployments
  networkId: string; // ID of the network used for deployment
  timestamp: Date; // When the deployment was initiated
  // Future:
  // gasUsed?: string;
  // gasPrice?: string;
  // deployedBy?: string; // User's address
  // abi?: any[]; // ABI of the deployed contract
  // bytecode?: string;
}
