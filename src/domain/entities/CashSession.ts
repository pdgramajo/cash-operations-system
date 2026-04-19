export type CashSessionStatus = 'open' | 'closed';

export interface CashSession {
  readonly id: string;
  readonly branchId: string;
  readonly name: string;
  readonly openedAt: string;
  readonly closedAt?: string;
  readonly openingCash: number;
  readonly closingCash?: number;
  readonly status: CashSessionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}