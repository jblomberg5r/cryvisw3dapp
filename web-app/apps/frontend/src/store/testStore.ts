import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TestResult, TestStatus } from '../types/smartcontract';
import { logActivity } from './activityStore'; // Import the helper

interface TestState {
  testResults: TestResult[];
  isTesting: boolean;
  runTests: (contractIdOrPath: string) => Promise<void>;
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
    set({ isTesting: true, testResults: [] });
    logActivity('TEST_RUN_STARTED', `Test run initiated for "${contractIdOrPath}".`, { target: contractIdOrPath }, 'PlayCircleOutline');

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
    const randomOutcome = Math.random();
    let finalResults: TestResult[] = [];

    if (randomOutcome < 0.3) {
      finalResults = [
        { ...mockPassedTest, id: uuidv4(), testName: `Initialization test for ${contractIdOrPath}` },
        { ...mockPassedTest, id: uuidv4(), testName: `Access control basic for ${contractIdOrPath}` },
      ];
    } else if (randomOutcome < 0.7) {
      finalResults = [
        { ...mockPassedTest, id: uuidv4(), testName: `Positive case for ${contractIdOrPath}` },
        { ...mockFailedTest, id: uuidv4(), testName: `Negative case for ${contractIdOrPath}`},
        { ...mockSkippedTest, id: uuidv4(), testName: `Future feature (skipped) for ${contractIdOrPath}`},
      ];
    } else {
       finalResults = [
        { ...mockFailedTest, id: uuidv4(), testName: `Core functionality A broken in ${contractIdOrPath}`},
        { ...mockPassedTest, id: uuidv4(), testName: `Basic getter works in ${contractIdOrPath}` },
      ];
    }

    const intermediateResults = finalResults.map(r => ({...r, status: 'running' as TestStatus, id: uuidv4() }));
    set({ testResults: intermediateResults });
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    set({ testResults: finalResults, isTesting: false });
    const passedCount = finalResults.filter(r => r.status === 'passed').length;
    const failedCount = finalResults.filter(r => r.status === 'failed').length;
    logActivity('TEST_RUN_COMPLETED', `Test run for "${contractIdOrPath}" completed. Passed: ${passedCount}, Failed: ${failedCount}.`, { target: contractIdOrPath, passed: passedCount, failed: failedCount, total: finalResults.length }, failedCount > 0 ? 'ReportProblem' : 'CheckCircleOutline');
  },
  clearTestResults: () => {
    set({ testResults: [], isTesting: false });
    logActivity('INFO', `Test results cleared.`, {}, 'DeleteSweep');
  },
}));
