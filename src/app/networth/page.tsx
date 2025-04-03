'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/auth-context';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { formatCurrency, toJsDate, formatDate } from '@/lib/utils';
import { Asset, Liability } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  PlusIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  BuildingLibraryIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toastSuccess, toastError } from '@/lib/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Default chart options
const chartOptions = {
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        font: {
          size: 12
        },
        padding: 20
      }
    }
  },
  responsive: true,
  maintainAspectRatio: false
};

// Asset types with icons
const assetTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Account' },
  { value: 'investment', label: 'Investment' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other Asset' }
];

// Liability types
const liabilityTypes = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'loan', label: 'Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'medical', label: 'Medical Debt' },
  { value: 'tax', label: 'Tax Debt' },
  { value: 'other', label: 'Other Debt' }
];

export default function NetWorth() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form visibility states
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  
  // Form data states
  const [assetForm, setAssetForm] = useState({
    id: '',
    name: '',
    value: '',
    type: 'bank',
    description: '',
    purchaseDate: ''
  });
  
  const [liabilityForm, setLiabilityForm] = useState({
    id: '',
    name: '',
    amount: '',
    type: 'credit_card',
    description: '',
    interestRate: '',
    dueDate: ''
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 10 } }
  };

  // Fetch assets and liabilities from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
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
        toastError('Failed to load net worth data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Reset form states
  const resetAssetForm = () => {
    setAssetForm({
      id: '',
      name: '',
      value: '',
      type: 'bank',
      description: '',
      purchaseDate: ''
    });
    setShowAssetForm(false);
  };

  const resetLiabilityForm = () => {
    setLiabilityForm({
      id: '',
      name: '',
      amount: '',
      type: 'credit_card',
      description: '',
      interestRate: '',
      dueDate: ''
    });
    setShowLiabilityForm(false);
  };

  // Handle asset form submission
  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      const value = parseFloat(assetForm.value);
      
      if (isNaN(value) || value < 0) {
        toastError('Asset value must be a positive number');
        setIsLoading(false);
        return;
      }
      
      const assetData = {
        userId: user.uid,
        name: assetForm.name,
        value,
        type: assetForm.type,
        description: assetForm.description || '',
        ...(assetForm.purchaseDate && { 
          purchaseDate: Timestamp.fromDate(new Date(assetForm.purchaseDate)) 
        }),
        updatedAt: Timestamp.now()
      };
      
      if (assetForm.id) {
        // Update existing asset
        await updateDoc(doc(db, 'assets', assetForm.id), {
          ...assetData,
          updatedAt: Timestamp.now()
        });
        
        setAssets(prev => 
          prev.map(item => 
            item.id === assetForm.id ? { ...item, ...assetData, id: assetForm.id } : item
          )
        );
        
        toastSuccess('Asset updated successfully');
      } else {
        // Add new asset
        const newAssetData = {
          ...assetData,
          createdAt: Timestamp.now()
        };
        
        const docRef = await addDoc(collection(db, 'assets'), newAssetData);
        
        setAssets(prev => [...prev, { id: docRef.id, ...newAssetData } as Asset]);
        
        toastSuccess('Asset added successfully');
      }
      
      resetAssetForm();
    } catch (error) {
      console.error('Error saving asset:', error);
      toastError('Failed to save asset');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle liability form submission
  const handleLiabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      const amount = parseFloat(liabilityForm.amount);
      const interestRate = liabilityForm.interestRate 
        ? parseFloat(liabilityForm.interestRate) 
        : undefined;
      
      if (isNaN(amount) || amount < 0) {
        toastError('Liability amount must be a positive number');
        setIsLoading(false);
        return;
      }
      
      if (interestRate !== undefined && (isNaN(interestRate) || interestRate < 0)) {
        toastError('Interest rate must be a positive number');
        setIsLoading(false);
        return;
      }
      
      const liabilityData = {
        userId: user.uid,
        name: liabilityForm.name,
        amount,
        type: liabilityForm.type,
        description: liabilityForm.description || '',
        ...(interestRate !== undefined && { interestRate }),
        ...(liabilityForm.dueDate && { 
          dueDate: Timestamp.fromDate(new Date(liabilityForm.dueDate)) 
        }),
        updatedAt: Timestamp.now()
      };
      
      if (liabilityForm.id) {
        // Update existing liability
        await updateDoc(doc(db, 'liabilities', liabilityForm.id), {
          ...liabilityData,
          updatedAt: Timestamp.now()
        });
        
        setLiabilities(prev => 
          prev.map(item => 
            item.id === liabilityForm.id ? { ...item, ...liabilityData, id: liabilityForm.id } : item
          )
        );
        
        toastSuccess('Liability updated successfully');
      } else {
        // Add new liability
        const newLiabilityData = {
          ...liabilityData,
          createdAt: Timestamp.now()
        };
        
        const docRef = await addDoc(collection(db, 'liabilities'), newLiabilityData);
        
        setLiabilities(prev => [...prev, { id: docRef.id, ...newLiabilityData } as Liability]);
        
        toastSuccess('Liability added successfully');
      }
      
      resetLiabilityForm();
    } catch (error) {
      console.error('Error saving liability:', error);
      toastError('Failed to save liability');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete asset
  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deleteDoc(doc(db, 'assets', id));
      setAssets(prev => prev.filter(asset => asset.id !== id));
      toastSuccess('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      toastError('Failed to delete asset');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete liability
  const handleDeleteLiability = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this liability?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deleteDoc(doc(db, 'liabilities', id));
      setLiabilities(prev => prev.filter(liability => liability.id !== id));
      toastSuccess('Liability deleted successfully');
    } catch (error) {
      console.error('Error deleting liability:', error);
      toastError('Failed to delete liability');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit asset
  const handleEditAsset = (asset: Asset) => {
    setAssetForm({
      id: asset.id,
      name: asset.name,
      value: asset.value.toString(),
      type: asset.type,
      description: asset.description || '',
      purchaseDate: asset.purchaseDate ? formatDate(toJsDate(asset.purchaseDate)) : ''
    });
    setShowAssetForm(true);
  };

  // Edit liability
  const handleEditLiability = (liability: Liability) => {
    setLiabilityForm({
      id: liability.id,
      name: liability.name,
      amount: liability.amount.toString(),
      type: liability.type,
      description: liability.description || '',
      interestRate: liability.interestRate?.toString() || '',
      dueDate: liability.dueDate ? formatDate(toJsDate(liability.dueDate)) : ''
    });
    setShowLiabilityForm(true);
  };

  // Calculate totals
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Calculate asset distribution by type
  const assetsByType = assets.reduce((acc: {[key: string]: number}, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = 0;
    }
    acc[asset.type] += asset.value;
    return acc;
  }, {});

  // Calculate liability distribution by type
  const liabilitiesByType = liabilities.reduce((acc: {[key: string]: number}, liability) => {
    if (!acc[liability.type]) {
      acc[liability.type] = 0;
    }
    acc[liability.type] += liability.amount;
    return acc;
  }, {});

  // Prepare chart data for assets
  const assetChartData = {
    labels: Object.keys(assetsByType).map(type => 
      assetTypes.find(t => t.value === type)?.label || type
    ),
    datasets: [
      {
        data: Object.values(assetsByType),
        backgroundColor: [
          '#34D399', // emerald-400
          '#10B981', // emerald-500
          '#059669', // emerald-600
          '#047857', // emerald-700
          '#065F46', // emerald-800
          '#064E3B', // emerald-900
          '#022C22'  // emerald-950
        ],
        borderWidth: 1
      }
    ]
  };

  // Prepare chart data for liabilities
  const liabilityChartData = {
    labels: Object.keys(liabilitiesByType).map(type => 
      liabilityTypes.find(t => t.value === type)?.label || type
    ),
    datasets: [
      {
        data: Object.values(liabilitiesByType),
        backgroundColor: [
          '#F87171', // rose-400
          '#F43F5E', // rose-500
          '#E11D48', // rose-600
          '#BE123C', // rose-700
          '#9F1239', // rose-800
          '#881337', // rose-900
          '#4C0519'  // rose-950
        ],
        borderWidth: 1
      }
    ]
  };

  if (isLoading && !assets.length && !liabilities.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading your net worth data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Net Worth Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your assets and liabilities to calculate your total net worth
        </p>
      </motion.div>

      {/* Net Worth Summary */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={item}>
          <Card 
            title="Total Assets" 
            subtitle="What you own"
            className="h-full"
            icon={<BanknotesIcon className="h-6 w-6 text-green-500" />}
          >
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAssets)}</p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="light"
                size="sm"
                icon={<PlusIcon className="h-4 w-4" />}
                onClick={() => {
                  setShowAssetForm(true);
                  setShowLiabilityForm(false);
                }}
              >
                Add Asset
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card 
            title="Total Liabilities" 
            subtitle="What you owe"
            className="h-full"
            icon={<CreditCardIcon className="h-6 w-6 text-rose-500" />}
          >
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalLiabilities)}</p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="light"
                size="sm"
                icon={<PlusIcon className="h-4 w-4" />}
                onClick={() => {
                  setShowLiabilityForm(true);
                  setShowAssetForm(false);
                }}
              >
                Add Liability
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card 
            title="Net Worth" 
            subtitle="Assets - Liabilities"
            className="h-full"
            icon={<BuildingLibraryIcon className="h-6 w-6 text-indigo-500" />}
          >
            <p className={`text-2xl font-bold ${
              netWorth >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(netWorth)}
            </p>
            <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
              {totalAssets + totalLiabilities > 0 && (
                <div 
                  className="h-1 bg-indigo-500 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (totalAssets / (totalAssets + totalLiabilities)) * 100)}%` 
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Assets</span>
              <span>Liabilities</span>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Asset Form */}
      {showAssetForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card title={assetForm.id ? 'Edit Asset' : 'Add New Asset'}>
            <form onSubmit={handleAssetSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="asset-name" className="block text-sm font-medium mb-1">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    id="asset-name"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                    className="w-full rounded-md border p-2"
                    placeholder="e.g., Savings Account"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="asset-value" className="block text-sm font-medium mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    id="asset-value"
                    value={assetForm.value}
                    onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                    className="w-full rounded-md border p-2"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="asset-type" className="block text-sm font-medium mb-1">
                    Asset Type
                  </label>
                  <select
                    id="asset-type"
                    value={assetForm.type}
                    onChange={(e) => setAssetForm({...assetForm, type: e.target.value})}
                    className="w-full rounded-md border p-2"
                  >
                    {assetTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="asset-purchase-date" className="block text-sm font-medium mb-1">
                    Purchase Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="asset-purchase-date"
                    value={assetForm.purchaseDate}
                    onChange={(e) => setAssetForm({...assetForm, purchaseDate: e.target.value})}
                    className="w-full rounded-md border p-2"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="asset-description" className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="asset-description"
                  value={assetForm.description}
                  onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                  className="w-full rounded-md border p-2"
                  rows={3}
                  placeholder="Add any additional details about this asset"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="light"
                  onClick={resetAssetForm}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (assetForm.id ? 'Update Asset' : 'Add Asset')}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Liability Form */}
      {showLiabilityForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card title={liabilityForm.id ? 'Edit Liability' : 'Add New Liability'}>
            <form onSubmit={handleLiabilitySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="liability-name" className="block text-sm font-medium mb-1">
                    Liability Name
                  </label>
                  <input
                    type="text"
                    id="liability-name"
                    value={liabilityForm.name}
                    onChange={(e) => setLiabilityForm({...liabilityForm, name: e.target.value})}
                    className="w-full rounded-md border p-2"
                    placeholder="e.g., Credit Card Debt"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="liability-amount" className="block text-sm font-medium mb-1">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    id="liability-amount"
                    value={liabilityForm.amount}
                    onChange={(e) => setLiabilityForm({...liabilityForm, amount: e.target.value})}
                    className="w-full rounded-md border p-2"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="liability-type" className="block text-sm font-medium mb-1">
                    Liability Type
                  </label>
                  <select
                    id="liability-type"
                    value={liabilityForm.type}
                    onChange={(e) => setLiabilityForm({...liabilityForm, type: e.target.value})}
                    className="w-full rounded-md border p-2"
                  >
                    {liabilityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="liability-interest" className="block text-sm font-medium mb-1">
                    Interest Rate % (Optional)
                  </label>
                  <input
                    type="number"
                    id="liability-interest"
                    value={liabilityForm.interestRate}
                    onChange={(e) => setLiabilityForm({...liabilityForm, interestRate: e.target.value})}
                    className="w-full rounded-md border p-2"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label htmlFor="liability-due-date" className="block text-sm font-medium mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="liability-due-date"
                    value={liabilityForm.dueDate}
                    onChange={(e) => setLiabilityForm({...liabilityForm, dueDate: e.target.value})}
                    className="w-full rounded-md border p-2"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="liability-description" className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="liability-description"
                  value={liabilityForm.description}
                  onChange={(e) => setLiabilityForm({...liabilityForm, description: e.target.value})}
                  className="w-full rounded-md border p-2"
                  rows={3}
                  placeholder="Add any additional details about this liability"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="light"
                  onClick={resetLiabilityForm}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (liabilityForm.id ? 'Update Liability' : 'Add Liability')}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Assets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            title="Your Assets"
            subtitle={`${assets.length} items`}
            className="h-full"
          >
            <div className="flex flex-col h-full">
              {assets.length > 0 ? (
                <>
                  <div className="mb-6 h-64">
                    <Pie data={assetChartData} options={chartOptions} />
                  </div>
                  
                  <div className="space-y-4 flex-grow">
                    {assets.map(asset => (
                      <div key={asset.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{asset.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {assetTypes.find(t => t.value === asset.type)?.label || asset.type}
                            {asset.purchaseDate && ` • Purchased: ${formatDate(toJsDate(asset.purchaseDate))}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(asset.value)}</p>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <p className="font-medium">Total Assets</p>
                    <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAssets)}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BanknotesIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't added any assets yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<PlusIcon className="h-4 w-4" />}
                    onClick={() => {
                      setShowAssetForm(true);
                      setShowLiabilityForm(false);
                    }}
                  >
                    Add Your First Asset
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Liabilities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card 
            title="Your Liabilities"
            subtitle={`${liabilities.length} items`}
            className="h-full"
          >
            <div className="flex flex-col h-full">
              {liabilities.length > 0 ? (
                <>
                  <div className="mb-6 h-64">
                    <Pie data={liabilityChartData} options={chartOptions} />
                  </div>
                  
                  <div className="space-y-4 flex-grow">
                    {liabilities.map(liability => (
                      <div key={liability.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{liability.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {liabilityTypes.find(t => t.value === liability.type)?.label || liability.type}
                            {liability.interestRate && ` • ${liability.interestRate}% interest`}
                            {liability.dueDate && ` • Due: ${formatDate(toJsDate(liability.dueDate))}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(liability.amount)}</p>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditLiability(liability)}
                              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLiability(liability.id)}
                              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <p className="font-medium">Total Liabilities</p>
                    <p className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalLiabilities)}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <CreditCardIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't added any liabilities yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<PlusIcon className="h-4 w-4" />}
                    onClick={() => {
                      setShowLiabilityForm(true);
                      setShowAssetForm(false);
                    }}
                  >
                    Add Your First Liability
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 