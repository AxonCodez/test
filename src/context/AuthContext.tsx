
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// NOTE: This is a mock authentication system for prototyping.
// It uses localStorage and is NOT secure for production use.

export type UserData = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  gender?: string;
  registrationNumber?: string;
};

// Define the shape of our user object in storage
interface DemoUser extends UserData {
  password?: string; // Only for storage, not for client state
}

interface AuthContextType {
  user: UserData | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, regNo: string) => Promise<boolean>;
  registerAdmin: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<UserData>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  login: async () => false,
  register: async () => false,
  registerAdmin: async () => false,
  logout: () => {},
  updateUser: async () => false,
});

const SUPER_ADMIN_EMAIL = 'admin@example.com';
const STUDENT_EMAIL_DOMAIN = '@vitstudent.ac.in';
const LOCAL_STORAGE_USERS_KEY = 'demo_users';
const LOCAL_STORAGE_SESSION_KEY = 'demo_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const router = useRouter();

  // Helper to get all users from localStorage and ensure default admins exist
  const getUsers = (): DemoUser[] => {
    const usersJson = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    let existingUsers: DemoUser[] = usersJson ? JSON.parse(usersJson) : [];
    
    const defaultAdmins: DemoUser[] = [
      { uid: 'admin-super', email: SUPER_ADMIN_EMAIL, displayName: 'Administrator', password: 'password' },
      { uid: 'admin-appoint-1', email: 'admin1@example.com', displayName: 'Appointment Admin 1', password: '1234' }
    ];

    const existingUserMap = new Map(existingUsers.map(u => [u.email, u]));

    defaultAdmins.forEach(admin => {
        if (!existingUserMap.has(admin.email)) {
            existingUsers.push(admin);
        }
    });

    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(existingUsers));
    
    return existingUsers;
  };
  
  // On initial load, check session and set up admin list
  useEffect(() => {
    try {
      const sessionUserJson = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (sessionUserJson) {
        setUser(JSON.parse(sessionUserJson));
      }
      // Initialize admin emails from the user list
      const allUsers = getUsers();
      setAdminEmails(allUsers.filter(u => u.password).map(u => u.email));
    } catch (error) {
      console.error("Failed to process localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Helper to save users to localStorage
  const saveUsers = (users: DemoUser[]) => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === pass);

    if (foundUser) {
      const { password, ...userToSave } = foundUser;
      setUser(userToSave);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userToSave));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string, regNo: string): Promise<boolean> => {
    // Enforce student email domain and prevent registering admin emails
    if (!email.endsWith(STUDENT_EMAIL_DOMAIN) || adminEmails.includes(email)) {
      return false;
    }
    
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }
    
    const newUser: DemoUser = {
      uid: `user-${Date.now()}`,
      email,
      displayName: name,
      password: pass,
      gender: '',
      registrationNumber: regNo,
    };

    saveUsers([...users, newUser]);
    
    const { password, ...userToSave } = newUser;
    setUser(userToSave);
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userToSave));
    
    return true;
  };
  
  const registerAdmin = async (name: string, email: string, pass: string): Promise<boolean> => {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return false; // Admin email already exists
    }

    const newAdmin: DemoUser = {
      uid: `admin-${Date.now()}`,
      email,
      displayName: name,
      password: pass,
    };

    saveUsers([...users, newAdmin]);
    setAdminEmails(prev => [...prev, newAdmin.email]);

    const { password, ...userToSave } = newAdmin;
    setUser(userToSave);
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userToSave));
    
    return true;
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    router.push('/');
  };

  const updateUser = async (updates: Partial<UserData>): Promise<boolean> => {
    if (!user) return false;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updatedUser));

    const users = getUsers();
    const userIndex = users.findIndex(u => u.uid === user.uid);
    if (userIndex > -1) {
      const dbUser = users[userIndex];
      const updatedDbUser = { ...dbUser, ...updates };
      users[userIndex] = updatedDbUser;
      saveUsers(users);
      return true;
    }
    return false;
  };

  const isAdmin = user ? adminEmails.includes(user.email || '') : false;
  const isSuperAdmin = user ? user.email === SUPER_ADMIN_EMAIL : false;

  const value = {
    user,
    isAdmin,
    isSuperAdmin,
    loading,
    login,
    register,
    registerAdmin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
