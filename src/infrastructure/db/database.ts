import Dexie, { type EntityTable } from 'dexie';
import type {
  Branch,
  CashSession,
  Transaction,
  OperationalMovement,
  Report,
} from '@/domain/entities';

const db = new Dexie('CashOperationsDB') as Dexie & {
  branches: EntityTable<Branch, 'id'>;
  cashSessions: EntityTable<CashSession, 'id'>;
  transactions: EntityTable<Transaction, 'id'>;
  operationalMovements: EntityTable<OperationalMovement, 'id'>;
  reports: EntityTable<Report, 'id'>;
};

db.version(1).stores({
  branches: 'id, name, code, active, createdAt',
  cashSessions: 'id, branchId, name, openedAt, closedAt, status, createdAt',
  transactions: 'id, sessionId, type, createdAt',
  operationalMovements: 'id, sessionId, branchId, type, createdAt',
  reports: 'id, type, createdAt',
});

export { db };