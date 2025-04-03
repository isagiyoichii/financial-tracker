'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Transaction } from '@/types/transaction';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/context/auth-context';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading }) => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!transactions.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No transactions found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add your first transaction to get started.
        </p>
      </div>
    );
  }
  
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    
    setDeleting(transactionId);
    try {
      const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
      await deleteDoc(transactionRef);
      // Optimistically remove from UI - parent component should refresh data
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setDeleting(null);
    }
  };
  
  const handleToggleExpand = (transactionId: string) => {
    setExpandedId(expandedId === transactionId ? null : transactionId);
  };
  
  return (
    <div className="overflow-hidden">
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
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {transactions.map((transaction) => (
            <React.Fragment key={transaction.id}>
              <tr 
                className={`
                  hover:bg-gray-50 dark:hover:bg-gray-800 
                  ${expandedId === transaction.id ? 'bg-gray-50 dark:bg-gray-800' : ''}
                `}
                onClick={() => handleToggleExpand(transaction.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open edit functionality (to be implemented)
                      }}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTransaction(transaction.id);
                      }}
                      disabled={deleting === transaction.id}
                      className={`
                        text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300
                        ${deleting === transaction.id ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpand(transaction.id);
                      }}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      {expandedId === transaction.id ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
              
              {/* Expanded details row */}
              {expandedId === transaction.id && (
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {transaction.paymentMethod && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Payment Method
                          </h4>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {transaction.paymentMethod}
                          </p>
                        </div>
                      )}
                      
                      {transaction.recurrence && transaction.recurrence !== 'one-time' && (
                        <div className="flex items-start">
                          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                              Recurrence
                            </h4>
                            <p className="text-sm text-gray-900 dark:text-white capitalize">
                              {transaction.recurrence}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {transaction.location && (
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                              Location
                            </h4>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {transaction.location}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {transaction.tags && transaction.tags.length > 0 && (
                        <div className="flex items-start md:col-span-3">
                          <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                              Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {transaction.tags.map((tag) => (
                                <span 
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {transaction.notes && (
                        <div className="md:col-span-3 mt-2">
                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Notes
                          </h4>
                          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {transaction.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList; 