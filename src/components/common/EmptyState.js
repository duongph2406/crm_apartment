import React from 'react';

const EmptyState = ({ 
  icon = '📄',
  title = 'Không có dữ liệu',
  description = '',
  action = null,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-muted mb-4">
        <div className="w-16 h-16 mx-auto text-light flex items-center justify-center text-3xl">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-medium text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-secondary mb-4">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 