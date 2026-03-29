export type LoanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Active'
export type LoanType = 'Fixed' | 'Decreasing'

export interface Loan {
  id: string
  userId: string
  amount: number
  term: number
  interestRate: number
  loanType: LoanType
  status: LoanStatus
  monthlyPayment: number
  createdAt: string
}

export interface PaymentSchedule {
  paymentNumber: number
  dueDate: string
  totalPayment: number
  principal: number
  interest: number
  remainingBalance: number
  status: 'Pending' | 'Paid'
}

export interface SimulateRequest {
  amount: number
  term: number
  loanType: LoanType
}
