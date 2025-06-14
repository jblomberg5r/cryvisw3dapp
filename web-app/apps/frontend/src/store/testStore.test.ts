// web-app/apps/frontend/src/store/testStore.test.ts
import { useTestStore } from './testStore';
import { act, renderHook } from '@testing-library/react';

describe('testStore', () => {
  beforeEach(() => {
    act(() => {
      useTestStore.getState().clearTestResults();
    });
  });

  it('should run tests and populate results (mock)', async () => {
    const { result } = renderHook(() => useTestStore());
    expect(result.current.isTesting).toBe(false);
    expect(result.current.testResults.length).toBe(0);

    await act(async () => {
      await result.current.runTests("MyContract.sol");
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.testResults.length).toBeGreaterThan(0);
    // Check if some results are 'passed' or 'failed' based on mock logic
    const hasPassed = result.current.testResults.some(r => r.status === 'passed');
    const hasFailed = result.current.testResults.some(r => r.status === 'failed');
    expect(hasPassed || hasFailed).toBe(true);
  });

  it('should clear test results', async () => {
    const { result } = renderHook(() => useTestStore());
    await act(async () => { // Run tests first to populate results
      await result.current.runTests("MyContract.sol");
    });
    expect(result.current.testResults.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearTestResults();
    });
    expect(result.current.testResults.length).toBe(0);
    expect(result.current.isTesting).toBe(false); // Should also reset isTesting if clearing during a run
  });
});
