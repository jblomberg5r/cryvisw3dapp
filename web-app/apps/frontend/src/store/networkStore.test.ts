// web-app/apps/frontend/src/store/networkStore.test.ts
import { useNetworkStore } from './networkStore';
import { act, renderHook } from '@testing-library/react';
import { supportedNetworks } from '../config/networks';

describe('networkStore', () => {
  const initialDefaultNetwork = supportedNetworks.find(n => n.id === 'sepolia_testnet') || supportedNetworks[0];

  beforeEach(() => {
    act(() => {
      // Reset to initial state (or a known default)
      useNetworkStore.setState({
        selectedNetworkId: initialDefaultNetwork.id,
        selectedNetwork: initialDefaultNetwork,
        availableNetworks: supportedNetworks,
      });
    });
  });

  it('should have initial networks loaded', () => {
    const { result } = renderHook(() => useNetworkStore());
    expect(result.current.availableNetworks.length).toBe(supportedNetworks.length);
    expect(result.current.selectedNetworkId).toBe(initialDefaultNetwork.id);
    expect(result.current.selectedNetwork).toEqual(initialDefaultNetwork);
  });

  it('should set selected network', () => {
    const { result } = renderHook(() => useNetworkStore());
    const polygonMainnet = supportedNetworks.find(n => n.id === 'polygon_mainnet');
    if (!polygonMainnet) throw new Error("Polygon Mainnet not found in supportedNetworks for test");

    act(() => {
      result.current.setSelectedNetworkId(polygonMainnet.id);
    });

    expect(result.current.selectedNetworkId).toBe(polygonMainnet.id);
    expect(result.current.selectedNetwork).toEqual(polygonMainnet);
  });

  it('should clear selected network if ID is null', () => {
    const { result } = renderHook(() => useNetworkStore());
    act(() => {
      result.current.setSelectedNetworkId(null);
    });
    expect(result.current.selectedNetworkId).toBeNull();
    expect(result.current.selectedNetwork).toBeNull();
  });

  it('should get network by ID', () => {
    const { result } = renderHook(() => useNetworkStore());
    const ethereumMainnet = supportedNetworks.find(n => n.id === 'ethereum_mainnet');
     if (!ethereumMainnet) throw new Error("Ethereum Mainnet not found for test");

    const found = result.current.getNetworkById(ethereumMainnet.id);
    expect(found).toEqual(ethereumMainnet);

    const notFound = result.current.getNetworkById('non-existent-id');
    expect(notFound).toBeUndefined();
  });
});
