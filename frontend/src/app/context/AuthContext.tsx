import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  savedColleges: string[];
  saveCollege: (collegeId: string) => Promise<void>;
  unsaveCollege: (collegeId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeParseUser = (value: string | null): User | null => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trimStart();
  if (trimmedValue.startsWith('<!DOCTYPE') || trimmedValue.startsWith('<html') || trimmedValue.startsWith('<')) {
    return null;
  }

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [savedColleges, setSavedColleges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSavedData = async () => {
    try {
      const savedCollegeList = await authAPI.getSavedColleges();
      setSavedColleges(savedCollegeList.map(college => String(college.id)));
    } catch (err) {
      console.error('Failed to load saved data:', err);
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = safeParseUser(userData);

      if (parsedUser) {
        setUser(parsedUser);
        void loadSavedData();
      } else {
        console.error('Failed to parse user data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
      };
      
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      await loadSavedData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.register(email, password, firstName, lastName);
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        firstName,
        lastName,
      };
      
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      await loadSavedData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSavedColleges([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const saveCollege = async (collegeId: string) => {
    try {
      if (!user) {
        throw new Error('Please login to save colleges');
      }
      
      await authAPI.saveCollege(parseInt(collegeId));
      
      if (!savedColleges.includes(collegeId)) {
        setSavedColleges([...savedColleges, collegeId]);
      }
      await loadSavedData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const unsaveCollege = async (collegeId: string) => {
    try {
      if (!user) {
        throw new Error('Please login to unsave colleges');
      }
      
      await authAPI.unsaveCollege(parseInt(collegeId));
      setSavedColleges(savedColleges.filter(id => id !== collegeId));
      await loadSavedData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        savedColleges,
        saveCollege,
        unsaveCollege,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
