import React from 'react';
import { STATUS_BADGE_CONFIG } from '../../utils/constants';

const StatusBadge = ({ status, type = 'contract', className = '' }) => {
  const config = STATUS_BADGE_CONFIG[status];
  
  if (!config) {
    return null;
  }

  const getStatusLabel = () => {
    if (type === 'tenant') {
      return status === 'active' ? '✅ Hoạt động' : '❌ Không hoạt động';
    }
    return config.label;
  };

  const getStatusClass = () => {
    if (type === 'tenant') {
      return status === 'active' 
        ? 'text-green-700 bg-green-100' 
        : 'text-red-700 bg-red-100';
    }
    return config.class;
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass()} ${className}`}>
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge; 