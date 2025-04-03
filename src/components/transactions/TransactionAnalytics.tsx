'use client';

import React, { useState, useMemo } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

interface TransactionAnalyticsProps {
  transactions: Transaction[];
}

type ChartType = 'monthly' | 'category' | 'trends' | 'balance';

// Utility function to safely convert Firebase Timestamp or Date to JavaScript Date
const toJsDate = (date: Date | Timestamp): Date => {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return date;
};

const TransactionAnalytics: React.FC<TransactionAnalyticsProps> = ({ transactions }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('monthly');
  
  // Get current month's data
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    // Get all days in the month
    const days = eachDayOfInterval({ start, end });
    
    // Initialize data for each day
    const dailyExpenses = days.map(day => ({
      date: day,
      expenses: 0,
      income: 0
    }));
    
    // Populate data with actual transactions
    transactions.forEach(transaction => {
      const transactionDate = toJsDate(transaction.date);
      
      // Only include transactions from the current month
      if (transactionDate >= start && transactionDate <= end) {
        const dayIndex = dailyExpenses.findIndex(day => 
          isSameDay(day.date, transactionDate)
        );
        
        if (dayIndex !== -1) {
          if (transaction.type === 'expense') {
            dailyExpenses[dayIndex].expenses += transaction.amount;
          } else {
            dailyExpenses[dayIndex].income += transaction.amount;
          }
        }
      }
    });
    
    return dailyExpenses;
  }, [transactions]);
  
  // Get category distribution data
  const categoryData = useMemo(() => {
    const categories: Record<string, { expenses: number; income: number }> = {};
    
    transactions.forEach(transaction => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = { expenses: 0, income: 0 };
      }
      
      if (transaction.type === 'expense') {
        categories[transaction.category].expenses += transaction.amount;
      } else {
        categories[transaction.category].income += transaction.amount;
      }
    });
    
    return categories;
  }, [transactions]);
  
  // Get monthly trends data
  const trendData = useMemo(() => {
    const monthlyTotals: Record<string, { expenses: number; income: number }> = {};
    
    transactions.forEach(transaction => {
      const date = toJsDate(transaction.date);
      const monthKey = format(date, 'MMM yyyy');
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { expenses: 0, income: 0 };
      }
      
      if (transaction.type === 'expense') {
        monthlyTotals[monthKey].expenses += transaction.amount;
      } else {
        monthlyTotals[monthKey].income += transaction.amount;
      }
    });
    
    const months = Object.keys(monthlyTotals);
    months.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
    
    return months.map(month => ({
      month,
      ...monthlyTotals[month]
    }));
  }, [transactions]);
  
  // Calculate summary statistics
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let biggestExpense = { amount: 0, category: '', description: '' };
    let biggestIncome = { amount: 0, category: '', description: '' };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        totalExpenses += transaction.amount;
        if (transaction.amount > biggestExpense.amount) {
          biggestExpense = {
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description
          };
        }
      } else {
        totalIncome += transaction.amount;
        if (transaction.amount > biggestIncome.amount) {
          biggestIncome = {
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description
          };
        }
      }
    });
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      biggestExpense,
      biggestIncome,
      transactionCount: transactions.length
    };
  }, [transactions]);
  
  // Generate Monthly Balance Data
  const balanceData = useMemo(() => {
    const monthlySummary = trendData.map(item => ({
      month: item.month,
      income: item.income,
      expenses: item.expenses,
      balance: item.income - item.expenses
    }));
    
    return monthlySummary;
  }, [trendData]);
  
  // Monthly spending chart
  const monthlyChart: ChartData<'bar'> = {
    labels: currentMonthData.map(day => format(day.date, 'd')),
    datasets: [
      {
        label: 'Expenses',
        data: currentMonthData.map(day => day.expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Income',
        data: currentMonthData.map(day => day.income),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };
  
  // Category distribution chart
  const categoryChart: ChartData<'doughnut'> = {
    labels: Object.keys(categoryData).filter(cat => categoryData[cat].expenses > 0),
    datasets: [
      {
        data: Object.keys(categoryData)
          .filter(cat => categoryData[cat].expenses > 0)
          .map(cat => categoryData[cat].expenses),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Monthly trend chart
  const trendChart: ChartData<'line'> = {
    labels: trendData.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: trendData.map(item => item.income),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: trendData.map(item => item.expenses),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      }
    ],
  };
  
  // Chart options
  const monthlyOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Daily Transactions - ${format(new Date(), 'MMMM yyyy')}`,
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };
  
  const categoryOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Expense Categories',
      },
    }
  };
  
  const trendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Trends',
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };
  
  // For mixed chart (bar & line)
  const balanceOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Income vs Expenses',
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };
  
  // Mixed chart data for balance
  const balanceChartData = {
    labels: balanceData.map(item => item.month),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Income',
        data: balanceData.map(item => item.income),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderRadius: 8,
        order: 2,
      },
      {
        type: 'bar' as const,
        label: 'Expenses',
        data: balanceData.map(item => item.expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderRadius: 8,
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Net Balance',
        data: balanceData.map(item => item.balance),
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointRadius: 4,
        fill: false,
        tension: 0.4,
        order: 1,
      }
    ],
  };
  
  return (
    <div className="space-y-8">
      {/* Chart selection buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeChart === 'monthly' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveChart('monthly')}
        >
          Monthly Overview
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeChart === 'category' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveChart('category')}
        >
          Category Breakdown
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeChart === 'trends' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveChart('trends')}
        >
          Monthly Trends
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeChart === 'balance' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveChart('balance')}
        >
          Income vs Expenses
        </button>
      </div>
      
      {/* Chart Display */}
      <div className="h-80">
        {activeChart === 'monthly' && (
          <Bar options={monthlyOptions} data={monthlyChart} />
        )}
        {activeChart === 'category' && (
          <Doughnut options={categoryOptions} data={categoryChart} />
        )}
        {activeChart === 'trends' && (
          <Line options={trendOptions} data={trendChart} />
        )}
        {activeChart === 'balance' && (
          <Bar 
            options={balanceOptions} 
            data={balanceChartData as any} 
          />
        )}
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Income</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Expenses</h3>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Balance</h3>
          <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(stats.balance)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Savings Rate</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.savingsRate.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionAnalytics; 