import { Transaction, Budget, Asset, Liability } from './types';

/**
 * Formats a number as currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Formats a date
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  },
  locale: string = 'en-US'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Calculates the total income from an array of transactions
 */
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

/**
 * Calculates the total expenses from an array of transactions
 */
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

/**
 * Calculates the net income (income - expenses)
 */
export const calculateNetIncome = (transactions: Transaction[]): number => {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
};

/**
 * Calculates the total budget amount
 */
export const calculateTotalBudget = (budgets: Budget[]): number => {
  return budgets.reduce((sum, budget) => sum + budget.amount, 0);
};

/**
 * Calculates the remaining budget (budget - expenses)
 */
export const calculateRemainingBudget = (budget: Budget, transactions: Transaction[]): number => {
  const categoryExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' && 
        transaction.category === budget.category
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  return budget.amount - categoryExpenses;
};

/**
 * Calculates budget usage percentage
 */
export const calculateBudgetPercentage = (budget: Budget, transactions: Transaction[]): number => {
  const categoryExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' && 
        transaction.category === budget.category
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  if (budget.amount === 0) return 0;
  
  return Math.min(100, Math.round((categoryExpenses / budget.amount) * 100));
};

/**
 * Calculates total assets value
 */
export const calculateTotalAssets = (assets: Asset[]): number => {
  return assets.reduce((sum, asset) => sum + asset.value, 0);
};

/**
 * Calculates total liabilities amount
 */
export const calculateTotalLiabilities = (liabilities: Liability[]): number => {
  return liabilities.reduce((sum, liability) => sum + liability.amount, 0);
};

/**
 * Calculates net worth (assets - liabilities)
 */
export const calculateNetWorth = (assets: Asset[], liabilities: Liability[]): number => {
  return calculateTotalAssets(assets) - calculateTotalLiabilities(liabilities);
};

/**
 * Groups transactions by category
 */
export const groupTransactionsByCategory = (
  transactions: Transaction[]
): Record<string, Transaction[]> => {
  return transactions.reduce((grouped, transaction) => {
    const category = transaction.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(transaction);
    return grouped;
  }, {} as Record<string, Transaction[]>);
};

/**
 * Generates a unique ID
 */
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Debounce function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}; 