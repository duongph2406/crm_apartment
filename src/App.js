import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import Login from './components/Login';
import Home from './pages/Home';
import Apartments from './pages/Apartments';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import Invoices from './pages/Invoices';
import UserDashboard from './pages/UserDashboard';
import MyContracts from './pages/MyContracts';
import MyInvoices from './pages/MyInvoices';
import Account from './pages/Account';
import Users from './pages/Users';
import CostManagement from './pages/CostManagement';
import InvoiceGeneration from './pages/InvoiceGeneration';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Login />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <Routes>
          {currentUser.role === 'user' ? (
            <>
              <Route path="/" element={<UserDashboard />} />
              <Route path="/my-contracts" element={<MyContracts />} />
              <Route path="/my-invoices" element={<MyInvoices />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/apartments" element={<Apartments />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoice-generation" element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <InvoiceGeneration />
                </ProtectedRoute>
              } />
              <Route path="/cost-management" element={<CostManagement />} />
              <Route path="/account" element={<Account />} />
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <Route path="/users" element={<Users />} />
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
