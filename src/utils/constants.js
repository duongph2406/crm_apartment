// Regex Patterns
export const REGEX_PATTERNS = {
  PHONE: /^[0-9]{10}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_NUMBER: /^[0-9]{12}$/,
};

// Role Configurations
export const ROLE_CONFIG = {
  contract_signer: {
    label: 'Người ký hợp đồng',
    icon: '📝',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'Ký HĐ - Không ở trọ'
  },
  room_leader: {
    label: 'Trưởng phòng',
    icon: '👑',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Ký HĐ + Ở trọ - Đại diện phòng'
  },
  member: {
    label: 'Thành viên',
    icon: '👤',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: 'Ở trọ - Thành viên phòng'
  }
};

// Status Configurations
export const CONTRACT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  INACTIVE: 'inactive'
};

export const TENANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

export const APARTMENT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance'
};

// Default Values
export const DEFAULT_VALUES = {
  ID_ISSUE_PLACE: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
  TENANT_ROLE: 'room_leader',
  MEMBER_ROLE: 'member'
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ tất cả các trường bắt buộc!',
  PHONE_INVALID: 'Số điện thoại phải có đúng 10 chữ số!',
  EMAIL_INVALID: 'Email không đúng định dạng!',
  ID_INVALID: 'Số CCCD phải có đúng 12 chữ số!',
  TENANT_REQUIRED_FIELDS: `Vui lòng nhập đầy đủ thông tin khách thuê bắt buộc!

Các trường bắt buộc:
- Họ và tên
- Số điện thoại
- Số CCCD
- Ngày cấp CCCD
- Nơi cấp CCCD
- Quê quán
- Nơi thường trú`,
  MEMBER_REQUIRED_FIELDS: `Vui lòng điền đầy đủ tất cả các trường bắt buộc cho thành viên!

Các trường bắt buộc:
- Họ và tên
- Số điện thoại
- Số CCCD
- Ngày cấp CCCD
- Nơi cấp CCCD
- Quê quán
- Nơi thường trú`
};

// Badge Classes
export const BADGE_CLASSES = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  secondary: 'badge-secondary'
};

// Status Badge Config
export const STATUS_BADGE_CONFIG = {
  [CONTRACT_STATUS.ACTIVE]: {
    class: BADGE_CLASSES.success,
    label: 'Hiệu lực'
  },
  [CONTRACT_STATUS.PENDING]: {
    class: BADGE_CLASSES.warning,
    label: 'Chưa có hiệu lực'
  },
  [CONTRACT_STATUS.INACTIVE]: {
    class: BADGE_CLASSES.secondary,
    label: 'Đã thanh lý'
  },
  [CONTRACT_STATUS.EXPIRED]: {
    class: BADGE_CLASSES.danger,
    label: 'Hết hạn'
  }
}; 