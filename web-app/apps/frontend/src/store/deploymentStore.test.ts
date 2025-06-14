// web-app/apps/frontend/src/store/deploymentStore.test.ts
import { useDeploymentStore } from './deploymentStore';
import { act, renderHook } from '@testing-library/react';

describe('deploymentStore', () => {
  beforeEach(() => {
    act(() => {
      useDeploymentStore.getState().clearAllDeployments();
      useDeploymentStore.setState({ estimatedGas: null, isEstimatingGas: false, isDeploying: false });
    });
  });

  it('should estimate gas (mock)', async () => {
    const { result } = renderHook(() => useDeploymentStore());
    await act(async () => {
      await result.current.estimateGas("contract code", "network1");
    });
    expect(result.current.isEstimatingGas).toBe(false);
    expect(result.current.estimatedGas).not.toBeNull();
  });

  it('should simulate contract deployment', async () => {
    const { result } = renderHook(() => useDeploymentStore());
    await act(async () => {
      await result.current.deployContract("TestContract", "contract code", "network1");
    });
    expect(result.current.isDeploying).toBe(false);
    expect(result.current.currentDeployments.length).toBe(1);
    expect(result.current.currentDeployments[0].contractName).toBe("TestContract");
    // Could be 'confirmed' or 'failed' due to mock randomness
    expect(result.current.currentDeployments[0].status).toMatch(/confirmed|failed/);
  });
});
