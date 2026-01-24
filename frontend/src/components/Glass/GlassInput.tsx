import React, { forwardRef } from 'react';
import './GlassInput.css';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, leftIcon, rightIcon, fullWidth = false, className = '', ...props }, ref) => {
    const inputClasses = `glass-input ${fullWidth ? 'glass-input-full-width' : ''} ${error ? 'glass-input-error' : ''} ${className}`;

    return (
      <div className={`glass-input-wrapper ${fullWidth ? 'glass-input-wrapper-full-width' : ''}`}>
        {label && (
          <label className="glass-input-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="glass-input-container">
          {leftIcon && <span className="glass-input-icon glass-input-icon-left">{leftIcon}</span>}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {rightIcon && <span className="glass-input-icon glass-input-icon-right">{rightIcon}</span>}
        </div>
        {error && <span className="glass-input-error-text">{error}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;

