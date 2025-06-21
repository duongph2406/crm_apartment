import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Fixed room numbers as specified
const ROOM_NUMBERS = ['102', '201', '202', '301', '302', '401', '402', '501', '502', '601', '602'];

// Sample data for development
const initialData = {
  apartments: ROOM_NUMBERS.map(room => {
    // Phòng 201, 301, 401, 501, 601 có diện tích 25m2, các phòng khác 20m2
    const size = ['201', '301', '401', '501', '601'].includes(room) ? 25 : 20;
    
    // Giá phòng theo quy định:
    // Phòng *01: 5,200,000 VNĐ
    // Phòng *02: 4,200,000 VNĐ
    // Phòng 602: 4,400,000 VNĐ (đặc biệt)
    let rent;
    if (room === '602') {
      rent = 4400000;
    } else if (room.endsWith('01')) {
      rent = 5200000;
    } else if (room.endsWith('02')) {
      rent = 4200000;
    } else {
      rent = 5000000; // Default fallback
    }
    
    // Set specific room statuses for consistent data
    let status, currentTenantId;
    if (room === '102') {
      status = 'occupied';
      currentTenantId = '1';
    } else if (room === '201') {
      status = 'occupied';
      currentTenantId = '4';
    } else if (room === '302') {
      status = 'maintenance';
      currentTenantId = null;
    } else {
      status = 'available';
      currentTenantId = null;
    }

    return {
      id: room,
      roomNumber: room,
      size: size,
      status: status,
      rent: rent,
      currentTenantId: currentTenantId,
      description: `Căn hộ ${size}m² tiêu chuẩn`,
    };
  }),
  tenants: [
    {
      id: '1',
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'nguyenvanan@email.com',
      idNumber: '123456789',
      address: '123 Lê Lợi, Q1, TP.HCM',
      apartmentId: '102', // Assigned apartment
      role: 'room_leader', // Trưởng phòng: vừa ký hợp đồng vừa ở trọ
      status: 'active', // active, inactive
    },
    {
      id: '2',
      fullName: 'Trần Thị Bình',
      phone: '0987654321',
      email: 'tranthibibinh@email.com',
      idNumber: '987654321',
      address: '456 Nguyễn Huệ, Q1, TP.HCM',
      apartmentId: '102', // Same apartment as tenant 1
      role: 'member',
      status: 'active',
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
      status: 'active',
    },
    {
      id: '4',
      fullName: 'Phạm Thu Hương',
      phone: '0923456789',
      email: 'phamthuhuong@email.com',
      idNumber: '789123456',
      address: '321 Hai Bà Trưng, Q3, TP.HCM',
      apartmentId: '201',
      role: 'room_leader',
      status: 'active',
    },
  ],
  contracts: [
    {
      id: '1',
      contractNumber: 'HĐ001/HĐTCH-2024',
      apartmentId: '102',
      tenantId: '1',
      signDate: '2024-01-01',
      startDate: '2024-01-01',
      endDate: '2024-08-31', // Set this to an expired date for testing
      monthlyRent: 6000000,
      deposit: 12000000,
      status: 'active', // Will be auto-updated to 'expired' by sync function
      createdAt: '2024-01-01T10:00:00.000Z'
    },
    {
      id: '2',
      contractNumber: 'HĐ002/HĐTCH-2024',
      apartmentId: '201',
      tenantId: '4',
      signDate: '2024-02-01',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      monthlyRent: 5200000,
      deposit: 10400000,
      status: 'active',
      createdAt: '2024-02-01T10:00:00.000Z'
    },
  ],
  invoices: [
    {
      id: 1,
      invoiceNumber: 'HĐ001',
      contractId: '1',
      apartmentId: '102',
      tenantId: '1',
      month: 7,
      year: 2024,
      rent: 5000000,
      electricity: 200000,
      water: 100000,
      internet: 200000,
      cleaning: 50000,
      other: 0,
      otherDescription: '',
      amount: 5550000,
      dueDate: '2024-07-15',
      issueDate: '2024-07-01',
      status: 'paid',
      createdAt: '2024-07-01T00:00:00'
    },
    {
      id: 2,
      invoiceNumber: 'HĐ002',
      contractId: '1',
      apartmentId: '102',
      tenantId: '1',
      month: 8,
      year: 2024,
      rent: 5000000,
      electricity: 250000,
      water: 100000,
      internet: 200000,
      cleaning: 50000,
      other: 100000,
      otherDescription: 'Phí bảo trì thang máy',
      amount: 5700000,
      dueDate: '2024-08-15',
      issueDate: '2024-08-01',
      status: 'unpaid',
      createdAt: '2024-08-01T00:00:00'
    },
    {
      id: 3,
      invoiceNumber: 'HĐ003',
      contractId: '2',
      apartmentId: '201',
      tenantId: '4',
      month: 7,
      year: 2024,
      rent: 5200000,
      electricity: 180000,
      water: 100000,
      internet: 200000,
      cleaning: 50000,
      other: 0,
      otherDescription: '',
      amount: 5530000,
      dueDate: '2024-07-15',
      issueDate: '2024-07-01',
      status: 'paid',
      createdAt: '2024-07-01T00:00:00'
    },
    {
      id: 4,
      invoiceNumber: 'HĐ004',
      contractId: '2',
      apartmentId: '201',
      tenantId: '4',
      month: 8,
      year: 2024,
      rent: 5200000,
      electricity: 220000,
      water: 100000,
      internet: 200000,
      cleaning: 50000,
      other: 0,
      otherDescription: '',
      amount: 5570000,
      dueDate: '2024-08-15',
      issueDate: '2024-08-01',
      status: 'unpaid',
      createdAt: '2024-08-01T00:00:00'
    },
  ],
  costSettings: {
    electricityRate: 4000, // VNĐ/kWh
    waterRatePerPerson: 100000, // VNĐ/người/tháng
    internetRatePerRoom: 100000, // VNĐ/phòng/tháng
    serviceFeePerPerson: 100000, // VNĐ/người/tháng
    lastUpdated: new Date().toISOString()
  },
  roomPrices: {
    // Giá phòng riêng cho từng phòng
    // Nếu không set riêng thì dùng giá mặc định từ apartment
  },
  bankInfo: {
    bankName: 'Ngân hàng Vietcombank',
    bankCode: 'VCB',
    accountNumber: '0123456789',
    accountName: 'NGUYEN VAN A',
    qrEnabled: true,
    lastUpdated: new Date().toISOString()
  },
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      fullName: 'Quản trị viên',
      email: 'admin@crm.com',
      phone: '0901234567',
      address: '123 Nguyễn Văn A, Quận 1, TP.HCM',
      status: 'active',
      createdAt: '2024-01-01',
      lastLogin: new Date().toISOString()
    },
    {
      id: '2',
      username: 'manager',
      password: 'manager123',
      role: 'manager',
      fullName: 'Người quản lý',
      email: 'manager@crm.com',
      phone: '0902345678',
      address: '456 Lê Lợi, Quận 3, TP.HCM',
      status: 'active',
      createdAt: '2024-01-01',
      lastLogin: new Date().toISOString()
    },
    {
      id: '3',
      username: 'user',
      password: 'user123',
      role: 'user',
      fullName: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      phone: '0903456789',
      address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
      status: 'active',
      tenantId: '1', // Liên kết với tenant có id '1'
      createdAt: '2024-01-01',
      lastLogin: new Date().toISOString()
    },
  ],
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(initialData);
  const [currentUser, setCurrentUser] = useState(null);

  // Function to sync contract status based on current date
  const syncContractStatus = (dataToSync) => {
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    
    const updatedContracts = dataToSync.contracts.map(contract => {
      // Skip if manually set to inactive (thanh lý)
      if (contract.status === 'inactive') {
        return contract;
      }
      
      // Calculate status based on dates
      let newStatus;
      if (contract.startDate > today) {
        newStatus = 'pending'; // Chưa có hiệu lực
      } else if (contract.endDate < today) {
        newStatus = 'expired'; // Hết hạn
      } else {
        newStatus = 'active'; // Hiệu lực
      }
      
      // Check if status changed
      if (contract.status !== newStatus) {
        hasChanges = true;
        return { ...contract, status: newStatus };
      }
      return contract;
    });
    
    if (!hasChanges) return dataToSync;
    
    // Update tenants status for expired contracts
    const expiredContractApartments = updatedContracts
      .filter(c => c.status === 'expired')
      .map(c => c.apartmentId);
    
    const updatedTenants = dataToSync.tenants.map(tenant => {
      if (expiredContractApartments.includes(tenant.apartmentId) && tenant.status === 'active') {
        // Set status to inactive and remove apartment assignment
        return { ...tenant, status: 'inactive', apartmentId: null };
      }
      return tenant;
    });
    
    // Update apartments - ensure rooms without active contracts are available
    const updatedApartments = dataToSync.apartments.map(apartment => {
      const hasActiveContract = updatedContracts.some(c => 
        c.apartmentId === apartment.id && c.status === 'active'
      );
      
      // If no active contract and not in maintenance, set to available and clear currentTenantId
      if (!hasActiveContract && apartment.status !== 'maintenance') {
        return { 
          ...apartment, 
          status: 'available',
          currentTenantId: null  // Clear tenant assignment when no active contract
        };
      }
      return apartment;
    });
    
    return {
      ...dataToSync,
      contracts: updatedContracts,
      tenants: updatedTenants,
      apartments: updatedApartments
    };
  };

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem('apartmentData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Sync contract status on load
      const syncedData = syncContractStatus(parsedData);
      setData(syncedData);
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

  // Check and sync status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => syncContractStatus(prevData));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Function to force sync contract status immediately
  const forceSyncContractStatus = () => {
    setData(prevData => syncContractStatus(prevData));
  };

  // Function to check and handle expired contracts (kept for manual use only)
  const checkExpiredContracts = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const expiredContracts = data.contracts.filter(contract => 
      contract.status === 'active' && contract.endDate < today
    );
    
    if (expiredContracts.length > 0) {
      setData(prev => {
        const updatedContracts = prev.contracts.map(contract => 
          expiredContracts.some(ec => ec.id === contract.id)
            ? { ...contract, status: 'expired' }
            : contract
        );
        
        const updatedTenants = prev.tenants.map(tenant => {
          const isInExpiredContract = expiredContracts.some(contract => 
            contract.apartmentId === tenant.apartmentId
          );
          return isInExpiredContract && tenant.status === 'active'
            ? { ...tenant, status: 'inactive', apartmentId: null }
            : tenant;
        });
        
        const updatedApartments = prev.apartments.map(apartment => {
          const hasExpiredContract = expiredContracts.some(contract => 
            contract.apartmentId === apartment.id
          );
          return hasExpiredContract
            ? { ...apartment, status: 'available', currentTenantId: null }
            : apartment;
        });
        
        return {
          ...prev,
          contracts: updatedContracts,
          tenants: updatedTenants,
          apartments: updatedApartments
        };
      });
    }
  };

  // Authentication functions
  const login = (username, password) => {
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      // Check if user is active
      if (user.status !== 'active') {
        alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        return false;
      }
      
      // Update last login time
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => 
          u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
        )
      }));
      
      const userWithoutPassword = { ...user, lastLogin: new Date().toISOString() };
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
    // Check if apartment has active contract
    const hasActiveContract = data.contracts.some(contract => 
      contract.apartmentId === apartmentId && 
      contract.status === 'active'
    );
    
    // If apartment has active contract, don't allow status changes
    if (hasActiveContract && updates.status) {
      // Remove status from updates - status is managed by contract
      const { status, ...allowedUpdates } = updates;
      updates = allowedUpdates;
    }

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
      status: tenant.status || 'active', // Default to active if not specified
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

  // Assign tenant to apartment with role validation
  const assignTenantToApartment = (tenantId, apartmentId, role) => {
    // Validate role constraints if apartment is specified
    if (apartmentId && role) {
      const apartmentTenants = data.tenants.filter(t => 
        t.apartmentId === apartmentId && t.id !== tenantId
      );
      
      const hasContractSigner = apartmentTenants.some(t => t.role === 'contract_signer');
      const hasRoomLeader = apartmentTenants.some(t => t.role === 'room_leader');
      
      // Check role constraints
      if (hasRoomLeader && role === 'contract_signer') {
        console.warn('Cannot assign contract_signer: apartment already has room_leader');
        return false;
      }
      
      if (hasContractSigner && role === 'room_leader') {
        console.warn('Cannot assign room_leader: apartment already has contract_signer');
        return false;
      }
      
      if (hasContractSigner && role === 'contract_signer') {
        console.warn('Cannot assign contract_signer: apartment already has one');
        return false;
      }
      
      if (hasRoomLeader && role === 'room_leader') {
        console.warn('Cannot assign room_leader: apartment already has one');
        return false;
      }
    }
    
    setData(prev => ({
      ...prev,
      tenants: prev.tenants.map(tenant =>
        tenant.id === tenantId 
          ? { ...tenant, apartmentId: apartmentId || null, role: role || 'member' }
          : tenant
      )
    }));
    
    return true;
  };

  // Get tenants for an apartment (only active tenants)
  const getApartmentTenants = (apartmentId) => {
    return data.tenants.filter(tenant => 
      tenant.apartmentId === apartmentId && 
      tenant.status === 'active'
    );
  };

  // Get tenant count for apartment (excluding contract signers, including room leaders, only active)
  const getApartmentTenantCount = (apartmentId) => {
    return data.tenants.filter(tenant => 
      tenant.apartmentId === apartmentId && 
      tenant.role !== 'contract_signer' &&
      tenant.status === 'active'
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

  // Generate contract number based on year
  const generateContractNumber = () => {
    const currentYear = new Date().getFullYear();
    
    // Get all contracts for the current year
    const contractsThisYear = data.contracts.filter(contract => {
      const contractYear = new Date(contract.createdAt || contract.signDate).getFullYear();
      return contractYear === currentYear;
    });
    
    // Extract numbers from existing contracts
    const existingNumbers = contractsThisYear
      .map(contract => {
        const match = contract.contractNumber.match(/HĐ(\d{3})\/HĐTCH-\d{4}/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    // Find the next available number
    let nextNumber = 1;
    if (existingNumbers.length > 0) {
      nextNumber = Math.max(...existingNumbers) + 1;
    }
    
    // Format with leading zeros
    const formattedNumber = String(nextNumber).padStart(3, '0');
    
    // Return the formatted contract number
    return `HĐ${formattedNumber}/HĐTCH-${currentYear}`;
  };

  // Contract functions
  const addContract = (contract) => {
    const newContract = {
      ...contract,
      id: Date.now().toString(),
    };
    
    setData(prev => {
      // Get tenant information to create user account
      const tenant = prev.tenants.find(t => t.id === contract.tenantId);
      let updatedUsers = prev.users;
      
      if (tenant && (tenant.role === 'contract_signer' || tenant.role === 'room_leader')) {
        // Check if user account already exists for this tenant
        const existingUser = prev.users.find(u => u.tenantId === tenant.id);
        
        if (!existingUser) {
          // Check if username (contract number) already exists
          const existingUsername = prev.users.find(u => u.username === contract.contractNumber);
          if (existingUsername) {
            // If username exists, show warning but continue creating contract
            setTimeout(() => {
              alert(`⚠️ Lưu ý: Tên đăng nhập "${contract.contractNumber}" đã tồn tại.\n\nKhông thể tạo tài khoản tự động cho khách thuê này.\nVui lòng tạo tài khoản thủ công nếu cần.`);
            }, 100);
          } else {
            // Create user account with contract number as username
            const newUserAccount = {
              id: Date.now().toString() + '_user',
              username: contract.contractNumber,
              password: '123@123a', // Default password
              fullName: tenant.fullName,
              email: tenant.email || '',
              phone: tenant.phone || '',
              address: tenant.permanentAddress || '',
              role: 'user',
              status: 'active',
              tenantId: tenant.id,
              createdAt: new Date().toISOString(),
              lastLogin: null
            };
            
            // Add user to users array
            updatedUsers = [...prev.users, newUserAccount];
          
            // Show notification about new account
            setTimeout(() => {
              alert(`Tài khoản đã được tạo tự động!\n\nTên đăng nhập: ${contract.contractNumber}\nMật khẩu: 123@123a\n\nVui lòng thông báo cho khách thuê và yêu cầu đổi mật khẩu khi đăng nhập lần đầu.`);
            }, 100);
          }
        }
      }
      
      // Add new contract
      const updatedContracts = [...prev.contracts, newContract];
      
      // Update apartment status to occupied (remove from available/maintenance)
      const updatedApartments = prev.apartments.map(apt => 
        apt.id === contract.apartmentId 
          ? { ...apt, status: 'occupied', currentTenantId: contract.tenantId }
          : apt
      );
      
      return {
        ...prev,
        contracts: updatedContracts,
        apartments: updatedApartments,
        users: updatedUsers
      };
    });
    
    return newContract;
  };

  const updateContract = (contractId, updates) => {
    setData(prev => {
      const updatedContracts = prev.contracts.map(contract => 
        contract.id === contractId ? { ...contract, ...updates } : contract
      );
      
      // If contract is being set to expired, update apartment and tenants
      if (updates.status === 'expired') {
        const expiredContract = updatedContracts.find(c => c.id === contractId);
        if (expiredContract) {
          // Check if apartment has other active contracts
          const hasOtherActiveContract = updatedContracts.some(c => 
            c.apartmentId === expiredContract.apartmentId && 
            c.status === 'active' && 
            c.id !== contractId
          );
          
          if (!hasOtherActiveContract) {
            // Update apartment status
            const updatedApartments = prev.apartments.map(apt => 
              apt.id === expiredContract.apartmentId && apt.status !== 'maintenance'
                ? { ...apt, status: 'available', currentTenantId: null }
                : apt
            );
            
            // Update tenants status and remove apartment assignment
            const updatedTenants = prev.tenants.map(tenant => 
              tenant.apartmentId === expiredContract.apartmentId && tenant.status === 'active'
                ? { ...tenant, status: 'inactive', apartmentId: null }
                : tenant
            );
            
            return {
              ...prev,
              contracts: updatedContracts,
              apartments: updatedApartments,
              tenants: updatedTenants
            };
          }
        }
      }
      
      return {
        ...prev,
        contracts: updatedContracts
      };
    });
  };

  const deleteContract = (contractId) => {
    setData(prev => {
      const contractToDelete = prev.contracts.find(c => c.id === contractId);
      if (!contractToDelete) return prev;
      
      // Remove contract
      const updatedContracts = prev.contracts.filter(contract => contract.id !== contractId);
      
      // Check if apartment has any other active contracts
      const hasOtherActiveContract = updatedContracts.some(c => 
        c.apartmentId === contractToDelete.apartmentId && c.status === 'active'
      );
      
      // Update apartment status to available if no other active contracts
      const updatedApartments = prev.apartments.map(apt => {
        if (apt.id === contractToDelete.apartmentId && !hasOtherActiveContract) {
          // If apartment is not in maintenance, set to available
          return apt.status === 'maintenance' 
            ? apt 
            : { ...apt, status: 'available', currentTenantId: null };
        }
        return apt;
      });
      
      // Update tenants status to inactive and remove apartment assignment
      const updatedTenants = prev.tenants.map(tenant => 
        tenant.apartmentId === contractToDelete.apartmentId && tenant.status === 'active'
          ? { ...tenant, status: 'inactive', apartmentId: null }
          : tenant
      );
      
      return {
        ...prev,
        contracts: updatedContracts,
        apartments: updatedApartments,
        tenants: updatedTenants
      };
    });
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
      status: user.status || 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
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
    
    // Update currentUser if updating self
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      // Remove password from currentUser
      delete updatedUser.password;
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
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

  // Bank info functions
  const updateBankInfo = (bankInfo) => {
    setData(prev => ({
      ...prev,
      bankInfo: bankInfo
    }));
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
    generateContractNumber,
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
    updateBankInfo,
    checkExpiredContracts,
    forceSyncContractStatus,
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