import type { Transaction, TransactionType } from '@/domain/entities';

export interface SessionSummary {
  openingCash: number;
  salesCash: number;
  salesTransfer: number;
  expenses: number;
  withdrawals: number;
  deposits: number;
  refundsCash: number;
  refundsTransfer: number;
  adjustmentsPlus: number;
  adjustmentsMinus: number;
  grossSales: number;
  totalOutflows: number;
  expectedCash: number;
  netRevenue: number;
}

function sumByType(transactions: readonly Transaction[], type: TransactionType): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getSessionSummary(
  transactions: readonly Transaction[],
  openingCash: number,
): SessionSummary {
  const activeTransactions = transactions.filter(
    (t) => !t.deletedAt,
  );

  const salesCash = sumByType(activeTransactions, 'sale_cash');
  const salesTransfer = sumByType(activeTransactions, 'sale_transfer');
  const expenses = sumByType(activeTransactions, 'expense');
  const withdrawals = sumByType(activeTransactions, 'cash_withdrawal');
  const deposits = sumByType(activeTransactions, 'cash_deposit');
  const refundsCash = sumByType(activeTransactions, 'refund_cash');
  const refundsTransfer = sumByType(activeTransactions, 'refund_transfer');
  const adjustmentsPlus = sumByType(activeTransactions, 'cash_adjustment_plus');
  const adjustmentsMinus = sumByType(activeTransactions, 'cash_adjustment_minus');

  const grossSales = salesCash + salesTransfer;
  const totalOutflows = expenses + withdrawals + refundsCash;
  const expectedCash =
    openingCash +
    salesCash +
    deposits +
    adjustmentsPlus -
    expenses -
    withdrawals -
    refundsCash -
    adjustmentsMinus;
  const netRevenue =
    grossSales - expenses - refundsCash - refundsTransfer;

  return {
    openingCash,
    salesCash,
    salesTransfer,
    expenses,
    withdrawals,
    deposits,
    refundsCash,
    refundsTransfer,
    adjustmentsPlus,
    adjustmentsMinus,
    grossSales,
    totalOutflows,
    expectedCash,
    netRevenue,
  };
}