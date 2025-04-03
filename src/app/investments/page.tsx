'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Investment } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  toJsDate
} from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

// Investment types
const investmentTypes = [
  { value: 'stock', label: 'Stocks' },
  { value: 'mutual_fund', label: 'Mutual Funds' },
  { value: 'etf', label: 'ETFs' },
  { value: 'bond', label: 'Bonds' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other' }
];

export default function Investments() {
  const { user } = useAuth();
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  
  // Default color scheme for charts
  const chartColors = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
  ];

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    symbol: '',
    type: 'stock',
    shares: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });

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

  // Fetch investments on component mount
  useEffect(() => {
    const fetchInvestments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const investmentQuery = query(
          collection(db, 'investments'),
          where('userId', '==', user.uid),
          orderBy('purchaseDate', 'desc')
        );

        const querySnapshot = await getDocs(investmentQuery);
        const investmentData: Investment[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Investment, 'id'>;
          investmentData.push({
            id: doc.id,
            ...data
          } as Investment);
        });

        setInvestments(investmentData);
      } catch (err) {
        console.error('Error fetching investments:', err);
        setError('Failed to load investments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestments();
  }, [user]);

  // Calculate total investment value
  const calculateTotalInvestmentValue = (investments: Investment[]) => {
    return investments.reduce((total, investment) => {
      return total + (investment.shares * investment.currentPrice);
    }, 0);
  };

  // Calculate total gain/loss
  const calculateTotalGainLoss = (investments: Investment[]) => {
    return investments.reduce((total, investment) => {
      const costBasis = investment.shares * investment.purchasePrice;
      const currentValue = investment.shares * investment.currentPrice;
      return total + (currentValue - costBasis);
    }, 0);
  };

  // Calculate percentage gain/loss
  const calculatePercentageGainLoss = (investments: Investment[]) => {
    const totalCost = investments.reduce((total, investment) => {
      return total + (investment.shares * investment.purchasePrice);
    }, 0);
    
    const totalValue = calculateTotalInvestmentValue(investments);
    
    if (totalCost === 0) return 0;
    
    return ((totalValue - totalCost) / totalCost) * 100;
  };

  // Prepare chart data
  const investmentChartData = {
    labels: investmentTypes.map(type => type.label),
    datasets: [
      {
        data: investmentTypes.map(type => {
          const filteredInvestments = investments.filter(inv => inv.type === type.value);
          return calculateTotalInvestmentValue(filteredInvestments);
        }),
        backgroundColor: chartColors,
        borderColor: chartColors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  // Performance chart data (simplified historical data)
  const performanceChartData = {
    labels: ['Initial', '3 Months Ago', '2 Months Ago', '1 Month Ago', 'Current'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [
          calculateTotalInvestmentValue(investments) * 0.85, // Simulated historical data
          calculateTotalInvestmentValue(investments) * 0.9,
          calculateTotalInvestmentValue(investments) * 0.95,
          calculateTotalInvestmentValue(investments) * 0.98,
          calculateTotalInvestmentValue(investments)
        ],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const shares = parseFloat(formData.shares);
      const purchasePrice = parseFloat(formData.purchasePrice);
      const currentPrice = parseFloat(formData.currentPrice);
      
      if (isNaN(shares) || shares <= 0) {
        throw new Error('Shares must be a positive number');
      }
      
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        throw new Error('Purchase price must be a positive number');
      }
      
      if (isNaN(currentPrice) || currentPrice <= 0) {
        throw new Error('Current price must be a positive number');
      }
      
      // Create investment object
      const investmentData = {
        userId: user.uid,
        name: formData.name,
        symbol: formData.symbol,
        type: formData.type,
        shares,
        purchasePrice,
        currentPrice,
        purchaseDate: Timestamp.fromDate(new Date(formData.purchaseDate)),
        notes: formData.notes || '',
        updatedAt: Timestamp.now()
      };
      
      if (formData.id) {
        // Update existing investment
        await updateDoc(
          doc(db, 'investments', formData.id),
          {
            ...investmentData,
            updatedAt: serverTimestamp()
          }
        );
        
        // Update local state
        setInvestments(prev => 
          prev.map(inv => 
            inv.id === formData.id 
              ? { ...investmentData, id: formData.id, createdAt: inv.createdAt } as Investment
              : inv
          )
        );
      } else {
        // Add new investment
        const docRef = await addDoc(
          collection(db, 'investments'),
          {
            ...investmentData,
            createdAt: serverTimestamp()
          }
        );
        
        // Update local state
        setInvestments(prev => [
          { id: docRef.id, ...investmentData, createdAt: Timestamp.now() } as Investment,
          ...prev
        ]);
      }
      
      // Reset form
      setFormData({
        id: '',
        name: '',
        symbol: '',
        type: 'stock',
        shares: '',
        purchasePrice: '',
        currentPrice: '',
        purchaseDate: new Date().toISOString().slice(0, 10),
        notes: ''
      });
      
      setShowForm(false);
    } catch (err) {
      console.error('Error adding/updating investment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save investment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle investment deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'investments', id));
      
      // Update local state
      setInvestments(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Error deleting investment:', err);
      setError('Failed to delete investment. Please try again.');
    }
  };

  // Edit investment
  const handleEdit = (investment: Investment) => {
    const dateStr = toJsDate(investment.purchaseDate)?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10);
    
    setFormData({
      id: investment.id,
      name: investment.name,
      symbol: investment.symbol,
      type: investment.type,
      shares: investment.shares.toString(),
      purchasePrice: investment.purchasePrice.toString(),
      currentPrice: investment.currentPrice.toString(),
      purchaseDate: dateStr,
      notes: investment.notes || ''
    });
    
    setShowForm(true);
  };

  // Apply filters to investments
  const filteredInvestments = typeFilter
    ? investments.filter(inv => inv.type === typeFilter)
    : investments;

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
    setTypeFilter(null);
  };

  // Go back to dashboard
  const goBack = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading your investments...</p>
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
          <div className="flex items-center">
            <Button 
              onClick={goBack}
              variant="ghost"
              className="mr-2"
              icon={<ArrowLeftIcon className="h-5 w-5" />}
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Investments
            </h1>
          </div>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              variant="primary"
              icon={<PlusIcon className="h-5 w-5" />}
            >
              Add Investment
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
          <Card title={formData.id ? "Edit Investment" : "Add Investment"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Investment Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={updateFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    {investmentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Investment Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={updateFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. Apple Inc."
                    required
                  />
                </div>

                {/* Symbol */}
                <div>
                  <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    id="symbol"
                    name="symbol"
                    value={formData.symbol}
                    onChange={updateFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. AAPL"
                    required
                  />
                </div>

                {/* Shares */}
                <div>
                  <label htmlFor="shares" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shares/Units *
                  </label>
                  <input
                    type="number"
                    id="shares"
                    name="shares"
                    value={formData.shares}
                    onChange={updateFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. 10"
                    min="0.001"
                    step="0.001"
                    required
                  />
                </div>

                {/* Purchase Price */}
                <div>
                  <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    id="purchasePrice"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={updateFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. 150.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                {/* Current Price */}
                <div>
                  <label htmlFor="currentPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Price *
                  </label>
                  <input
                    type="number"
                    id="currentPrice"
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={updateFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. 155.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={updateFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={updateFormData}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Add any additional notes about this investment"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      id: '',
                      name: '',
                      symbol: '',
                      type: 'stock',
                      shares: '',
                      purchasePrice: '',
                      currentPrice: '',
                      purchaseDate: new Date().toISOString().slice(0, 10),
                      notes: ''
                    });
                  }}
                  variant="secondary"
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : formData.id ? 'Update Investment' : 'Add Investment'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Value</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(calculateTotalInvestmentValue(investments))}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Gain/Loss</h3>
              <p className={`text-3xl font-bold mt-2 ${calculateTotalGainLoss(investments) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(calculateTotalGainLoss(investments))}
              </p>
            </div>
            <div className={`rounded-full p-3 ${calculateTotalGainLoss(investments) >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {calculateTotalGainLoss(investments) >= 0 ? (
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Return (%)</h3>
              <p className={`text-3xl font-bold mt-2 ${calculatePercentageGainLoss(investments) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {calculatePercentageGainLoss(investments).toFixed(2)}%
              </p>
            </div>
            <div className={`rounded-full p-3 ${calculatePercentageGainLoss(investments) >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {calculatePercentageGainLoss(investments) >= 0 ? (
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card title="Portfolio Allocation">
            <div className="h-72">
              {investments.length > 0 ? (
                <Pie data={investmentChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No investment data to display
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card title="Portfolio Performance">
            <div className="h-72">
              {investments.length > 0 ? (
                <Line 
                  data={performanceChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false
                      }
                    }
                  }} 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No performance data to display
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filter Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6"
      >
        <Card title="Filter Investments">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Investment Type
              </label>
              <select
                id="type-filter"
                value={typeFilter || ''}
                onChange={(e) => setTypeFilter(e.target.value || null)}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {investmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-end">
              <Button
                onClick={resetFilters}
                variant="secondary"
                icon={<ArrowPathIcon className="h-5 w-5" />}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Investments List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <Card title={`My Investments (${filteredInvestments.length})`}>
          {filteredInvestments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Shares
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Purchase Price
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Current Price
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Current Value
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Gain/Loss
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredInvestments.map((investment) => {
                    const currentValue = investment.shares * investment.currentPrice;
                    const costBasis = investment.shares * investment.purchasePrice;
                    const gainLoss = currentValue - costBasis;
                    const gainLossPercentage = costBasis !== 0 ? (gainLoss / costBasis) * 100 : 0;
                    
                    return (
                      <motion.tr 
                        key={investment.id}
                        variants={item}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-4 pl-4 pr-3 text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">{investment.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{investment.symbol}</div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {investmentTypes.find(t => t.value === investment.type)?.label || investment.type}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {investment.shares.toFixed(3)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(investment.purchasePrice)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(investment.currentPrice)}
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(currentValue)}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <div className={gainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {formatCurrency(gainLoss)} ({gainLossPercentage.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(investment)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(investment.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              {typeFilter ? (
                <p>No investments found with the selected filters. Try adjusting your filters or add a new investment.</p>
              ) : (
                <p>You haven't added any investments yet. Click the "Add Investment" button to get started.</p>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
} 