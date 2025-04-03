'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/auth-context';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { formatCurrency, calculateNetWorth, toJsDate, formatDate } from '@/lib/utils';
import { Transaction, Asset, Liability, Budget } from '@/lib/types';

import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  BanknotesIcon, 
  ScaleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch recent transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        setTransactions(transactionsData);

        // Fetch budgets
        const budgetsQuery = query(
          collection(db, 'budgets'),
          where('userId', '==', user.uid)
        );
        const budgetsSnapshot = await getDocs(budgetsQuery);
        const budgetsData = budgetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Budget[];
        setBudgets(budgetsData);

        // Fetch assets
        const assetsQuery = query(
          collection(db, 'assets'),
          where('userId', '==', user.uid)
        );
        const assetsSnapshot = await getDocs(assetsQuery);
        const assetsData = assetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Asset[];
        setAssets(assetsData);

        // Fetch liabilities
        const liabilitiesQuery = query(
          collection(db, 'liabilities'),
          where('userId', '==', user.uid)
        );
        const liabilitiesSnapshot = await getDocs(liabilitiesQuery);
        const liabilitiesData = liabilitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Liability[];
        setLiabilities(liabilitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate summary statistics
  const currentMonth = new Date();
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = toJsDate(transaction.date);
    if (!transactionDate) return false;
    
    return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
  });

  // Calculate totals
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netIncome = totalIncome - totalExpenses;
  
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Prepare data for expense breakdown chart
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc: {[key: string]: number}, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = 0;
      }
      acc[curr.category] += curr.amount;
      return acc;
    }, {});

  const pieChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for income/expense trend chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), i);
    return format(month, 'MMM yyyy');
  }).reverse();

  const monthlyData = last6Months.reduce((acc, month) => {
    acc[month] = { income: 0, expense: 0 };
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  transactions.forEach(transaction => {
    const jsDate = toJsDate(transaction.date);
    if (!jsDate) return;
    
    const month = format(jsDate, 'MMM yyyy');
    if (monthlyData[month]) {
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    }
  });

  const lineChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(monthlyData).map(m => m.income),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: Object.values(monthlyData).map(m => m.expense),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Get budget progress
  const getBudgetProgress = (budget: Budget) => {
    const relevantTransactions = transactions.filter(t => {
      const transactionDate = toJsDate(t.date);
      if (!transactionDate) return false;
      
      return (
        t.type === 'expense' && 
        t.category === budget.category &&
        transactionDate >= startOfCurrentMonth &&
        transactionDate <= endOfCurrentMonth
      );
    });
    
    const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentSpent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      spent,
      percentSpent,
      remaining: budget.amount - spent
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading your financial data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard
        </h1>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Financial summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item}>
            <Card
              title="Income"
              subtitle="This month"
              icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
              className="h-full"
            >
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card
              title="Expenses"
              subtitle="This month"
              icon={<ArrowTrendingDownIcon className="h-6 w-6" />}
              className="h-full"
            >
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalExpenses)}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card
              title="Net Cash Flow"
              subtitle="Income - Expenses"
              icon={<BanknotesIcon className="h-6 w-6" />}
              className="h-full"
            >
              <p className={`text-2xl font-bold ${
                netIncome >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(netIncome)}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card
              title="Net Worth"
              subtitle="Assets - Liabilities"
              icon={<ScaleIcon className="h-6 w-6" />}
              className="h-full"
            >
              <p className={`text-2xl font-bold ${
                netWorth >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(netWorth)}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Chart section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <Card title="Expense Breakdown" className="h-full">
              <div className="h-64">
                {Object.keys(expensesByCategory).length > 0 ? (
                  <Pie 
                    data={pieChartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                          }
                        }
                      }
                    }} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No expense data available</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card title="Income vs Expenses" subtitle="Last 6 months" className="h-full">
              <div className="h-64">
                <Line 
                  data={lineChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          color: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                        }
                      }
                    }
                  }} 
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Budget progress section */}
        <motion.div variants={item}>
          <Card title="Budget Progress" subtitle="Current month">
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map(budget => {
                  const progress = getBudgetProgress(budget);
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">{budget.category}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(progress.spent)} of {formatCurrency(budget.amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            progress.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {progress.remaining >= 0 ? 'Remaining: ' : 'Over budget: '}
                            {formatCurrency(Math.abs(progress.remaining))}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            progress.percentSpent > 100 
                              ? 'bg-rose-600'
                              : progress.percentSpent > 80
                                ? 'bg-amber-500'
                                : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(progress.percentSpent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-end mt-4">
                  <Link href="/budgeting">
                    <Button variant="ghost" size="sm" icon={<ArrowRightIcon className="h-4 w-4" />} iconPosition="right">
                      View All Budgets
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-gray-500 dark:text-gray-400">You haven't set up any budgets yet</p>
                <Link href="/budgeting">
                  <Button variant="primary" size="sm">
                    Create Budget
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent transactions section */}
        <motion.div variants={item}>
          <Card title="Recent Transactions" subtitle="Last 10 transactions">
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.category}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatDate(transaction.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Link href="/transactions">
                    <Button variant="ghost" size="sm" icon={<ArrowRightIcon className="h-4 w-4" />} iconPosition="right">
                      View All Transactions
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-gray-500 dark:text-gray-400">You haven't recorded any transactions yet</p>
                <Link href="/transactions">
                  <Button variant="primary" size="sm">
                    Add Transaction
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Net worth section */}
        <motion.div variants={item}>
          <Card title="Net Worth" subtitle="Assets and Liabilities">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Assets</h3>
                {assets.length > 0 ? (
                  <div className="space-y-3">
                    {assets.slice(0, 3).map(asset => (
                      <div key={asset.id} className="flex justify-between items-center">
                        <p className="text-gray-700 dark:text-gray-300">{asset.name}</p>
                        <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(asset.value)}</p>
                      </div>
                    ))}
                    {assets.length > 3 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-right italic">
                        +{assets.length - 3} more assets
                      </p>
                    )}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center font-medium">
                        <p className="text-gray-800 dark:text-gray-200">Total Assets</p>
                        <p className="text-green-600 dark:text-green-400">{formatCurrency(totalAssets)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 py-4">No assets recorded yet</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Liabilities</h3>
                {liabilities.length > 0 ? (
                  <div className="space-y-3">
                    {liabilities.slice(0, 3).map(liability => (
                      <div key={liability.id} className="flex justify-between items-center">
                        <p className="text-gray-700 dark:text-gray-300">{liability.name}</p>
                        <p className="font-medium text-rose-600 dark:text-rose-400">{formatCurrency(liability.amount)}</p>
                      </div>
                    ))}
                    {liabilities.length > 3 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-right italic">
                        +{liabilities.length - 3} more liabilities
                      </p>
                    )}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center font-medium">
                        <p className="text-gray-800 dark:text-gray-200">Total Liabilities</p>
                        <p className="text-rose-600 dark:text-rose-400">{formatCurrency(totalLiabilities)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 py-4">No liabilities recorded yet</p>
                )}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">Net Worth</p>
                <p className={`text-xl font-semibold ${
                  netWorth >= 0 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <Link href="/networth">
                  <Button variant="ghost" size="sm" icon={<ArrowRightIcon className="h-4 w-4" />} iconPosition="right">
                    Manage Net Worth
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 