import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  DocumentReference,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from './config';
import { Asset, Budget, Liability, Transaction } from '@/lib/types';

// Type guard functions
function isTransaction(data: any): data is Transaction {
  return data && typeof data === 'object' && 'type' in data && 
    (data.type === 'income' || data.type === 'expense');
}

function isBudget(data: any): data is Budget {
  return data && typeof data === 'object' && 'category' in data && 'amount' in data &&
    'period' in data;
}

function isAsset(data: any): data is Asset {
  return data && typeof data === 'object' && 'name' in data && 'value' in data &&
    'type' in data && 'category' in data;
}

function isLiability(data: any): data is Liability {
  return data && typeof data === 'object' && 'name' in data && 'amount' in data &&
    'type' in data;
}

// Generic function to convert a Firestore document to a typed object
export function convertDocument<T>(
  doc: QueryDocumentSnapshot<DocumentData>
): T & { id: string } {
  return { id: doc.id, ...doc.data() } as T & { id: string };
}

// Transactions
export async function addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'userId'>) {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

export async function updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id' | 'userId'>>) {
  try {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, {
      ...transaction,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string) {
  try {
    await deleteDoc(doc(db, 'transactions', id));
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

export async function getTransactions(userId: string) {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocument<Transaction>(doc));
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

export async function getTransaction(id: string) {
  try {
    const docRef = doc(db, 'transactions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Transaction;
    } else {
      throw new Error('Transaction not found');
    }
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
}

// Budgets
export async function addBudget(userId: string, budget: Omit<Budget, 'id' | 'userId'>) {
  try {
    const docRef = await addDoc(collection(db, 'budgets'), {
      ...budget,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
}

export async function updateBudget(id: string, budget: Partial<Omit<Budget, 'id' | 'userId'>>) {
  try {
    const docRef = doc(db, 'budgets', id);
    await updateDoc(docRef, {
      ...budget,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
}

export async function deleteBudget(id: string) {
  try {
    await deleteDoc(doc(db, 'budgets', id));
    return true;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}

export async function getBudgets(userId: string) {
  try {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId),
      orderBy('category', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocument<Budget>(doc));
  } catch (error) {
    console.error('Error getting budgets:', error);
    throw error;
  }
}

// Assets
export async function addAsset(userId: string, asset: Omit<Asset, 'id' | 'userId'>) {
  try {
    const docRef = await addDoc(collection(db, 'assets'), {
      ...asset,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding asset:', error);
    throw error;
  }
}

export async function updateAsset(id: string, asset: Partial<Omit<Asset, 'id' | 'userId'>>) {
  try {
    const docRef = doc(db, 'assets', id);
    await updateDoc(docRef, {
      ...asset,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
}

export async function deleteAsset(id: string) {
  try {
    await deleteDoc(doc(db, 'assets', id));
    return true;
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
}

export async function getAssets(userId: string) {
  try {
    const q = query(
      collection(db, 'assets'),
      where('userId', '==', userId),
      orderBy('value', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocument<Asset>(doc));
  } catch (error) {
    console.error('Error getting assets:', error);
    throw error;
  }
}

// Liabilities
export async function addLiability(userId: string, liability: Omit<Liability, 'id' | 'userId'>) {
  try {
    const docRef = await addDoc(collection(db, 'liabilities'), {
      ...liability,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding liability:', error);
    throw error;
  }
}

export async function updateLiability(id: string, liability: Partial<Omit<Liability, 'id' | 'userId'>>) {
  try {
    const docRef = doc(db, 'liabilities', id);
    await updateDoc(docRef, {
      ...liability,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating liability:', error);
    throw error;
  }
}

export async function deleteLiability(id: string) {
  try {
    await deleteDoc(doc(db, 'liabilities', id));
    return true;
  } catch (error) {
    console.error('Error deleting liability:', error);
    throw error;
  }
}

export async function getLiabilities(userId: string) {
  try {
    const q = query(
      collection(db, 'liabilities'),
      where('userId', '==', userId),
      orderBy('amount', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocument<Liability>(doc));
  } catch (error) {
    console.error('Error getting liabilities:', error);
    throw error;
  }
} 