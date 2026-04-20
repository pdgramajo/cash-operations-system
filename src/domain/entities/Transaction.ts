export type TransactionType =
  | 'sale_cash'
  | 'sale_transfer'
  | 'expense'
  | 'cash_withdrawal'
  | 'cash_deposit'
  | 'refund_cash'
  | 'refund_transfer'
  | 'cash_adjustment_plus'
  | 'cash_adjustment_minus';

export interface Transaction {
  readonly id: string;
  readonly sessionId: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly note?: string;
  readonly recipientName?: string;
  readonly recipientType?: string;
  readonly createdAt: string;
  readonly deletedAt?: string | null;
}