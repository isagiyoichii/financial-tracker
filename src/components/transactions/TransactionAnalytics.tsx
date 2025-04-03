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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Transaction } from '@/types/transaction';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TransactionAnalyticsProps {
  transactions: Transaction[];
}

type ChartType = 'monthly' | 'category' | 'trends' | 'balance';

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
      const transactionDate = new Date(transaction.date);
      
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
      const date = new Date(transaction.date);
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
  
  const monthlyOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Daily Transactions - ${format(new Date(), 'MMMM yyyy')}`,
        font: {
          family: 'SF Pro Display, system-ui, sans-serif',
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        bodyFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        },
        ticks: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
          },
          callback: function(value) {
            return '$' + value;
          }
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  
  // Category distribution chart
  const categoryChart: ChartData<'doughnut'> = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: 'Expenses',
        data: Object.values(categoryData).map(cat => cat.expenses),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(78, 181, 104, 0.7)',
          'rgba(225, 78, 202, 0.7)',
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
          'rgba(78, 181, 104, 1)',
          'rgba(225, 78, 202, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const categoryOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Spending by Category',
        font: {
          family: 'SF Pro Display, system-ui, sans-serif',
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        bodyFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  
  // Trend chart
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
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: trendData.map(item => item.expenses),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  
  const trendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Trends',
        font: {
          family: 'SF Pro Display, system-ui, sans-serif',
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        bodyFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        },
        ticks: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
          },
          callback: function(value) {
            return '$' + value;
          }
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  
  // Balance chart
  const balanceChart: ChartData<'bar'> = {
    labels: ['Income vs Expenses'],
    datasets: [
      {
        label: 'Income',
        data: [stats.totalIncome],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: [stats.totalExpenses],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };
  
  const balanceOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Income vs Expenses Overview',
        font: {
          family: 'SF Pro Display, system-ui, sans-serif',
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        bodyFont: {
          family: 'SF Pro Display, system-ui, sans-serif',
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        },
        ticks: {
          font: {
            family: 'SF Pro Display, system-ui, sans-serif',
          },
          callback: function(value) {
            return '$' + value;
          }
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Balance</h3>
          <p className={`text-xl font-bold ${stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${stats.balance.toFixed(2)}
          </p>
          <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Savings Rate: {stats.savingsRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Income</h3>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            ${stats.totalIncome.toFixed(2)}
          </p>
          {stats.biggestIncome.amount > 0 && (
            <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Largest: ${stats.biggestIncome.amount.toFixed(2)} ({stats.biggestIncome.category})
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Expenses</h3>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            ${stats.totalExpenses.toFixed(2)}
          </p>
          {stats.biggestExpense.amount > 0 && (
            <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Largest: ${stats.biggestExpense.amount.toFixed(2)} ({stats.biggestExpense.category})
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Transactions</h3>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.transactionCount}
          </p>
          <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            {format(new Date(), 'MMMM yyyy')}
          </div>
        </div>
      </div>
      
      {/* Chart Selection Tabs */}
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 transition-all duration-500 transform hover:shadow-lg">
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
            <Bar options={balanceOptions} data={balanceChart} />
          )}
        </div>
      </div>
      
      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-indigo-900 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Insights</h3>
          <ul className="space-y-3">
            {stats.savingsRate > 20 && (
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Great job! Your savings rate is above 20%.
                </span>
              </li>
            )}
            {stats.savingsRate < 0 && (
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Your expenses exceed your income. Consider reviewing your budget.
                </span>
              </li>
            )}
            {Object.entries(categoryData).sort((a, b) => b[1].expenses - a[1].expenses)[0] && (
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Your highest spending category is {Object.entries(categoryData).sort((a, b) => b[1].expenses - a[1].expenses)[0][0]}.
                </span>
              </li>
            )}
            {currentMonthData.reduce((sum, day) => sum + day.expenses, 0) === 0 && (
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  No expenses recorded for this month yet.
                </span>
              </li>
            )}
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-indigo-900 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommendations</h3>
          <ul className="space-y-3">
            {stats.savingsRate < 10 && stats.savingsRate >= 0 && (
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Your savings rate is low. Try to increase it to at least 20%.
                </span>
              </li>
            )}
            {stats.transactionCount < 5 && (
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Track more transactions to get better insights.
                </span>
              </li>
            )}
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Set up monthly budget goals for each category.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Use tags to track specific spending habits.
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      {!transactions.length && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No transaction data available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add transactions to see analytics and insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionAnalytics; 