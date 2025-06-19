import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  maxLength,
  min,
  max,
  rows,
  ...props
}) => {
  const hasError = touched && error;
  const inputClasses = `input w-full ${hasError ? 'border-red-500' : ''} ${className}`;

  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      value: value || '',
      onChange,
      onBlur,
      placeholder,
      disabled,
      className: inputClasses,
      maxLength,
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows || 3}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            {props.children}
          </select>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            min={min}
            max={max}
          />
        );
    }
  };

  return (
    <div className={props.containerClassName}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-secondary mb-2">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {renderInput()}
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormInput; 