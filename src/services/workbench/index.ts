import type { WorkbenchRepository } from './types';
import { DASH, GOALS } from './mock';

// Switch to createWorkbenchApi from ./api once backend endpoint URLs are agreed.
// Authentication and user APIs always keep using the existing real backend.
export const workbenchRepository: WorkbenchRepository = {
  async getSales(period) { return structuredClone(DASH[period]); },
  async getGoals() { return structuredClone(GOALS); },
};
export const formatAmount = (value: number) => value.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const formatInteger = (value: number) => Math.round(value).toLocaleString('zh-CN');
