// Represents the type of activity that occurred.
// Using a string union type for flexibility but can be an enum.
export type ActivityType =
  // Project actions
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  // File/Editor actions
  | 'FILE_CREATED'
  | 'FILE_RENAMED'
  | 'FILE_DELETED'
  | 'FILE_OPENED'
  | 'FILE_CONTENT_UPDATED' // Potentially noisy, use with care or for explicit saves
  // Token Creator actions
  | 'TOKEN_CODE_GENERATED'
  // Deployment actions
  | 'DEPLOYMENT_STARTED'
  | 'DEPLOYMENT_STATUS_CHANGED' // e.g., pending -> broadcasting -> confirmed/failed
  | 'DEPLOYMENT_SUCCEEDED'
  | 'DEPLOYMENT_FAILED'
  | 'GAS_ESTIMATED'
  // Testing actions
  | 'TEST_RUN_STARTED'
  | 'TEST_RUN_COMPLETED'
  // Marketplace actions
  | 'TEMPLATE_USED' // When a marketplace template is added to a project
  // Wallet actions
  | 'WALLET_CONNECTED'
  | 'WALLET_DISCONNECTED'
  | 'NETWORK_SWITCHED' // Wallet network changed
  // Other generic types
  | 'INFO'
  | 'WARNING'
  | 'ERROR';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: ActivityType;
  message: string; // User-friendly message, e.g., "Project 'My dApp' was created."
  details?: Record<string, any>; // Optional structured data, e.g., { projectId: 'xyz', fileName: 'contract.sol' }
  icon?: string; // MUI icon name (as string) to be dynamically rendered, e.g., 'AddCircleOutline', 'Edit', 'Delete'
  // For more type safety with icons, could use: icon?: React.ElementType<SvgIconProps>; but string is simpler for store.
  relatedEntityId?: string; // Optional ID of the entity this log relates to (e.g., projectId, fileId)
}
