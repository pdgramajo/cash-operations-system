import Dexie, { type EntityTable } from 'dexie';

export interface Branch {
  id?: number;
  name: string;
  code?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CashSessionStatus = 'open' | 'closed';

export interface CashSession {
  id?: number;
  branchId: number;
  name: string;
  openedAt: Date;
  closedAt?: Date;
  openingCash: number;
  closingCash?: number;
  status: CashSessionStatus;
}

export type TransactionType =
  | 'sale_cash'
  | 'sale_transfer'
  | 'expense'
  | 'cash_withdrawal'
  | 'cash_deposit'
  | 'refund'
  | 'adjustment';

export interface Transaction {
  id?: number;
  sessionId: number;
  type: TransactionType;
  amount: number;
  note?: string;
  recipientName?: string;
  recipientType?: string;
  createdAt: Date;
}

export type MovementType = 'incoming' | 'outgoing' | 'transfer' | 'note';

export interface Movement {
  id?: number;
  sessionId: number;
  branchId: number;
  type: MovementType;
  description: string;
  quantity?: number;
  unit?: string;
  createdAt: Date;
}

export interface Report {
  id?: number;
  type: string;
  createdAt: Date;
  payload: unknown;
}

const db = new Dexie('CashOperationsDB') as Dexie & {
  branches: EntityTable<Branch, 'id'>;
  cashSessions: EntityTable<CashSession, 'id'>;
  transactions: EntityTable<Transaction, 'id'>;
  movements: EntityTable<Movement, 'id'>;
  reports: EntityTable<Report, 'id'>;
};

db.version(1).stores({
  branches: '++id, name, code, active, createdAt',
  cashSessions: '++id, branchId, openedAt, closedAt, status',
  transactions: '++id, sessionId, type, createdAt',
  movements: '++id, sessionId, branchId, type, createdAt',
  reports: '++id, type, createdAt',
});

export { db };