'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/auth-context';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import {
  formatCurrency,
  formatDate,
  calculateBudgetPercentage,
  toJsDate
} from '@/lib/utils';
import { Transaction, Budget } from '@/lib/types';
import { toastSuccess, toastError } from '@/lib/toast';

import {
  BanknotesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Predefined budget categories
const budgetCategories = [
  // Income categories
  'Salary', 'Freelance', 'Investments', 'Gifts', 'Other Income',
  // Expense categories
  'Housing', 'Utilities', 'Groceries', 'Transportation', 'Healthcare',
  'Insurance', 'Dining', 'Entertainment', 'Shopping', 'Personal Care',
  'Education', 'Travel', 'Subscriptions', 'Debt Payments', 'Savings',
  'Investments', 'Charity', 'Miscellaneous'
];

// Budget periods
const budgetPeriods = ['weekly', 'monthly', 'yearly'];

export default function Budgeting() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error',
    message: string
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    isEditing: false,
    currentId: '',
  });

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: '',
      period: 'monthly',
      startDate: '',
      endDate: '',
      isEditing: false,
      currentId: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Fetch budgets and transactions on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch budgets
        const budgetsQuery = query(
          collection(db, 'budgets'),
          where('userId', '==', user.uid)
        );
        const budgetsSnapshot = await getDocs(budgetsQuery);
        const budgetsData: Budget[] = [];

        budgetsSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Budget, 'id'>;
          budgetsData.push({
            id: doc.id,
            ...data
          } as Budget);
        });

        setBudgets(budgetsData);

        // Fetch transactions for budget calculations
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          where('type', '==', 'expense')
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData: Transaction[] = [];

        transactionsSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Transaction, 'id'>;
          transactionsData.push({
            id: doc.id,
            ...data
          } as Transaction);
        });

        setTransactions(transactionsData);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        toastError('Failed to load budgets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate budget progress
  const calculateBudgetProgress = (budget: Budget) => {
    // Filter transactions by category and date range
    const relevantTransactions = transactions.filter(transaction => {
      if (transaction.category !== budget.category) return false;
      
      const transactionDate = toJsDate(transaction.date);
      if (!transactionDate) return false;
      
      const budgetStartDate = toJsDate(budget.startDate);
      if (!budgetStartDate) return false;
      
      const budgetEndDate = budget.endDate ? toJsDate(budget.endDate) : new Date();
      if (!budgetEndDate) return false;
      
      return transactionDate >= budgetStartDate && transactionDate <= budgetEndDate;
    });
    
    // Calculate total spent
    const spent = relevantTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    
    // Calculate percentage spent
    const percentage = (spent / budget.amount) * 100;
    
    return {
      spent,
      percentage,
      remaining: budget.amount - spent
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toastError('You must be logged in to create a budget');
      return;
    }
    
    if (!formData.name || !formData.amount || !formData.category || !formData.startDate) {
      toastError('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      setIsLoading(true);
      
      const budgetData = {
        userId: user.uid,
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        period: formData.period as 'weekly' | 'monthly' | 'yearly',
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        ...(formData.endDate && { endDate: Timestamp.fromDate(new Date(formData.endDate)) }),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      if (formData.isEditing) {
        // Update existing budget
        await updateDoc(doc(db, 'budgets', formData.currentId), {
          ...budgetData,
          updatedAt: Timestamp.now(),
        });
        
        setBudgets(prev => 
          prev.map(budget => 
            budget.id === formData.currentId 
              ? { 
                  ...budget, 
                  ...budgetData, 
                  id: formData.currentId 
                } 
              : budget
          )
        );
        
        toastSuccess('Budget updated successfully');
      } else {
        // Add new budget
        const docRef = await addDoc(collection(db, 'budgets'), {
          ...budgetData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        const newBudget: Budget = {
          ...budgetData,
          id: docRef.id
        };
        
        setBudgets(prev => [...prev, newBudget]);
        
        toastSuccess('Budget created successfully');
      }
      
      // Reset form to initial state
      setFormData({
        name: '',
        amount: '',
        category: '',
        period: 'monthly',
        startDate: '',
        endDate: '',
        isEditing: false,
        currentId: '',
      });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving budget:', error);
      toastError('Failed to save budget');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Handle budget deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'budgets', id));
      
      // Update local state
      setBudgets(prev => prev.filter(b => b.id !== id));
      
      toastSuccess('Budget deleted successfully');
    } catch (err) {
      console.error('Error deleting budget:', err);
      toastError('Failed to delete budget');
    }
  };

  // Edit budget
  const handleEdit = (budget: Budget) => {
    const startDate = toJsDate(budget.startDate)?.toISOString().slice(0, 10) || '';
    const endDate = budget.endDate ? toJsDate(budget.endDate)?.toISOString().slice(0, 10) || '' : '';
    
    setFormData({
      name: budget.name,
      amount: budget.amount.toString(),
      category: budget.category,
      period: budget.period,
      startDate,
      endDate,
      isEditing: true,
      currentId: budget.id,
    });
    
    setEditingId(budget.id);
    setShowForm(true);
  };

  // Update form data
  const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const { spent } = calculateBudgetProgress(budget);
    return sum + spent;
  }, 0);
  const totalRemaining = totalBudget - totalSpent;
  
  // Group budgets by period
  const budgetsByPeriod = budgets.reduce((grouped, budget) => {
    const { period } = budget;
    if (!grouped[period]) {
      grouped[period] = [];
    }
    grouped[period].push(budget);
    return grouped;
  }, {} as Record<string, Budget[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading your budgets...</p>
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
        <div className="flex flex-wrap items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budgeting
          </h1>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              variant="primary"
              icon={<PlusIcon className="h-5 w-5" />}
            >
              Create Budget
            </Button>
          )}
        </div>
      </motion.div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          )}
          {notification.message}
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card title={editingId ? "Edit Budget" : "Create Budget"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Budget Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Monthly Groceries"
                    required
                  />
                </div>

                {/* Budget Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={updateFormData}
                      className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {budgetCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Budget Period */}
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget Period
                  </label>
                  <select
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {budgetPeriods.map(period => (
                      <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* End Date (optional) */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="light"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      amount: '',
                      category: '',
                      period: 'monthly',
                      startDate: '',
                      endDate: '',
                      isEditing: false,
                      currentId: '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  icon={isSubmitting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Budget Card */}
          <motion.div variants={item}>
            <Card
              title="Total Budget"
              subtitle="All periods combined"
              icon={<BanknotesIcon className="h-6 w-6 text-indigo-500" />}
              className="h-full"
            >
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(totalBudget)}
              </p>
            </Card>
          </motion.div>
          
          {/* Total Spent Card */}
          <motion.div variants={item}>
            <Card
              title="Total Spent"
              subtitle="Across all budgets"
              icon={<ArrowPathIcon className="h-6 w-6 text-rose-500" />}
              className="h-full"
            >
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalSpent)}
              </p>
            </Card>
          </motion.div>
          
          {/* Remaining Budget Card */}
          <motion.div variants={item}>
            <Card
              title="Remaining Budget"
              subtitle="Total budget - total spent"
              icon={<BanknotesIcon className="h-6 w-6 text-emerald-500" />}
              className="h-full"
            >
              <p className={`text-2xl font-bold ${
                totalRemaining >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(totalRemaining)}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Budgets by Period */}
        {Object.entries(budgetsByPeriod).map(([period, periodBudgets]) => (
          <motion.div key={period} variants={item}>
            <Card 
              title={`${period.charAt(0).toUpperCase() + period.slice(1)} Budgets`}
              subtitle={`${periodBudgets.length} budget${periodBudgets.length === 1 ? '' : 's'}`}
            >
              <div className="space-y-6">
                {periodBudgets.map(budget => {
                  const progress = calculateBudgetProgress(budget);
                  return (
                    <div key={budget.id} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-wrap justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {budget.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {budget.category} • {formatDate(budget.startDate, 'MMM d, yyyy')}
                            {budget.endDate && ` to ${formatDate(budget.endDate, 'MMM d, yyyy')}`}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="p-1 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="p-1 rounded-md text-gray-500 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {formatCurrency(budget.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                          <p className="font-medium text-rose-600 dark:text-rose-400">
                            {formatCurrency(progress.spent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                          <p className={`font-medium ${
                            progress.remaining >= 0 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {formatCurrency(progress.remaining)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            progress.percentage > 100 
                              ? 'bg-rose-600'
                              : progress.percentage > 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{progress.percentage.toFixed(1)}% spent</span>
                        <span>{(100 - Math.min(progress.percentage, 100)).toFixed(1)}% remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}

        {budgets.length === 0 && (
          <motion.div variants={item}>
            <Card>
              <div className="py-10 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any budgets yet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowForm(true)}
                  icon={<PlusIcon className="h-4 w-4" />}
                >
                  Create Your First Budget
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 