// web-app/apps/frontend/src/store/functionTemplateStore.test.ts
import { useFunctionTemplateStore } from './functionTemplateStore';
import { renderHook } from '@testing-library/react';
import { TemplateCategories } from '../types/smartcontract';

describe('functionTemplateStore', () => {
  it('should return all templates', () => {
    const { result } = renderHook(() => useFunctionTemplateStore());
    const templates = result.current.getTemplates();
    expect(templates.length).toBeGreaterThan(0); // Based on mock data
  });

  it('should return templates by category', () => {
    const { result } = renderHook(() => useFunctionTemplateStore());
    const accessControlTemplates = result.current.getTemplatesByCategory('Access Control');
    expect(accessControlTemplates.length).toBeGreaterThan(0);
    accessControlTemplates.forEach(t => expect(t.category).toBe('Access Control'));

    const mathTemplates = result.current.getTemplatesByCategory('Math Operations');
    expect(mathTemplates.length).toBeGreaterThan(0);
  });

  it('should return empty array for non-existent category', () => {
    const { result } = renderHook(() => useFunctionTemplateStore());
    // Assuming 'NonExistentCategory' is not in TemplateCategories
    const templates = result.current.getTemplatesByCategory('NonExistentCategory' as any);
    expect(templates.length).toBe(0);
  });
});
