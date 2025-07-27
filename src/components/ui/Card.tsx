import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
}) => {
  const baseClasses =
    'bg-mystery-purple rounded-lg p-6 shadow-lg border border-gray-700';
  const cardClasses = `${baseClasses} ${className}`;

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-mystery font-semibold text-mystery-light mb-1">
              {title}
            </h3>
          )}
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
