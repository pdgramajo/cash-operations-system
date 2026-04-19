export interface Report {
  readonly id: string;
  readonly type: string;
  readonly createdAt: string;
  readonly payload: unknown;
}