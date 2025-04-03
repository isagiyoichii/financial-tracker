'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/auth-context';
import { useTheme } from '@/lib/context/theme-context';
import { db, auth, storage } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { currencies } from '@/lib/utils';

import {
  UserCircleIcon,
  MoonIcon,
  SunIcon,
  EnvelopeIcon,
  KeyIcon,
  BellAlertIcon,
  ArrowPathIcon,
  PhotoIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string | null;
  notificationsEnabled: boolean;
  currency: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: null,
    notificationsEnabled: true,
    currency: 'USD'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Currency selector states
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Filter currencies based on search
  const filteredCurrencies = currencySearch 
    ? currencies.filter(c => 
        c.name.toLowerCase().includes(currencySearch.toLowerCase()) || 
        c.country.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : currencies;

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
    show: { opacity: 1, y: 0 }
  };

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Get user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL,
            notificationsEnabled: userData.notificationsEnabled ?? true,
            currency: userData.currency || 'USD'
          });
        } else {
          // If no user document, initialize with auth profile
          setProfile({
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL,
            notificationsEnabled: true,
            currency: 'USD'
          });
          
          // Create the user document
          await updateDoc(userDocRef, {
            notificationsEnabled: true,
            currency: 'USD',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Close currency dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#currency-selector')) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Handle profile photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        notificationsEnabled: profile.notificationsEnabled,
        currency: profile.currency,
        updatedAt: Timestamp.now()
      });
      
      // Upload photo if changed
      if (photoFile) {
        const storageRef = ref(storage, `profile-photos/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        const photoURL = await getDownloadURL(storageRef);
        
        // Update profile photo in auth
        await updateProfile(user, { photoURL });
        setProfile({ ...profile, photoURL });
        setPhotoFile(null);
      }
      
      // Update display name if changed
      if (profile.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profile.displayName });
      }
      
      // Update email if changed
      if (profile.email !== user.email) {
        await updateEmail(user, profile.email);
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile. Try again later.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    
    // Check if passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    // Check if new password is different from current
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordForm.newPassword);
      
      // Update Firestore document to mark password changed
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        passwordLastChanged: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Reset form and show success
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      // Handle specific errors
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
      } else {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Failed to update password. Try again later.' 
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading your settings...</p>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </motion.div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Profile Card */}
        <motion.div variants={item}>
          <Card title="Profile" icon={<UserCircleIcon className="h-6 w-6" />}>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : profile.photoURL ? (
                        <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <UserCircleIcon className="h-20 w-20 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="photo-upload" 
                      className="absolute bottom-0 right-0 bg-indigo-500 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-indigo-600 transition-colors"
                    >
                      <PhotoIcon className="h-5 w-5" />
                      <input 
                        id="photo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoChange} 
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click the icon to change your photo
                  </p>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  Preferences
                </h3>
                
                <div className="space-y-4">
                  {/* Currency Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Currency
                    </label>
                    <div className="relative" id="currency-selector">
                      <div 
                        className="flex items-center justify-between w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm px-4 py-2 cursor-pointer"
                        onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      >
                        {currencies.find(c => c.code === profile.currency) ? (
                          <div className="flex items-center">
                            <span className="mr-2 text-xl">{currencies.find(c => c.code === profile.currency)?.flag}</span>
                            <span>{currencies.find(c => c.code === profile.currency)?.name} ({profile.currency})</span>
                          </div>
                        ) : (
                          <span>Select currency</span>
                        )}
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      {showCurrencyDropdown && (
                        <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 max-h-60 overflow-auto">
                          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded px-2">
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search currency..."
                                className="w-full py-1 px-2 bg-transparent border-none focus:outline-none text-sm"
                                value={currencySearch}
                                onChange={(e) => setCurrencySearch(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="py-1">
                            {filteredCurrencies.map((currency) => (
                              <div
                                key={currency.code}
                                className={`flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                  profile.currency === currency.code ? 'bg-indigo-50 dark:bg-indigo-900' : ''
                                }`}
                                onClick={() => {
                                  setProfile({...profile, currency: currency.code});
                                  setShowCurrencyDropdown(false);
                                }}
                              >
                                <span className="mr-2 text-xl">{currency.flag}</span>
                                <div>
                                  <div>{currency.name} ({currency.code})</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{currency.country}</div>
                                </div>
                              </div>
                            ))}
                            
                            {filteredCurrencies.length === 0 && (
                              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No currencies found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Notification Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center">
                        <BellAlertIcon className="h-5 w-5 mr-2" />
                        Enable Notifications
                      </label>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="toggle"
                        checked={profile.notificationsEnabled}
                        onChange={(e) => setProfile({...profile, notificationsEnabled: e.target.checked})}
                        className="sr-only"
                      />
                      <label
                        htmlFor="toggle"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${
                          profile.notificationsEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in ${
                            profile.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center">
                        {isDarkMode ? (
                          <MoonIcon className="h-5 w-5 mr-2" />
                        ) : (
                          <SunIcon className="h-5 w-5 mr-2" />
                        )}
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                      </label>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="theme-toggle"
                        checked={isDarkMode}
                        onChange={toggleTheme}
                        className="sr-only"
                      />
                      <label
                        htmlFor="theme-toggle"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${
                          isDarkMode ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  icon={isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
        
        {/* Password Card */}
        <motion.div variants={item}>
          <Card title="Security" icon={<KeyIcon className="h-6 w-6" />}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  icon={isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Account Data Section */}
        <motion.div variants={item}>
          <Card title="Account Data" icon={<EnvelopeIcon className="h-6 w-6" />}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Data Export</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Download a copy of all your financial data for backup or to use in other applications.
                </p>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                  >
                    Export Data (CSV)
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Data Deletion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Delete your account and all associated data permanently. This action cannot be undone.
                </p>
                <div className="mt-4">
                  <Button
                    variant="danger"
                    size="sm"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 