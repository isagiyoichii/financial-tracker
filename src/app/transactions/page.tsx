'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/auth-context';
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
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import {
  formatCurrency,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetIncome,
  toJsDate,
  formatDate
} from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Transaction } from '@/lib/types';

import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

// Define categories
const categories = {
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Rental Income',
    'Business',
    'Gifts',
    'Interest',
    'Other Income'
  ],
  expense: [
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Debt Payments',
    'Entertainment',
    'Shopping',
    'Personal Care',
    'Education',
    'Gifts & Donations',
    'Travel',
    'Subscriptions',
    'Other Expenses'
  ]
};

// Payment methods
const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Mobile Payment',
  'Check',
  'Other'
];

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<{field: string, direction: 'asc' | 'desc'}>({
    field: 'date',
    direction: 'desc'
  });

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    description: ''
  });

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);

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

  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let transactionQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid)
        );

        // Add sorting
        if (sortBy.field) {
          transactionQuery = query(
            transactionQuery,
            orderBy(sortBy.field, sortBy.direction)
          );
        }

        const querySnapshot = await getDocs(transactionQuery);
        const transactionData: Transaction[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Transaction, 'id'>;
          transactionData.push({
            id: doc.id,
            ...data
          } as Transaction);
        });

        setTransactions(transactionData);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user, sortBy]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.amount || !formData.category || !formData.date) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const amount = parseFloat(formData.amount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      
      // Create transaction object
      const transactionData = {
        userId: user.uid,
        type: formData.type,
        amount,
        category: formData.category,
        description: formData.description,
        date: Timestamp.fromDate(new Date(formData.date)),
        paymentMethod: formData.paymentMethod || 'Other',
        createdAt: serverTimestamp()
      };
      
      if (editingId) {
        // Update existing transaction
        await updateDoc(
          doc(db, 'transactions', editingId),
          transactionData
        );
        
        // Update local state
        setTransactions(prev => 
          prev.map(t => 
            t.id === editingId 
              ? { ...transactionData, id: editingId } as Transaction
              : t
          )
        );
        
        setEditingId(null);
      } else {
        // Add new transaction
        const docRef = await addDoc(
          collection(db, 'transactions'),
          transactionData
        );
        
        // Update local state
        setTransactions(prev => [
          { id: docRef.id, ...transactionData } as Transaction,
          ...prev
        ]);
      }
      
      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: '',
        description: ''
      });
      
      setShowForm(false);
    } catch (err) {
      console.error('Error adding/updating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transaction deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'transactions', id));
      
      // Update local state
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  // Edit transaction
  const handleEdit = (transaction: Transaction) => {
    const dateStr = toJsDate(transaction.date)?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10);
    
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: dateStr,
      paymentMethod: transaction.paymentMethod || 'Other',
      description: transaction.description
    });
    
    setEditingId(transaction.id);
    setShowForm(true);
  };

  // Apply filters to transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (typeFilter && transaction.type !== typeFilter) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter && transaction.category !== categoryFilter) {
      return false;
    }
    
    // Filter by date
    if (dateFilter) {
      const jsDate = toJsDate(transaction.date);
      if (!jsDate) return false;
      
      const transactionDateStr = jsDate.toISOString().slice(0, 10);
      if (transactionDateStr !== dateFilter) {
        return false;
      }
    }
    
    return true;
  });

  // Get unique categories from transactions
  const uniqueCategories = [...new Set(transactions.map(t => t.category))].sort();
  
  // Calculate totals for filtered transactions
  const totalIncome = calculateTotalIncome(filteredTransactions);
  const totalExpenses = calculateTotalExpenses(filteredTransactions);
  const balance = totalIncome - totalExpenses;

  // Update form data
  const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setCategoryFilter(null);
    setTypeFilter(null);
    setDateFilter(null);
    setSortBy({ field: 'date', direction: 'desc' });
    setFilterOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading your transactions...</p>
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
            Transactions
          </h1>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              variant="primary"
              icon={<PlusIcon className="h-5 w-5" />}
            >
              Add Transaction
            </Button>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card title={editingId ? "Edit Transaction" : "Add Transaction"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Income</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Expense</span>
                    </label>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
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
                    {formData.type === 'income' ? (
                      categories.income.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))
                    ) : (
                      categories.expense.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Method */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a payment method</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={updateFormData}
                    className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter a description"
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
                      type: 'expense',
                      amount: '',
                      category: '',
                      date: new Date().toISOString().slice(0, 10),
                      paymentMethod: '',
                      description: ''
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
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Add')}
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
          {/* Income Card */}
          <motion.div variants={item}>
            <Card
              title="Income"
              subtitle="Total"
              icon={<ArrowTrendingUpIcon className="h-6 w-6 text-emerald-500" />}
              className="h-full"
            >
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </p>
            </Card>
          </motion.div>
          
          {/* Expenses Card */}
          <motion.div variants={item}>
            <Card
              title="Expenses"
              subtitle="Total"
              icon={<ArrowTrendingDownIcon className="h-6 w-6 text-rose-500" />}
              className="h-full"
            >
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalExpenses)}
              </p>
            </Card>
          </motion.div>
          
          {/* Balance Card */}
          <motion.div variants={item}>
            <Card
              title="Balance"
              subtitle="Income - Expenses"
              icon={<BanknotesIcon className="h-6 w-6 text-indigo-500" />}
              className="h-full"
            >
              <p className={`text-2xl font-bold ${
                balance >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(balance)}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Transactions List */}
        <motion.div variants={item}>
          <Card title="All Transactions">
            <div className="mb-4 flex flex-wrap justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={filterOpen ? "primary" : "light"}
                  onClick={() => setFilterOpen(!filterOpen)}
                  icon={<FunnelIcon className="h-4 w-4" />}
                >
                  Filter
                </Button>
                
                {(typeFilter || categoryFilter || dateFilter) && (
                  <Button
                    size="sm"
                    variant="light"
                    onClick={resetFilters}
                    icon={<XMarkIcon className="h-4 w-4" />}
                  >
                    Clear Filters
                  </Button>
                )}
                
                {(typeFilter || categoryFilter || dateFilter) && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredTransactions.length} results
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <select
                  value={`${sortBy.field}-${sortBy.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortBy({ field, direction: direction as 'asc' | 'desc' });
                  }}
                  className="text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="amount-desc">Amount (High to Low)</option>
                  <option value="amount-asc">Amount (Low to High)</option>
                </select>
              </div>
            </div>
            
            {filterOpen && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={typeFilter || ''}
                      onChange={(e) => setTypeFilter(e.target.value === '' ? null : e.target.value as 'income' | 'expense')}
                      className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryFilter || ''}
                      onChange={(e) => setCategoryFilter(e.target.value === '' ? null : e.target.value)}
                      className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter || ''}
                      onChange={(e) => setDateFilter(e.target.value === '' ? null : e.target.value)}
                      className="block w-full py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer" onClick={() => setSortBy({
                          field: 'date',
                          direction: sortBy.field === 'date' && sortBy.direction === 'desc' ? 'asc' : 'desc'
                        })}>
                          Date
                          {sortBy.field === 'date' && (
                            <ArrowsUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer" onClick={() => setSortBy({
                          field: 'amount',
                          direction: sortBy.field === 'amount' && sortBy.direction === 'desc' ? 'asc' : 'desc'
                        })}>
                          Amount
                          {sortBy.field === 'amount' && (
                            <ArrowsUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {formatDate(transaction.date, 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                          }`}>
                            {transaction.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {transaction.description || '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions found.</p>
                {transactions.length > 0 ? (
                  <Button
                    variant="light"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowForm(true)}
                    icon={<PlusIcon className="h-4 w-4" />}
                  >
                    Add Your First Transaction
                  </Button>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 