export type OperationalMovementType = 'incoming' | 'outgoing' | 'transfer' | 'note';

export interface OperationalMovement {
  readonly id: string;
  readonly sessionId: string;
  readonly branchId: string;
  readonly type: OperationalMovementType;
  readonly description: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly createdAt: string;
}