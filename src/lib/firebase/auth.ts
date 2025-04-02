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

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign up with email and password
export const registerWithEmail = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update profile
  await updateProfile(user, {
    displayName: name
  });
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
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
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  
  // Check if user document exists in Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  // If user doesn't exist, create a new document
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', user.uid), {
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
  return signOut(auth);
};

// Reset password
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// Update user profile
export const updateUserProfile = async (user: User, data: { displayName?: string, photoURL?: string }) => {
  await updateProfile(user, data);
  
  // Update Firestore document
  await updateDoc(doc(db, 'users', user.uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
  
  return user;
};

// Upload profile picture
export const uploadProfilePicture = async (user: User, file: File) => {
  const storageRef = ref(storage, `users/${user.uid}/profile-picture`);
  
  // Upload file
  await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  // Update user profile
  await updateUserProfile(user, { photoURL: downloadURL });
  
  return downloadURL;
}; 