export interface Parameter {
  name: string;
  type: string; // e.g., 'address', 'uint256', 'string memory'
  description?: string;
}

export interface FunctionTemplate {
  id: string;
  name: string; // e.g., "Getter for State Variable", "Transfer Tokens"
  description: string;
  category: string; // e.g., "Access Control", "Math", "Token Logic", "Events"
  parameters: Parameter[];
  codeSnippet: string; // The actual Solidity code snippet
  // Optional:
  // returnType?: string; // e.g., 'bool', 'uint256'
  // modifiers?: string[]; // e.g., ['onlyOwner', 'payable']
}

// Example categories
export const TemplateCategories = [
  "Access Control",
  "Math Operations",
  "Token Standards (ERC20/ERC721)",
  "Events",
  "Modifiers",
  "Utilities",
  "State Variables",
  "Basic Functions"
] as const;

export type TemplateCategory = typeof TemplateCategories[number];

// --- Test Result Types ---

export type TestStatus = 'passed' | 'failed' | 'running' | 'pending' | 'skipped';

export interface TestResult {
  id: string;
  testName: string;
  status: TestStatus;
  duration?: number; // in milliseconds
  message?: string; // For failure messages or other info
  logs?: string[]; // For console logs during the test
  contractName?: string; // Optional: if tests are per contract
  fileName?: string; // Optional: test file name
}
