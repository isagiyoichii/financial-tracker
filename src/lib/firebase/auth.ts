import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
  Auth
} from 'firebase/auth';
import { auth } from './config';

// Type assertion for auth
const authInstance = auth as Auth;

export async function signUp(email: string, password: string, displayName: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    // Update profile with display name
    if (authInstance.currentUser) {
      await updateProfile(authInstance.currentUser, {
        displayName: displayName
      });
    }
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(authInstance);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(authInstance, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authInstance, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function updateUserProfile(user: User, profile: { displayName?: string, photoURL?: string }) {
  try {
    await updateProfile(user, profile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
} 