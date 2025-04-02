import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Budget, Asset, Liability, Category, Goal } from '../types';

interface FinanceState {
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Budgets
  budgets: Budget[];
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Assets
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Liabilities
  liabilities: Liability[];
  addLiability: (liability: Liability) => void;
  updateLiability: (id: string, liability: Partial<Liability>) => void;
  deleteLiability: (id: string) => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Refresh Data
  refreshData: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      // Transactions
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [...state.transactions, transaction] })),
      updateTransaction: (id, updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
        })),
      
      // Budgets
      budgets: [],
      addBudget: (budget) =>
        set((state) => ({ budgets: [...state.budgets, budget] })),
      updateBudget: (id, updatedBudget) =>
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updatedBudget } : budget
          ),
        })),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        })),
      
      // Assets
      assets: [],
      addAsset: (asset) =>
        set((state) => ({ assets: [...state.assets, asset] })),
      updateAsset: (id, updatedAsset) =>
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id ? { ...asset, ...updatedAsset } : asset
          ),
        })),
      deleteAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
        })),
      
      // Liabilities
      liabilities: [],
      addLiability: (liability) =>
        set((state) => ({ liabilities: [...state.liabilities, liability] })),
      updateLiability: (id, updatedLiability) =>
        set((state) => ({
          liabilities: state.liabilities.map((liability) =>
            liability.id === id ? { ...liability, ...updatedLiability } : liability
          ),
        })),
      deleteLiability: (id) =>
        set((state) => ({
          liabilities: state.liabilities.filter((liability) => liability.id !== id),
        })),
      
      // Categories
      categories: [],
      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, updatedCategory) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updatedCategory } : category
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        })),
      
      // Goals
      goals: [],
      addGoal: (goal) =>
        set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updatedGoal) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updatedGoal } : goal
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
      
      // Refresh Data
      refreshData: () => set((state) => ({ ...state })),
    }),
    {
      name: 'finance-store',
    }
  )
); 