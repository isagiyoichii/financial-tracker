import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { auth, db, storage } from './config';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper to ensure auth is initialized
const getAuthInstance = () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
};

// Helper to ensure db is initialized
const getDbInstance = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

// Helper to ensure storage is initialized
const getStorageInstance = () => {
  if (!storage) throw new Error('Firebase Storage not initialized');
  return storage;
};

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(getAuthInstance(), email, password);
};

// Sign up with email and password
export const registerWithEmail = async (email: string, password: string, name: string) => {
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update profile
  await updateProfile(user, {
    displayName: name
  });
  
  // Create user document in Firestore
  await setDoc(doc(getDbInstance(), 'users', user.uid), {
    uid: user.uid,
    email,
    displayName: name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    photoURL: null,
    phoneNumber: null,
    settings: {
      darkMode: false,
      notifications: true,
      currency: 'USD',
    }
  });
  
  // Send email verification
  await sendEmailVerification(user);
  
  return userCredential;
};

// Sign in with Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(getAuthInstance(), provider);
  const user = userCredential.user;
  
  // Check if user document exists in Firestore
  const userDoc = await getDoc(doc(getDbInstance(), 'users', user.uid));
  
  // If user doesn't exist, create a new document
  if (!userDoc.exists()) {
    await setDoc(doc(getDbInstance(), 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      settings: {
        darkMode: false,
        notifications: true,
        currency: 'USD',
      }
    });
  }
  
  return userCredential;
};

// Sign out
export const logout = async () => {
  return signOut(getAuthInstance());
};

// Reset password
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(getAuthInstance(), email);
};

// Update user profile
export const updateUserProfile = async (user: User, data: { displayName?: string, photoURL?: string }) => {
  await updateProfile(user, data);
  
  // Update Firestore document
  await updateDoc(doc(getDbInstance(), 'users', user.uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
  
  return user;
};

// Upload profile picture
export const uploadProfilePicture = async (user: User, file: File) => {
  const storageRef = ref(getStorageInstance(), `users/${user.uid}/profile-picture`);
  
  // Upload file
  await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  // Update user profile
  await updateUserProfile(user, { photoURL: downloadURL });
  
  return downloadURL;
};

// Sign up with email and password (alias for registerWithEmail to match what's used in SignupForm)
export const createUserWithEmail = async (email: string, password: string) => {
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user document in Firestore
  await setDoc(doc(getDbInstance(), 'users', user.uid), {
    uid: user.uid,
    email,
    displayName: user.displayName || email.split('@')[0],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    photoURL: null,
    phoneNumber: null,
    settings: {
      darkMode: false,
      notifications: true,
      currency: 'USD',
    }
  });
  
  return userCredential;
}; 