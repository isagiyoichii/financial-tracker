import { Transaction, Budget, Asset, Liability } from '@/lib/types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Comprehensive list of currencies with country information
 */
export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union', locale: 'en-EU', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom', locale: 'en-GB', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', locale: 'ja-JP', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada', locale: 'en-CA', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia', locale: 'en-AU', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', country: 'Switzerland', locale: 'de-CH', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China', locale: 'zh-CN', flag: '🇨🇳' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', locale: 'en-IN', flag: '🇮🇳' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil', locale: 'pt-BR', flag: '🇧🇷' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', country: 'Russia', locale: 'ru-RU', flag: '🇷🇺' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea', locale: 'ko-KR', flag: '🇰🇷' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore', locale: 'en-SG', flag: '🇸🇬' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand', locale: 'en-NZ', flag: '🇳🇿' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', country: 'Mexico', locale: 'es-MX', flag: '🇲🇽' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong', locale: 'zh-HK', flag: '🇭🇰' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden', locale: 'sv-SE', flag: '🇸🇪' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa', locale: 'en-ZA', flag: '🇿🇦' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey', locale: 'tr-TR', flag: '🇹🇷' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway', locale: 'no-NO', flag: '🇳🇴' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates', locale: 'ar-AE', flag: '🇦🇪' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark', locale: 'da-DK', flag: '🇩🇰' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', country: 'Poland', locale: 'pl-PL', flag: '🇵🇱' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand', locale: 'th-TH', flag: '🇹🇭' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia', locale: 'id-ID', flag: '🇮🇩' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', country: 'Hungary', locale: 'hu-HU', flag: '🇭🇺' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', country: 'Czech Republic', locale: 'cs-CZ', flag: '🇨🇿' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', country: 'Israel', locale: 'he-IL', flag: '🇮🇱' },
  { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso', country: 'Chile', locale: 'es-CL', flag: '🇨🇱' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines', locale: 'en-PH', flag: '🇵🇭' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', country: 'Argentina', locale: 'es-AR', flag: '🇦🇷' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt', locale: 'ar-EG', flag: '🇪🇬' },
  { code: 'COP', symbol: 'Col$', name: 'Colombian Peso', country: 'Colombia', locale: 'es-CO', flag: '🇨🇴' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia', locale: 'ar-SA', flag: '🇸🇦' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia', locale: 'ms-MY', flag: '🇲🇾' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', country: 'Romania', locale: 'ro-RO', flag: '🇷🇴' }
];

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  });
  
  return formatter.format(amount);
}

/**
 * Format a date as a string
 */
export function formatDate(date: Date | string | Timestamp, formatStr = 'MMM d, yyyy'): string {
  try {
    let jsDate: Date;
    
    if (date instanceof Date) {
      jsDate = date;
    } else if (typeof date === 'string') {
      jsDate = parseISO(date);
    } else if (date instanceof Timestamp) {
      jsDate = date.toDate();
    } else {
      return 'Invalid Date';
    }
    
    return format(jsDate, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Calculate the total income from a list of transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
}

/**
 * Calculate the total expenses from a list of transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
}

/**
 * Calculate the net income from a list of transactions
 */
export function calculateNetIncome(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
}

/**
 * Calculate the total assets value
 */
export function calculateTotalAssets(assets: Asset[]): number {
  return assets.reduce((total, asset) => total + asset.value, 0);
}

/**
 * Calculate the total liabilities value
 */
export function calculateTotalLiabilities(liabilities: Liability[]): number {
  return liabilities.reduce((total, liability) => total + liability.amount, 0);
}

/**
 * Calculate the net worth
 */
export function calculateNetWorth(assets: Asset[], liabilities: Liability[]): number {
  const totalAssets = calculateTotalAssets(assets);
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  
  return totalAssets - totalLiabilities;
}

/**
 * Convert Firebase Timestamp or Date to JavaScript Date
 */
export function toJsDate(timestamp: Timestamp | Date | string | null): Date | null {
  if (!timestamp) return null;
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  } else if (timestamp instanceof Date) {
    return timestamp;
  } else if (typeof timestamp === 'string') {
    return parseISO(timestamp);
  }
  
  return null;
}

/**
 * Calculate the percentage of budget used
 */
export function calculateBudgetPercentage(budget: Budget, transactions: Transaction[]): number {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const relevantTransactions = transactions.filter(transaction => {
    const transactionDate = toJsDate(transaction.date);
    
    // Skip transactions with null dates
    if (!transactionDate) return false;
      
    return (
      transaction.type === 'expense' &&
      transaction.category === budget.category &&
      isWithinInterval(transactionDate, {
        start: monthStart,
        end: monthEnd,
      })
    );
  });
  
  const spent = relevantTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  return (spent / budget.amount) * 100;
}

/**
 * Group transactions by category
 */
export function groupTransactionsByCategory(transactions: any[]): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    const { category, amount, type } = transaction;
    const actualAmount = type === 'expense' ? -Math.abs(amount) : amount;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += actualAmount;
    return acc;
  }, {});
}

/**
 * Generate color based on index
 */
export function getColorByIndex(index: number): string {
  const colors = [
    'rgba(255, 99, 132, 0.8)',   // Red
    'rgba(54, 162, 235, 0.8)',   // Blue
    'rgba(255, 206, 86, 0.8)',   // Yellow
    'rgba(75, 192, 192, 0.8)',   // Green
    'rgba(153, 102, 255, 0.8)',  // Purple
    'rgba(255, 159, 64, 0.8)',   // Orange
    'rgba(199, 199, 199, 0.8)',  // Gray
  ];
  
  return colors[index % colors.length];
}

/**
 * Generate a human-readable, unique class name
 */
export function generateClassName(prefix: string): string {
  return `${prefix}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Calculates the total budget amount
 */
export function calculateTotalBudget(budgets: Budget[]): number {
  return budgets.reduce((sum, budget) => sum + budget.amount, 0);
}

/**
 * Calculates the remaining budget (budget - expenses)
 */
export function calculateRemainingBudget(budget: Budget, transactions: Transaction[]): number {
  const categoryExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' && 
        transaction.category === budget.category
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  return budget.amount - categoryExpenses;
}

/**
 * Groups transactions by category for charts
 */
export function groupTransactionsByType(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce((grouped, transaction) => {
    const category = transaction.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(transaction);
    return grouped;
  }, {} as Record<string, Transaction[]>);
}

/**
 * Generates a unique ID
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Get month name from number (0-11)
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[monthIndex] || '';
}

/**
 * Generate random color for charts
 */
export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
} 