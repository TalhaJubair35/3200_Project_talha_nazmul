import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import app from '../firebase/firebase.config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const auth = getAuth(app);

  const fetchProfile = useCallback(async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user-profile/${encodeURIComponent(email)}`);
      const data = await res.json();
      setUserProfile(data || null);
    } catch {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        try {
          const res = await fetch(`${API_BASE_URL}/admin-check?email=${encodeURIComponent(currentUser.email)}`);
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        } catch {
          setIsAdmin(false);
        }
        fetchProfile(currentUser.email);
      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, fetchProfile]);

  const logout = async () => {
    setIsAdmin(false);
    setUserProfile(null);
    await signOut(auth);
  };

  const refreshProfile = () => {
    if (user?.email) fetchProfile(user.email);
  };

  const toggleSavedJob = async (jobId, isSaved) => {
    if (!user?.email) return false;
    
    // Optimistic update
    setUserProfile(prev => {
      if (!prev) return prev;
      const current = prev.savedJobs || [];
      return { ...prev, savedJobs: isSaved ? current.filter(id => id !== jobId) : [...current, jobId] };
    });

    try {
      if (isSaved) {
        await fetch(`${API_BASE_URL}/saved-jobs/${jobId}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      } else {
        await fetch(`${API_BASE_URL}/saved-jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, jobId })
        });
      }
      return true;
    } catch {
      refreshProfile(); // Revert on failure
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAdmin, userProfile, refreshProfile, toggleSavedJob }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
