import { Timestamp } from 'firebase/firestore';

// Transaction interface
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Timestamp;
  type: 'income' | 'expense';
  paymentMethod: string;
  createdAt: Timestamp;
}

// Budget interface
export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Asset interface
export interface Asset {
  id: string;
  userId: string;
  name: string;
  value: number;
  type: string;
  description?: string;
  purchaseDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  icon?: string;
}

// Liability interface
export interface Liability {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: string;
  interestRate?: number;
  description?: string;
  dueDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  icon?: string;
}

// Currency type
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  locale: string;
  flag: string;
}

// Declare module definitions for libraries without type declarations
declare module 'date-fns';
declare module 'tailwind-merge';
declare module 'clsx'; 