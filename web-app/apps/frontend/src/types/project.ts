export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Future fields might include:
  // status: 'active' | 'archived' | 'completed';
  // smartContracts: SmartContractInfo[]; // Assuming another type definition
  // deploymentTargets: DeploymentTarget[]; // Assuming another type definition
}

// Example of how you might extend for related information
// export interface SmartContractInfo {
//   id: string;
//   name: string;
//   address?: string; // Deployed address
//   abi?: any[]; // ABI definition
// }

// export interface DeploymentTarget {
//   id: string;
//   networkName: string; // e.g., 'mainnet', 'sepolia', 'localhost'
//   rpcUrl?: string;
// }
