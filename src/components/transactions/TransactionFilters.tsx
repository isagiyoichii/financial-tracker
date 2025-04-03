'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Transaction } from '@/types/transaction';

interface TransactionFiltersProps {
  transactions: Transaction[];
  dateRange: { startDate: Date | null; endDate: Date | null };
  setDateRange: React.Dispatch<React.SetStateAction<{ startDate: Date | null; endDate: Date | null }>>;
  categoryFilter: string[];
  setCategoryFilter: React.Dispatch<React.SetStateAction<string[]>>;
  typeFilter: string[];
  setTypeFilter: React.Dispatch<React.SetStateAction<string[]>>;
  amountRange: { min: number; max: number };
  setAmountRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  sortDirection: string;
  setSortDirection: React.Dispatch<React.SetStateAction<string>>;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  transactions,
  dateRange,
  setDateRange,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  amountRange,
  setAmountRange,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState(amountRange.min);
  const [maxAmount, setMaxAmount] = useState(amountRange.max === Infinity ? '' : amountRange.max);
  
  // Extract unique categories from transactions
  useEffect(() => {
    if (!transactions.length) return;
    
    const uniqueCategories = [...new Set(transactions.map(t => t.category))];
    setCategories(uniqueCategories);
  }, [transactions]);
  
  const handleCategoryToggle = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };
  
  const handleTypeToggle = (type: string) => {
    if (typeFilter.includes(type)) {
      setTypeFilter(typeFilter.filter(t => t !== type));
    } else {
      setTypeFilter([...typeFilter, type]);
    }
  };
  
  const handleAmountRangeApply = () => {
    setAmountRange({
      min: minAmount,
      max: maxAmount === '' ? Infinity : Number(maxAmount)
    });
  };
  
  const handleClearFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setCategoryFilter([]);
    setTypeFilter([]);
    setAmountRange({ min: 0, max: Infinity });
    setSearchTerm('');
    setSortBy('date');
    setSortDirection('desc');
    setMinAmount(0);
    setMaxAmount('');
  };
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="w-full">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        {/* Date Range */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <div className="flex space-x-2">
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              placeholderText="Start Date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
            />
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              placeholderText="End Date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transaction Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleTypeToggle('expense')}
              className={`px-4 py-2 rounded-md flex-1 ${
                typeFilter.includes('expense')
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('income')}
              className={`px-4 py-2 rounded-md flex-1 ${
                typeFilter.includes('income')
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Income
            </button>
          </div>
        </div>
        
        {/* Amount Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount Range
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                placeholder="Min"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Max"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAmountRangeApply}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply
            </button>
          </div>
        </div>
        
        {/* Sorting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button
              type="button"
              onClick={toggleSortDirection}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {sortDirection === 'asc' ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  categoryFilter.includes(category)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Filters Summary */}
      <div className="flex justify-between items-center border-t dark:border-gray-700 pt-4">
        <div className="flex flex-wrap gap-2">
          {(dateRange.startDate || dateRange.endDate || categoryFilter.length > 0 || 
            typeFilter.length > 0 || amountRange.min > 0 || amountRange.max !== Infinity || 
            searchTerm) && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Active filters:
              {dateRange.startDate && dateRange.endDate && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Date Range
                </span>
              )}
              {categoryFilter.length > 0 && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Categories ({categoryFilter.length})
                </span>
              )}
              {typeFilter.length > 0 && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Types ({typeFilter.join(', ')})
                </span>
              )}
              {(amountRange.min > 0 || amountRange.max !== Infinity) && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Amount (${amountRange.min} - ${amountRange.max === Infinity ? '∞' : amountRange.max})
                </span>
              )}
              {searchTerm && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default TransactionFilters; 