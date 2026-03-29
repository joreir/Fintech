import { api, USER_ID } from '@/lib/api'
import { Loan, SimulateRequest, SimulateResponse, LoanRequest, PaymentScheduleItem } from '@/types/loan'

export const loanService = {
  simulate: (data: SimulateRequest) =>
    api.post<SimulateResponse>('/api/loans/simulate', data),

  create: (data: Omit<LoanRequest, 'userId'>) =>
    api.post<Loan>('/api/loans', { ...data, userId: USER_ID }),

  getAll: () =>
    api.get<Loan[]>(`/api/loans?userId=${USER_ID}`),

  getById: (id: string) =>
    api.get<Loan>(`/api/loans/${id}`),

  getSchedule: (id: string) =>
    api.get<PaymentScheduleItem[]>(`/api/loans/${id}/schedule`),

  approve: (id: string) =>
    api.patch(`/api/loans/${id}/approve`),

  reject: (id: string) =>
    api.patch(`/api/loans/${id}/reject`),
}