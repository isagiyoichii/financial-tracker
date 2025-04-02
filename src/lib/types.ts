// User related types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  currency: string;
}

// Transaction related types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Budget related types
export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Net Worth related types
export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'investment' | 'real_estate' | 'vehicle' | 'cryptocurrency' | 'other';
  value: number;
  description?: string;
  location?: string;
  growthRate?: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Liability {
  id: string;
  userId: string;
  name: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  amount: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category related types
export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Goal related types
export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category?: string;
  icon?: string;
  color?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Investment related types
export interface Investment {
  id: string;
  userId: string;
  type: 'stock' | 'mutual_fund' | 'etf' | 'bond' | 'crypto' | 'other';
  name: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 