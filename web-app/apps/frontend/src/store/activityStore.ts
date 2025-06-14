import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLog, ActivityType } from '../types/activity';

const MAX_LOGS = 100; // Keep the last 100 logs for performance

interface ActivityState {
  activityLogs: ActivityLog[];
  addLog: (logEntry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activityLogs: [],

  addLog: (logEntry) => {
    const newLog: ActivityLog = {
      ...logEntry,
      id: uuidv4(),
      timestamp: new Date(),
    };

    set((state) => ({
      activityLogs: [newLog, ...state.activityLogs].slice(0, MAX_LOGS), // Add to front, then slice
    }));
    // console.log(`Activity Logged: [${newLog.type}] ${newLog.message}`, newLog.details || '');
  },

  clearLogs: () => {
    set({ activityLogs: [] });
  },
}));

// Helper function to be used by other stores (optional, or call useActivityStore.getState().addLog directly)
export const logActivity = (
  type: ActivityType,
  message: string,
  details?: Record<string, any>,
  icon?: string,
  relatedEntityId?: string
) => {
  useActivityStore.getState().addLog({ type, message, details, icon, relatedEntityId });
};
