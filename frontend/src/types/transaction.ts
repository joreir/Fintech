export type TransactionType = 'Disbursement' | 'Payment' | 'Transfer'
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed'

export interface Transaction {
  id: string
  idempotencyKey: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  loanId?: string
  description: string
  createdAt: string
  updatedAt?: string
}
