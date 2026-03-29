export type LoanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Active'
export type LoanType = 'Fixed' | 'Decreasing'
export type PaymentStatusType = 'Pending' | 'Paid'

export interface Loan {
  id: string
  userId: string
  amount: number
  term: number
  interestRate: number
  loanType: LoanType
  status: LoanStatus
  monthlyPayment: number
  monthlyIncome: number
  createdAt: string
  paymentSchedules: PaymentScheduleItem[]
}

export interface PaymentScheduleItem {
  paymentNumber: number
  dueDate: string
  totalPayment: number
  principal: number
  interest: number
  remainingBalance: number
  status: PaymentStatusType
}

export interface SimulateRequest {
  amount: number
  termMonths: number
  loanType: LoanType
  interestRate?: number
}

export interface SimulateResponse {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  tem: number
  tea: number
  schedule: PaymentScheduleItem[]
}

export interface LoanRequest {
  userId: string
  amount: number
  termMonths: number
  loanType: LoanType
  monthlyIncome: number
  interestRate?: number
}
