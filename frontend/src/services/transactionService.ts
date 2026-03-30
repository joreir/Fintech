import { api } from '@/lib/api'
import { Transaction, TransactionType, TransactionStatus } from '@/types/transaction'

export const transactionService = {
  getAll: (type?: TransactionType, status?: TransactionStatus) => 
    api.get<Transaction[]>('/api/transactions', { params: { type, status } }),
  
  create: (data: Partial<Transaction>) => 
    api.post<Transaction>('/api/transactions', {
      ...data,
      idempotencyKey: crypto.randomUUID()
    }),
}