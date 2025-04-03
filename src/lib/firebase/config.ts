// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration object with direct values for troubleshooting
const firebaseConfig = {
  apiKey: "AIzaSyBj_vvYzTo7n3GMzj0CVhGDJo68pxOxIQs",
  authDomain: "financial-tracker-hehe.firebaseapp.com",
  projectId: "financial-tracker-hehe",
  storageBucket: "financial-tracker-hehe.appspot.com", // Fixed format
  messagingSenderId: "187772018159",
  appId: "1:187772018159:web:0a5377b7e3036492d5ea1a",
  measurementId: "G-8P7PSPBFLP"
};

// Initialize Firebase only if it hasn't been initialized already and we're on the client
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Only initialize Firebase on the client side
if (typeof window !== 'undefined') {
  try {
    // Check if Firebase is already initialized
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }

    // Initialize Firebase services with proper type annotations
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    
    // Create placeholders for server-side rendering
    // This is a workaround for SSR, these won't actually be used
    if (typeof window !== "undefined") {
      throw error; // Re-throw on client side
    }
  }
} else {
  // Server-side - create dummy instances for SSR
  // These will be properly initialized on the client
  console.log("Server-side Firebase initialization skipped");
}

export { auth, db, storage, firebaseApp }; 