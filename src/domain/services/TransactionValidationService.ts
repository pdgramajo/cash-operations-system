import type { TransactionType } from '@/domain/entities';

export function isCashFlow(type: TransactionType): boolean {
  switch (type) {
    case 'sale_cash':
    case 'refund_cash':
    case 'cash_adjustment_plus':
    case 'cash_adjustment_minus':
      return true;
    default:
      return false;
  }
}

export function isTransferFlow(type: TransactionType): boolean {
  switch (type) {
    case 'sale_transfer':
    case 'refund_transfer':
      return true;
    default:
      return false;
  }
}

export function isSale(type: TransactionType): boolean {
  switch (type) {
    case 'sale_cash':
    case 'sale_transfer':
      return true;
    default:
      return false;
  }
}

export function isRefund(type: TransactionType): boolean {
  switch (type) {
    case 'refund_cash':
    case 'refund_transfer':
      return true;
    default:
      return false;
  }
}

export function isExpense(type: TransactionType): boolean {
  switch (type) {
    case 'expense':
    case 'cash_withdrawal':
      return true;
    default:
      return false;
  }
}

export function isWithdrawal(type: TransactionType): boolean {
  return type === 'cash_withdrawal';
}