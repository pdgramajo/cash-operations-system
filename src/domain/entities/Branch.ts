export interface Branch {
  readonly id: string;
  readonly name: string;
  readonly code?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}