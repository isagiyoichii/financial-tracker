export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO date string
  description: string;
  type: TransactionType;
  paymentMethod?: string;
  tags?: string[];
  recurrence?: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  location?: string;
  notes?: string;
} 