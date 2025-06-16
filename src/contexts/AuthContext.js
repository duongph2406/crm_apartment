import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo accounts
  const demoAccounts = {
    admin: {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Administrator',
      email: 'admin@crm.com'
    },
    manager: {
      username: 'manager',
      password: 'manager123',
      role: 'manager',
      name: 'Manager',
      email: 'manager@crm.com'
    },
    user: {
      username: 'user',
      password: 'user123',
      role: 'user',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      tenantId: 1 // Links to tenant with ID 1
    }
  };

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const account = demoAccounts[username];
    
    if (account && account.password === password) {
      const userData = {
        id: username,
        username: account.username,
        name: account.name,
        email: account.email,
        role: account.role,
        tenantId: account.tenantId || null
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'admin': 3,
      'manager': 2,
      'user': 1
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager' || user?.role === 'admin';
  const isUser = () => user?.role === 'user';

  const value = {
    user,
    login,
    logout,
    hasRole,
    isAdmin,
    isManager,
    isUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 