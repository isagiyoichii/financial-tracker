'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Define Transaction type
interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: Timestamp;
  description: string;
  type: 'income' | 'expense';
  userId: string;
}

export default function TransactionAnalytics() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'3m' | '6m' | '1y'>('3m');
  
  // Animation variants for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!auth.currentUser) return;
      
      setLoading(true);
      
      try {
        let startDate;
        const endDate = new Date();
        
        // Determine start date based on selected time frame
        if (timeFrame === '3m') {
          startDate = subMonths(new Date(), 3);
        } else if (timeFrame === '6m') {
          startDate = subMonths(new Date(), 6);
        } else {
          startDate = subMonths(new Date(), 12);
        }
        
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', auth.currentUser.uid),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate))
        );
        
        const querySnapshot = await getDocs(q);
        const transactionsData: Transaction[] = [];
        
        querySnapshot.forEach((doc) => {
          transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [timeFrame]);

  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netCashflow = totalIncome - totalExpenses;
  
  // Prepare data for category breakdown chart
  const expensesByCategory = transactions
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
          'rgba(199, 199, 199, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for monthly comparison chart
  const getMonthlyData = () => {
    const months: { [key: string]: { income: number; expense: number } } = {};
    
    // Initialize months in selected timeframe
    let startMonth;
    if (timeFrame === '3m') startMonth = subMonths(new Date(), 3);
    else if (timeFrame === '6m') startMonth = subMonths(new Date(), 6);
    else startMonth = subMonths(new Date(), 12);
    
    let currentDate = startMonth;
    const today = new Date();
    
    while (currentDate <= today) {
      const monthKey = format(currentDate, 'MMM yyyy');
      months[monthKey] = { income: 0, expense: 0 };
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    // Fill with actual data
    transactions.forEach(transaction => {
      const monthKey = format(transaction.date.toDate(), 'MMM yyyy');
      if (months[monthKey]) {
        if (transaction.type === 'income') {
          months[monthKey].income += transaction.amount;
        } else {
          months[monthKey].expense += transaction.amount;
        }
      }
    });
    
    return months;
  };
  
  const monthlyData = getMonthlyData();
  
  const barChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(monthlyData).map(m => m.income),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: Object.values(monthlyData).map(m => m.expense),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Cash flow trend data
  const cashflowData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Net Cashflow',
        data: Object.values(monthlyData).map(m => m.income - m.expense),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-3xl font-bold mb-6 text-gray-800"
        variants={itemVariants}
      >
        Transaction Analytics
      </motion.h1>

      {/* Time frame selector */}
      <motion.div 
        className="mb-8 flex space-x-2"
        variants={itemVariants}
      >
        <button 
          onClick={() => setTimeFrame('3m')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            timeFrame === '3m' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CalendarIcon className="h-4 w-4 mr-1" /> 
          3 Months
        </button>
        <button 
          onClick={() => setTimeFrame('6m')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            timeFrame === '6m' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CalendarIcon className="h-4 w-4 mr-1" /> 
          6 Months
        </button>
        <button 
          onClick={() => setTimeFrame('1y')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            timeFrame === '1y' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CalendarIcon className="h-4 w-4 mr-1" /> 
          1 Year
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center mb-4">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-700">Total Income</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center mb-4">
            <ArrowTrendingDownIcon className="h-8 w-8 text-red-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-700">Total Expenses</h3>
          </div>
          <p className="text-3xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center mb-4">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
              netCashflow >= 0 ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
            }`}>
              {netCashflow >= 0 ? 
                <ArrowTrendingUpIcon className="h-5 w-5" /> : 
                <ArrowTrendingDownIcon className="h-5 w-5" />
              }
            </div>
            <h3 className="text-xl font-semibold text-gray-700">Net Cashflow</h3>
          </div>
          <p className={`text-3xl font-bold ${
            netCashflow >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            ${Math.abs(netCashflow).toFixed(2)}
            <span className="text-sm ml-1">
              {netCashflow >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </p>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Monthly Comparison</h3>
          <div className="h-80">
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Expense Breakdown</h3>
          {Object.keys(expensesByCategory).length > 0 ? (
            <div className="h-80">
              <Pie 
                data={pieChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">No expense data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cashflow Trend */}
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Cashflow Trend</h3>
        <div className="h-80">
          <Line 
            data={cashflowData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                y: {
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  }
                },
                x: {
                  grid: {
                    display: false,
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Financial Insights</h3>
        
        <div className="space-y-4">
          {netCashflow < 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-700 font-medium">
                Warning: Your expenses (${totalExpenses.toFixed(2)}) exceed your income (${totalIncome.toFixed(2)}) by ${Math.abs(netCashflow).toFixed(2)}.
                Consider reviewing your budget to reduce expenses.
              </p>
            </div>
          )}
          
          {netCashflow > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-green-700 font-medium">
                Great job! You have a positive cash flow of ${netCashflow.toFixed(2)}.
                Consider investing your surplus for long-term growth.
              </p>
            </div>
          )}
          
          {Object.entries(expensesByCategory).length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-700 font-medium mb-2">Top spending categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(expensesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([category, amount], index) => (
                    <li key={index} className="text-gray-700">
                      {category}: ${amount.toFixed(2)} ({((amount / totalExpenses) * 100).toFixed(1)}% of total expenses)
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 