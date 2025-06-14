// web-app/apps/frontend/src/store/activityStore.test.ts
import { useActivityStore } from './activityStore';
import { act, renderHook } from '@testing-library/react';

describe('activityStore', () => {
  beforeEach(() => {
    act(() => {
      useActivityStore.getState().clearLogs();
    });
  });

  it('should add a log entry', () => {
    const { result } = renderHook(() => useActivityStore());
    act(() => {
      result.current.addLog({ type: 'TEST', message: 'Test log' });
    });
    expect(result.current.activityLogs.length).toBe(1);
    expect(result.current.activityLogs[0].message).toBe('Test log');
  });

  it('should cap logs at MAX_LOGS', () => {
    // MAX_LOGS is 100 in the store
    const { result } = renderHook(() => useActivityStore());
    act(() => {
      for (let i = 0; i < 105; i++) {
        result.current.addLog({ type: 'TEST', message: `Test log ${i}` });
      }
    });
    expect(result.current.activityLogs.length).toBe(100);
    expect(result.current.activityLogs[0].message).toBe('Test log 104'); // Newest first
  });

  it('should clear logs', () => {
    const { result } = renderHook(() => useActivityStore());
    act(() => {
      result.current.addLog({ type: 'TEST', message: 'Test log' });
      result.current.clearLogs();
    });
    expect(result.current.activityLogs.length).toBe(0);
  });
});
