import React, { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer = null,
  fullHeight = true
}) => {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  // Size classes for width
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    'full': 'max-w-[90%]'
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`bg-primary rounded-xl shadow-xl w-[90%] ${sizeClasses[size]} my-8 overflow-hidden flex flex-col max-h-[90vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          {(title || showCloseButton) && (
            <div className="p-6 border-b border-primary flex justify-between items-center flex-shrink-0">
              {title && (
                <h3 className="text-lg font-semibold text-primary">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-secondary hover:text-primary transition-colors ml-4"
                  aria-label="Đóng"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
          
          {/* Footer - Fixed */}
          {footer && (
            <div className="p-6 border-t border-primary flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 