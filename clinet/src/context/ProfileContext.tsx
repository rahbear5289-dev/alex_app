import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';

export interface AcademicProfile {
  board: string;
  standard: string;
  stream?: 'Science' | 'Commerce' | 'Arts';
}

const PROFILE_STORAGE_KEY = '@alex_academic_profile';

interface ProfileContextType {
  profile: AcademicProfile | null;
  setProfile: (profile: AcademicProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
  isProfileComplete: boolean;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [profile, setProfileState] = useState<AcademicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from AsyncStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          setProfileState(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load academic profile', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Sync with Clerk's publicMetadata when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      const clerkProfile = user.publicMetadata?.academicProfile as AcademicProfile | undefined;
      if (clerkProfile && (!profile || JSON.stringify(clerkProfile) !== JSON.stringify(profile))) {
        setProfileState(clerkProfile);
        AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(clerkProfile)).catch(console.error);
      }
    }
  }, [isLoaded, user, profile]);

  const setProfile = async (newProfile: AcademicProfile) => {
    setProfileState(newProfile);
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      // Also update Clerk publicMetadata if user is signed in
      // This would require a backend call or using Clerk's user.update() method
      // For now, we'll just store locally
    } catch (e) {
      console.error('Failed to save academic profile', e);
    }
  };

  const clearProfile = async () => {
    setProfileState(null);
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear academic profile', e);
    }
  };

  const isProfileComplete = !!profile && !!profile.board && !!profile.standard && 
    (profile.standard !== '11' && profile.standard !== '12' || !!profile.stream);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile, isProfileComplete, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};