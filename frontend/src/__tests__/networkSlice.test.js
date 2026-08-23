import { describe, it, expect } from 'vitest';
import networkReducer, {
  setOnline,
  setOffline,
  selectIsOnline,
} from '../store/networkSlice.js';

describe('networkSlice Redux', () => {
  it('should return initial state with boolean isOnline', () => {
    const initialState = networkReducer(undefined, { type: 'unknown' });
    expect(typeof initialState.isOnline).toBe('boolean');
  });

  it('should handle setOffline correctly', () => {
    const state = networkReducer({ isOnline: true, lastCheckedAt: null }, setOffline());
    expect(state.isOnline).toBe(false);
    expect(state.lastCheckedAt).toBeTruthy();
  });

  it('should handle setOnline correctly', () => {
    const state = networkReducer({ isOnline: false, lastCheckedAt: null }, setOnline());
    expect(state.isOnline).toBe(true);
    expect(state.lastCheckedAt).toBeTruthy();
  });

  it('should select isOnline from root state', () => {
    const rootState = {
      network: { isOnline: false, lastCheckedAt: null },
    };
    expect(selectIsOnline(rootState)).toBe(false);
  });
});
