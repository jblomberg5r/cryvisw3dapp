// web-app/apps/frontend/src/store/marketplaceStore.test.ts
import { useMarketplaceStore } from './marketplaceStore';
import { act, renderHook } from '@testing-library/react';

describe('marketplaceStore', () => {
  beforeEach(async () => {
    // Reset store and fetch initial data
    await act(async () => {
      useMarketplaceStore.setState({ templates: [], isLoading: false, selectedTemplate: null });
      // await useMarketplaceStore.getState().fetchTemplates(); // Fetching is async
    });
  });

  it('should fetch templates and update loading state', async () => {
    const { result } = renderHook(() => useMarketplaceStore());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.templates.length).toBe(0);

    await act(async () => {
      await result.current.fetchTemplates();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.templates.length).toBeGreaterThan(0); // Based on mock data
  });

  it('should select a template', async () => {
    const { result } = renderHook(() => useMarketplaceStore());
    await act(async () => {
      await result.current.fetchTemplates(); // Ensure templates are loaded
    });

    const firstTemplateId = result.current.templates[0]?.id;
    if (!firstTemplateId) {
        console.warn("No templates loaded, skipping selectTemplate test");
        return;
    }

    act(() => {
      result.current.selectTemplate(firstTemplateId);
    });
    expect(result.current.selectedTemplate).not.toBeNull();
    expect(result.current.selectedTemplate?.id).toBe(firstTemplateId);
  });

  it('should clear selected template', async () => {
    const { result } = renderHook(() => useMarketplaceStore());
     await act(async () => {
      await result.current.fetchTemplates();
    });

    const firstTemplateId = result.current.templates[0]?.id;
     if (!firstTemplateId) return; // Skip if no templates

    act(() => {
      result.current.selectTemplate(firstTemplateId);
    });
    expect(result.current.selectedTemplate).not.toBeNull();

    act(() => {
      result.current.selectTemplate(null);
    });
    expect(result.current.selectedTemplate).toBeNull();
  });

  it('should get template by ID', async () => {
    const { result } = renderHook(() => useMarketplaceStore());
    await act(async () => {
      await result.current.fetchTemplates();
    });

    const firstTemplate = result.current.templates[0];
    if (!firstTemplate) return; // Skip if no templates

    const foundTemplate = result.current.getTemplateById(firstTemplate.id);
    expect(foundTemplate).toEqual(firstTemplate);

    const notFoundTemplate = result.current.getTemplateById('non-existent-id');
    expect(notFoundTemplate).toBeUndefined();
  });
});
