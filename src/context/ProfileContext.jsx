import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

const ProfileContext = createContext(null);

function deriveMeStatus(userData) {
  if (!userData) return null;
  const s = userData.Status || userData.status;
  if (typeof s === 'boolean') return s;
  return s === 'ACTIVE';
}

function handleSessionExpired() {
  localStorage.removeItem('nexoramind_token');
  localStorage.removeItem('nexoramind_user');
  toast.error('Session expired. Please log in again.');
  setTimeout(() => { window.location.href = '/'; }, 200);
}

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(null);
  const [meStatus, setMeStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('nexoramind_token');
    if (!token) {
      setProfileData(null);
      setMeStatus(null);
      setProfileLoading(false);
      return;
    }
    try {
      const meData = await api.me();
      if (meData && meData.Error === 'Session Expired') {
        setProfileData(null);
        setMeStatus(null);
        setProfileLoading(false);
        handleSessionExpired();
        return;
      }
      setProfileData(meData);
      setMeStatus(deriveMeStatus(meData));
      localStorage.setItem('nexoramind_user', JSON.stringify(meData));
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('session expired')) {
        handleSessionExpired();
      }
      setProfileData(null);
      setMeStatus(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  const clearProfile = useCallback(() => {
    setProfileData(null);
    setMeStatus(null);
  }, []);

  return (
    <ProfileContext.Provider value={{ profileData, meStatus, profileLoading, refreshProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}