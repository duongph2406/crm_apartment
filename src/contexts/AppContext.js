import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Fixed room numbers as specified
const ROOM_NUMBERS = ['102', '201', '202', '301', '302', '401', '402', '501', '502', '601', '602'];

// Sample data for development
const initialData = {
  apartments: ROOM_NUMBERS.map(room => ({
    id: room,
    roomNumber: room,
    status: room === '102' ? 'occupied' : Math.random() > 0.7 ? 'occupied' : 'available',
    rentAmount: 5000000 + Math.floor(Math.random() * 3000000), // 5-8M VND
    currentTenantId: room === '102' ? '1' : null, // Link tenant 1 to room 102
  })),
  tenants: [
    {
      id: '1',
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'nguyenvanan@email.com',
      idNumber: '123456789',
      address: '123 Lê Lợi, Q1, TP.HCM',
      apartmentId: '102', // Assigned apartment
      role: 'contract_signer', // contract_signer, room_leader, member
    },
    {
      id: '2',
      fullName: 'Trần Thị Bình',
      phone: '0987654321',
      email: 'tranthibibinh@email.com',
      idNumber: '987654321',
      address: '456 Nguyễn Huệ, Q1, TP.HCM',
      apartmentId: '102', // Same apartment as tenant 1
      role: 'room_leader',
    },
    {
      id: '3',
      fullName: 'Lê Minh Cường',
      phone: '0912345678',
      email: 'leminhcuong@email.com',
      idNumber: '456789123',
      address: '789 Điện Biên Phủ, Q3, TP.HCM',
      apartmentId: '102', // Same apartment
      role: 'member',
    },
  ],
  contracts: [
    {
      id: '1',
      contractNumber: 'HD001',
      apartmentId: '102',
      tenantId: '1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      rentAmount: 6000000,
      status: 'active',
    },
  ],
  invoices: [
    {
      id: 1,
      invoiceNumber: 'HĐ001',
      contractId: 1,
      apartmentId: 1,
      tenantId: 1,
      month: 7,
      year: 2024,
      rent: 5000000,
      electricity: 200000,
      water: 100000,
      internet: 200000,
      cleaning: 50000,
      other: 0,
      otherDescription: '',
      total: 5550000,
      dueDate: '2024-07-15',
      status: 'paid',
      createdAt: '2024-07-01T00:00:00'
    },
    {
      id: 2,
      invoiceNumber: 'HĐ002',
      contractId: 1,
      apartmentId: 1,
      tenantId: 1,
      month: 8,
      year: 2024,
      rent: 5000000,
      electricity: 250000,
      water: 100000,
      internet: 200000,
      cleaning: 50000,
      other: 100000,
      otherDescription: 'Phí bảo trì thang máy',
      total: 5700000,
      dueDate: '2024-08-15',
      status: 'pending',
      createdAt: '2024-08-01T00:00:00'
    },
  ],
  costSettings: {
    electricityRate: 3500, // VNĐ/kWh
    waterRatePerPerson: 50000, // VNĐ/người/tháng
    internetRatePerRoom: 200000, // VNĐ/phòng/tháng
    serviceFeePerPerson: 30000, // VNĐ/người/tháng
    lastUpdated: '2024-01-01T00:00:00.000Z'
  },
  roomPrices: {
    // Giá phòng riêng cho từng phòng
    // Nếu không set riêng thì dùng giá mặc định từ apartment
  },
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      fullName: 'Quản trị viên',
    },
    {
      id: '2',
      username: 'manager',
      password: 'manager123',
      role: 'manager',
      fullName: 'Người quản lý',
    },
    {
      id: '3',
      username: 'user',
      password: 'user123',
      role: 'user',
      fullName: 'Nguyễn Văn An',
      tenantId: '1', // Liên kết với tenant có id '1'
    },
  ],
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(initialData);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem('apartmentData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('apartmentData', JSON.stringify(data));
  }, [data]);

  // Authentication functions
  const login = (username, password) => {
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Apartment functions
  const updateApartment = (apartmentId, updates) => {
    // If status is changed to available, clear all tenant assignments
    if (updates.status === 'available') {
      // Remove all tenants from this apartment
      setData(prev => ({
        ...prev,
        tenants: prev.tenants.map(tenant =>
          tenant.apartmentId === apartmentId
            ? { ...tenant, apartmentId: null }
            : tenant
        ),
        contracts: prev.contracts.map(contract => 
          contract.apartmentId === apartmentId && contract.status === 'active'
            ? { ...contract, status: 'expired' }
            : contract
        )
      }));
    }

    setData(prev => ({
      ...prev,
      apartments: prev.apartments.map(apt => 
        apt.id === apartmentId ? { ...apt, ...updates } : apt
      )
    }));
  };

  // Tenant functions
  const addTenant = (tenant) => {
    const newTenant = {
      ...tenant,
      id: Date.now().toString(),
    };
    setData(prev => ({
      ...prev,
      tenants: [...prev.tenants, newTenant]
    }));
    return newTenant;
  };

  const updateTenant = (tenantId, updates) => {
    setData(prev => ({
      ...prev,
      tenants: prev.tenants.map(tenant => 
        tenant.id === tenantId ? { ...tenant, ...updates } : tenant
      )
    }));
  };

  const deleteTenant = (tenantId) => {
    setData(prev => ({
      ...prev,
      tenants: prev.tenants.filter(tenant => tenant.id !== tenantId)
    }));
  };

  // Assign tenant to apartment
  const assignTenantToApartment = (tenantId, apartmentId, role) => {
    setData(prev => ({
      ...prev,
      tenants: prev.tenants.map(tenant =>
        tenant.id === tenantId 
          ? { ...tenant, apartmentId: apartmentId || null, role: role || 'member' }
          : tenant
      )
    }));
  };

  // Get tenants for an apartment
  const getApartmentTenants = (apartmentId) => {
    return data.tenants.filter(tenant => tenant.apartmentId === apartmentId);
  };

  // Get tenant count for apartment (excluding contract signers)
  const getApartmentTenantCount = (apartmentId) => {
    return data.tenants.filter(tenant => 
      tenant.apartmentId === apartmentId && tenant.role !== 'contract_signer'
    ).length;
  };

  // Get primary tenant for billing (contract signer first, then room leader)
  const getPrimaryTenant = (apartmentId) => {
    const tenants = getApartmentTenants(apartmentId);
    const contractSigner = tenants.find(t => t.role === 'contract_signer');
    const roomLeader = tenants.find(t => t.role === 'room_leader');
    return contractSigner || roomLeader || tenants[0];
  };

  // Check if apartment is occupied
  const isApartmentOccupied = (apartmentId) => {
    return getApartmentTenantCount(apartmentId) > 0;
  };

  // Contract functions
  const addContract = (contract) => {
    const newContract = {
      ...contract,
      id: Date.now().toString(),
    };
    setData(prev => ({
      ...prev,
      contracts: [...prev.contracts, newContract]
    }));
    
    // Update apartment status
    updateApartment(contract.apartmentId, { 
      status: 'occupied', 
      currentTenantId: contract.tenantId 
    });
    
    return newContract;
  };

  const updateContract = (contractId, updates) => {
    setData(prev => ({
      ...prev,
      contracts: prev.contracts.map(contract => 
        contract.id === contractId ? { ...contract, ...updates } : contract
      )
    }));
  };

  const deleteContract = (contractId) => {
    const contract = data.contracts.find(c => c.id === contractId);
    if (contract) {
      // Update apartment status to available
      updateApartment(contract.apartmentId, { 
        status: 'available', 
        currentTenantId: null 
      });
    }
    
    setData(prev => ({
      ...prev,
      contracts: prev.contracts.filter(contract => contract.id !== contractId)
    }));
  };

  // Invoice functions
  const addInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
    };
    setData(prev => ({
      ...prev,
      invoices: [...prev.invoices, newInvoice]
    }));
    return newInvoice;
  };

  const updateInvoice = (invoiceId, updates) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, ...updates } : invoice
      )
    }));
  };

  const deleteInvoice = (invoiceId) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.filter(invoice => invoice.id !== invoiceId)
    }));
  };

  // User management (admin only)
  const addUser = (user) => {
    const newUser = {
      ...user,
      id: Date.now().toString(),
    };
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    return newUser;
  };

  const updateUser = (userId, updates) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      )
    }));
  };

  const deleteUser = (userId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId)
    }));
  };

  // Cost settings functions
  const updateCostSettings = (newSettings) => {
    setData(prev => ({
      ...prev,
      costSettings: { ...prev.costSettings, ...newSettings }
    }));
  };

  const updateRoomPrice = (apartmentId, price) => {
    setData(prev => ({
      ...prev,
      roomPrices: { ...prev.roomPrices, [apartmentId]: price }
    }));
  };

  const getRoomPrice = (apartmentId) => {
    return data.roomPrices[apartmentId] || data.apartments.find(apt => apt.id === apartmentId)?.rent || 0;
  };

  const value = {
    data,
    currentUser,
    login,
    logout,
    updateApartment,
    addTenant,
    updateTenant,
    deleteTenant,
    assignTenantToApartment,
    getApartmentTenants,
    getApartmentTenantCount,
    getPrimaryTenant,
    isApartmentOccupied,
    addContract,
    updateContract,
    deleteContract,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addUser,
    updateUser,
    deleteUser,
    updateCostSettings,
    updateRoomPrice,
    getRoomPrice,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 