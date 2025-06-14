// web-app/apps/frontend/src/store/tokenCreatorStore.test.ts
import { useTokenCreatorStore } from './tokenCreatorStore';
import { act, renderHook } from '@testing-library/react';
import { ERC20Config, defaultERC20Config } from '../types/token';

describe('tokenCreatorStore', () => {
  beforeEach(() => {
    act(() => {
      useTokenCreatorStore.getState().resetConfig();
    });
  });

  it('should set standard and initialize config', () => {
    const { result } = renderHook(() => useTokenCreatorStore());
    act(() => {
      result.current.setStandard('ERC20');
    });
    expect(result.current.selectedStandard).toBe('ERC20');
    expect(result.current.tokenConfig.standard).toBe('ERC20');
    expect(result.current.tokenConfig.decimals).toBe(defaultERC20Config.decimals); // Check against default
  });

  it('should update config field', () => {
    const { result } = renderHook(() => useTokenCreatorStore());
    act(() => {
      result.current.setStandard('ERC20'); // Initialize with ERC20 structure
      result.current.updateConfig('name', 'My Test Token');
      result.current.updateConfig('decimals', 8 as any); // Cast because updateConfig is generic
    });
    expect(result.current.tokenConfig.name).toBe('My Test Token');
    expect((result.current.tokenConfig as Partial<ERC20Config>).decimals).toBe(8);
  });

  it('should update feature flag', () => {
    const { result } = renderHook(() => useTokenCreatorStore());
    act(() => {
      result.current.setStandard('ERC20');
      result.current.updateFeature('ERC20', 'pausable', true);
    });
    const config = result.current.tokenConfig as Partial<ERC20Config>;
    expect(config.features?.pausable).toBe(true);
  });

  it('should generate code (mock)', async () => {
    const { result } = renderHook(() => useTokenCreatorStore());
    act(() => {
      result.current.setStandard('ERC20');
      result.current.updateConfig('name', 'CoolToken');
      result.current.updateConfig('symbol', 'COOL');
      // Other necessary fields for ERC20 are set by default by setStandard
    });

    await act(async () => {
      await result.current.generateCode();
    });
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generatedCode).not.toBeNull();
    expect(result.current.generatedCode).toContain('contract CoolToken is ERC20');
  });

  it('should set generated code manually', () => {
    const { result } = renderHook(() => useTokenCreatorStore());
    const manualCode = "// Manual code override";
    act(() => {
      result.current.setGeneratedCode(manualCode);
    });
    expect(result.current.generatedCode).toBe(manualCode);
  });

  it('should reset config', () => {
    const { result } = renderHook(() => useTokenCreatorStore());
    act(() => {
      result.current.setStandard('ERC721');
      result.current.updateConfig('name', 'MyNFT');
    });
    expect(result.current.selectedStandard).toBe('ERC721');
    act(() => {
      result.current.resetConfig();
    });
    expect(result.current.selectedStandard).toBeNull();
    expect(result.current.tokenConfig.name).toBe('');
  });
});
