import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses =
    'w-full px-4 py-3 bg-mystery-purple border border-gray-600 rounded-lg text-mystery-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mystery-gold focus:border-transparent transition-all duration-200';

  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';

  const inputClasses = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-mystery-light mb-2"
        >
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...props} />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
};
