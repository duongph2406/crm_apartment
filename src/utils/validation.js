import { REGEX_PATTERNS, VALIDATION_MESSAGES } from './constants';

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, message: 'Số điện thoại là bắt buộc' };
  if (!REGEX_PATTERNS.PHONE.test(phone)) {
    return { isValid: false, message: VALIDATION_MESSAGES.PHONE_INVALID };
  }
  return { isValid: true };
};

// Email validation
export const validateEmail = (email) => {
  if (!email) return { isValid: true }; // Email is optional
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, message: VALIDATION_MESSAGES.EMAIL_INVALID };
  }
  return { isValid: true };
};

// ID Number validation
export const validateIdNumber = (idNumber) => {
  if (!idNumber) return { isValid: false, message: 'Số CCCD là bắt buộc' };
  if (!REGEX_PATTERNS.ID_NUMBER.test(idNumber)) {
    return { isValid: false, message: VALIDATION_MESSAGES.ID_INVALID };
  }
  return { isValid: true };
};

// Tenant validation
export const validateTenantData = (data) => {
  const errors = {};
  
  // Required fields
  if (!data.fullName) errors.fullName = 'Họ và tên là bắt buộc';
  if (!data.phone) errors.phone = 'Số điện thoại là bắt buộc';
  if (!data.idNumber) errors.idNumber = 'Số CCCD là bắt buộc';
  if (!data.idIssueDate) errors.idIssueDate = 'Ngày cấp CCCD là bắt buộc';
  if (!data.idIssuePlace) errors.idIssuePlace = 'Nơi cấp CCCD là bắt buộc';
  if (!data.hometown) errors.hometown = 'Quê quán là bắt buộc';
  if (!data.permanentAddress) errors.permanentAddress = 'Nơi thường trú là bắt buộc';
  
  // Format validation
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) errors.email = emailValidation.message;
  
  const idValidation = validateIdNumber(data.idNumber);
  if (!idValidation.isValid) errors.idNumber = idValidation.message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Contract validation
export const validateContractData = (data) => {
  const errors = {};
  
  if (!data.contractNumber) errors.contractNumber = 'Số hợp đồng là bắt buộc';
  if (!data.apartmentId) errors.apartmentId = 'Phòng là bắt buộc';
  if (!data.startDate) errors.startDate = 'Ngày bắt đầu là bắt buộc';
  if (!data.endDate) errors.endDate = 'Ngày kết thúc là bắt buộc';
  if (!data.monthlyRent) errors.monthlyRent = 'Tiền thuê hàng tháng là bắt buộc';
  if (!data.deposit) errors.deposit = 'Tiền cọc là bắt buộc';
  
  // Validate dates
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start >= end) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
  }
  
  // Validate tenant info
  const tenantValidation = validateTenantData({
    fullName: data.tenantName,
    phone: data.tenantPhone,
    email: data.tenantEmail,
    idNumber: data.tenantIdNumber,
    idIssueDate: data.tenantIdIssueDate,
    idIssuePlace: data.tenantIdIssuePlace,
    hometown: data.tenantHometown,
    permanentAddress: data.tenantPermanentAddress
  });
  
  if (!tenantValidation.isValid) {
    Object.keys(tenantValidation.errors).forEach(key => {
      errors[`tenant${key.charAt(0).toUpperCase() + key.slice(1)}`] = tenantValidation.errors[key];
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Member validation
export const validateMemberData = (data) => {
  return validateTenantData(data);
};

// Role validation in apartment
export const validateRoleInApartment = (apartmentTenants, newRole, excludeTenantId = null) => {
  const filteredTenants = apartmentTenants.filter(t => t.id !== excludeTenantId);
  const hasContractSigner = filteredTenants.some(t => t.role === 'contract_signer');
  const hasRoomLeader = filteredTenants.some(t => t.role === 'room_leader');
  
  if (hasRoomLeader && newRole === 'contract_signer') {
    return {
      isValid: false,
      message: 'Phòng đã có trưởng phòng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.'
    };
  }
  
  if (hasContractSigner && newRole === 'room_leader') {
    return {
      isValid: false,
      message: 'Phòng đã có người ký hợp đồng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.'
    };
  }
  
  if (hasContractSigner && newRole === 'contract_signer') {
    return {
      isValid: false,
      message: 'Mỗi phòng chỉ có thể có 1 người ký hợp đồng.'
    };
  }
  
  if (hasRoomLeader && newRole === 'room_leader') {
    return {
      isValid: false,
      message: 'Mỗi phòng chỉ có thể có 1 trưởng phòng.'
    };
  }
  
  return { isValid: true };
}; 