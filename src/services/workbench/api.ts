import type { Goals, SalesDashboard, WorkbenchRepository } from './types';
import { request } from '@/utils/http';

// Endpoint URLs are provided by the integrator, rather than assuming an unagreed backend contract.
// Uses the existing Bearer/401/error handling without changing the authentication system.
export function createWorkbenchApi(endpoints: { sales: string, goals: string }): WorkbenchRepository {
  return {
    async getSales(period) {
      return request.Get<SalesDashboard>(endpoints.sales, {
        params: { period },
      });
    },
    async getGoals() {
      return request.Get<Goals>(endpoints.goals);
    },
  };
}
