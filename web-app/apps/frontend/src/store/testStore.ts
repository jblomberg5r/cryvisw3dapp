import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TestResult, TestStatus } from '../types/smartcontract';

interface TestState {
  testResults: TestResult[];
  isTesting: boolean;
  runTests: (contractIdOrPath: string) => Promise<void>; // Simulate async test running
  clearTestResults: () => void;
}

// Mock data for test results
const mockPassedTest: TestResult = {
  id: uuidv4(),
  testName: 'should initialize owner correctly',
  status: 'passed',
  duration: 120,
  contractName: 'MyContract.sol',
  logs: ['Owner set to deployer address.'],
};

const mockFailedTest: TestResult = {
  id: uuidv4(),
  testName: 'should fail when non-owner tries to call restricted function',
  status: 'failed',
  duration: 250,
  message: 'Error: VM Exception while processing transaction: revert Ownable: caller is not the owner',
  contractName: 'MyContract.sol',
  logs: [
    'Attempting to call restrictedFunction as non-owner...',
    'Transaction reverted as expected.',
  ],
};

const mockSkippedTest: TestResult = {
  id: uuidv4(),
  testName: 'should handle large number calculations (not implemented yet)',
  status: 'skipped',
  duration: 0,
  message: 'Test skipped: Functionality not yet implemented.',
  contractName: 'AdvancedMath.sol',
};


export const useTestStore = create<TestState>((set, get) => ({
  testResults: [],
  isTesting: false,
  runTests: async (contractIdOrPath: string) => {
    set({ isTesting: true, testResults: [] }); // Clear previous results and set loading

    // Simulate test execution delay
    // In a real app, this would involve backend calls or complex client-side processing.
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    // Simulate different outcomes
    const randomOutcome = Math.random();
    let results: TestResult[] = [];

    if (randomOutcome < 0.3) { // All pass
      results = [
        { ...mockPassedTest, id: uuidv4(), testName: `Initialization test for ${contractIdOrPath}` },
        { ...mockPassedTest, id: uuidv4(), testName: `Access control basic for ${contractIdOrPath}` },
        { ...mockPassedTest, id: uuidv4(), testName: `State change verification for ${contractIdOrPath}` },
      ];
    } else if (randomOutcome < 0.7) { // Mix of pass and fail
      results = [
        { ...mockPassedTest, id: uuidv4(), testName: `Positive case test for ${contractIdOrPath}` },
        { ...mockFailedTest, id: uuidv4(), testName: `Negative case failure expected for ${contractIdOrPath}`},
        { ...mockPassedTest, id: uuidv4(), testName: `Another positive path for ${contractIdOrPath}` },
        { ...mockSkippedTest, id: uuidv4(), testName: `Future feature test (skipped) for ${contractIdOrPath}`},
      ];
    } else { // Mostly fail (simulating a problematic contract)
       results = [
        { ...mockFailedTest, id: uuidv4(), testName: `Core functionality A broken in ${contractIdOrPath}`},
        { ...mockFailedTest, id: uuidv4(), testName: `Core functionality B broken in ${contractIdOrPath}`},
        { ...mockPassedTest, id: uuidv4(), testName: `Basic getter still works in ${contractIdOrPath}` },
      ];
    }

    // Simulate some tests are still running then complete
    const intermediateResults = results.map(r => ({...r, status: 'running' as TestStatus, id: uuidv4() }));
    set({ testResults: intermediateResults });

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    set({ testResults: results, isTesting: false });
    console.log(`Mock tests run for: ${contractIdOrPath}. Results populated.`);
    // Note: Actual test execution (compilation, deployment, test running)
    // will require backend or advanced client-side (WASM) solutions.
  },
  clearTestResults: () => {
    set({ testResults: [], isTesting: false });
  },
}));
