import { describe, it, expect } from 'vitest';
import type { Transaction } from '@/domain/entities';
import { getSessionSummary } from '@/domain/services';

function createTransaction(
  id: string,
  sessionId: string,
  type: Transaction['type'],
  amount: number,
): Transaction {
  return {
    id,
    sessionId,
    type,
    amount,
    createdAt: new Date().toISOString(),
  };
}

describe('TransactionDomainService', () => {
  describe('getSessionSummary', () => {
    it('1. Only cash sales', () => {
      const openingCash = 1000;
      const transactions = [
        createTransaction('1', 's1', 'sale_cash', 500),
      ];

      const summary = getSessionSummary(transactions, openingCash);

      expect(summary.expectedCash).toBe(1500);
      expect(summary.salesCash).toBe(500);
    });

    it('2. Cash + transfer sales', () => {
      const openingCash = 1000;
      const transactions = [
        createTransaction('1', 's1', 'sale_cash', 500),
        createTransaction('2', 's1', 'sale_transfer', 700),
      ];

      const summary = getSessionSummary(transactions, openingCash);

      expect(summary.expectedCash).toBe(1500);
      expect(summary.grossSales).toBe(1200);
      expect(summary.salesCash).toBe(500);
      expect(summary.salesTransfer).toBe(700);
    });

    it('3. Expenses', () => {
      const openingCash = 1000;
      const transactions = [
        createTransaction('1', 's1', 'expense', 200),
      ];

      const summary = getSessionSummary(transactions, openingCash);

      expect(summary.expectedCash).toBe(800);
      expect(summary.expenses).toBe(200);
    });

    it('4. Withdrawals', () => {
      const openingCash = 1000;
      const transactions = [
        createTransaction('1', 's1', 'cash_withdrawal', 300),
      ];

      const summary = getSessionSummary(transactions, openingCash);

      expect(summary.expectedCash).toBe(700);
      expect(summary.withdrawals).toBe(300);
    });

    it('5. Refund cash', () => {
      const openingCash = 1000;
      const transactions = [
        createTransaction('1', 's1', 'refund_cash', 250),
      ];

      const summary = getSessionSummary(transactions, openingCash);

      expect(summary.expectedCash).toBe(750);
      expect(summary.refundsCash).toBe(250);
    });

    it('6. Deposit', () => {
      const openingCash = 1000;
      const transactions = [
        createTransaction('1', 's1', 'cash_deposit', 400),
      ];

      const summary = getSessionSummary(transactions, openingCash);

      expect(summary.expectedCash).toBe(1400);
      expect(summary.deposits).toBe(400);
    });

    it('7. Full mixed scenario', () => {
      const openingCash = 5000;
      const transactions = [
        createTransaction('1', 's1', 'sale_cash', 2000),
        createTransaction('2', 's1', 'sale_transfer', 3000),
        createTransaction('3', 's1', 'expense', 500),
        createTransaction('4', 's1', 'cash_withdrawal', 1000),
        createTransaction('5', 's1', 'refund_cash', 200),
        createTransaction('6', 's1', 'cash_adjustment_plus', 100),
        createTransaction('7', 's1', 'cash_adjustment_minus', 50),
      ];

      const summary = getSessionSummary(transactions, openingCash);

      // Sales
      expect(summary.salesCash).toBe(2000);
      expect(summary.salesTransfer).toBe(3000);
      expect(summary.grossSales).toBe(5000);

      // Outflows
      expect(summary.expenses).toBe(500);
      expect(summary.withdrawals).toBe(1000);
      expect(summary.refundsCash).toBe(200);
      expect(summary.totalOutflows).toBe(1700);

      // Adjustments
      expect(summary.adjustmentsPlus).toBe(100);
      expect(summary.adjustmentsMinus).toBe(50);

      // Expected cash calculation:
      // 5000 + 2000 + 0 + 100 - 500 - 1000 - 200 - 50 = 5350
      expect(summary.expectedCash).toBe(5350);

      // Net revenue:
      // 5000 - 500 - 200 = 4300
      expect(summary.netRevenue).toBe(4300);
    });

    it('8. Deleted records ignored', () => {
      const openingCash = 1000;
      const transactions: Transaction[] = [
        { id: '1', sessionId: 's1', type: 'sale_cash', amount: 500, createdAt: '', deletedAt: undefined },
        { id: '2', sessionId: 's1', type: 'sale_cash', amount: 300, createdAt: '', deletedAt: new Date().toISOString() },
      ];

      const summary = getSessionSummary(transactions, openingCash);

      // Only first transaction counted (500), second deleted ignored
      expect(summary.expectedCash).toBe(1500);
      expect(summary.salesCash).toBe(500);
    });
  });
});