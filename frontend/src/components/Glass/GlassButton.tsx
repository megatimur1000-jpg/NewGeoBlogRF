import React from 'react';
import './GlassButton.css';

export interface GlassButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const GlassButton: React.FC<GlassButtonProps> = ({
  onClick,
  variant = 'secondary',
  icon,
  children,
  disabled = false,
  active = false,
  type = 'button',
  className = '',
  fullWidth = false,
  size = 'medium',
  ...rest
}) => {
  const baseClasses = `glass-button glass-button-${variant} glass-button-${size} ${active ? 'glass-button-active' : ''} ${fullWidth ? 'glass-button-full-width' : ''} ${className}`;

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      {...rest}
    >
      {icon && <span className="glass-button-icon">{icon}</span>}
      {children && <span className="glass-button-text">{children}</span>}
    </button>
  );
};

export default GlassButton;

