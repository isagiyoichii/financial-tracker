'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/auth-context';
import Card from '@/components/ui/Card';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Transaction, Budget, Asset, Liability } from '@/lib/types';
import { 
  formatCurrency, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateNetIncome,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
  toJsDate,
  formatDate
} from '@/lib/utils';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  BanknotesIcon, 
  ScaleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

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

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setAssets(assetsData);
        setLiabilities(liabilitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // For demo purposes, create mock data if no real data is available
  useEffect(() => {
    if (!isLoading && transactions.length === 0 && budgets.length === 0 && assets.length === 0 && liabilities.length === 0) {
      // Create mock data for demonstration
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          userId: user?.uid || '',
          amount: 3000,
          type: 'income',
          category: 'Salary',
          description: 'Monthly salary',
          date: new Date('2023-04-01'),
          isRecurring: true,
          recurringPeriod: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: user?.uid || '',
          amount: 1200,
          type: 'expense',
          category: 'Rent',
          description: 'Monthly rent',
          date: new Date('2023-04-03'),
          isRecurring: true,
          recurringPeriod: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          userId: user?.uid || '',
          amount: 150,
          type: 'expense',
          category: 'Groceries',
          description: 'Weekly groceries',
          date: new Date('2023-04-05'),
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          userId: user?.uid || '',
          amount: 50,
          type: 'expense',
          category: 'Dining',
          description: 'Dinner with friends',
          date: new Date('2023-04-07'),
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          userId: user?.uid || '',
          amount: 100,
          type: 'expense',
          category: 'Utilities',
          description: 'Electricity bill',
          date: new Date('2023-04-10'),
          isRecurring: true,
          recurringPeriod: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockBudgets: Budget[] = [
        {
          id: '1',
          userId: user?.uid || '',
          name: 'Monthly Rent',
          category: 'Rent',
          amount: 1500,
          period: 'monthly',
          startDate: new Date('2023-04-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: user?.uid || '',
          name: 'Grocery Budget',
          category: 'Groceries',
          amount: 600,
          period: 'monthly',
          startDate: new Date('2023-04-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          userId: user?.uid || '',
          name: 'Eating Out',
          category: 'Dining',
          amount: 200,
          period: 'monthly',
          startDate: new Date('2023-04-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          userId: user?.uid || '',
          name: 'Utility Bills',
          category: 'Utilities',
          amount: 150,
          period: 'monthly',
          startDate: new Date('2023-04-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockAssets: Asset[] = [
        {
          id: '1',
          userId: user?.uid || '',
          name: 'Checking Account',
          type: 'bank',
          value: 5000,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: user?.uid || '',
          name: 'Savings Account',
          type: 'bank',
          value: 10000,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          userId: user?.uid || '',
          name: 'Investments',
          type: 'investment',
          value: 25000,
          growthRate: 7,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockLiabilities: Liability[] = [
        {
          id: '1',
          userId: user?.uid || '',
          name: 'Credit Card',
          type: 'credit_card',
          amount: 2000,
          interestRate: 18,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: user?.uid || '',
          name: 'Student Loan',
          type: 'student_loan',
          amount: 15000,
          interestRate: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setTransactions(mockTransactions);
      setBudgets(mockBudgets);
      setAssets(mockAssets);
      setLiabilities(mockLiabilities);
    }
  }, [isLoading, transactions, budgets, assets, liabilities, user]);

  // Prepare chart data
  const expenseCategories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          '#6366f1', // indigo-500
          '#8b5cf6', // violet-500
          '#ec4899', // pink-500
          '#f43f5e', // rose-500
          '#f97316', // orange-500
          '#eab308', // yellow-500
          '#22c55e', // green-500
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for spending trend (in a real app, this would be from backend)
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [2800, 3200, 3000, 3500, 3200, 3800],
        borderColor: '#22c55e', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Expenses',
        data: [2100, 2300, 1900, 2500, 2200, 2400],
        borderColor: '#f43f5e', // rose-500
        backgroundColor: 'rgba(244, 63, 94, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const netIncome = calculateNetIncome(transactions);
  const totalAssets = calculateTotalAssets(assets);
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  const netWorth = calculateNetWorth(assets, liabilities);

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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-gray-700 dark:text-gray-300">Loading your financial data...</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Financial summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Pie 
                    data={pieChartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card title="Income vs Expenses Trend" className="h-full">
                <div className="h-64">
                  <Line 
                    data={lineChartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(243, 244, 246, 0.1)' : 'rgba(55, 65, 81, 0.1)',
                          }
                        },
                        x: {
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(243, 244, 246, 0.1)' : 'rgba(55, 65, 81, 0.1)',
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent transactions */}
          <motion.div variants={item}>
            <Card title="Recent Transactions" icon={<ClockIcon className="h-6 w-6" />}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.slice(0, 5).map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date, 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.category}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard; 