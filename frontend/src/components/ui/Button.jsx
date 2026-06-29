import React from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  'outline-danger': 'btn-outline-danger',
};
const sizes = { sm: 'px-3 py-2 text-xs', md: '', lg: 'px-6 py-3.5 text-base' };

const Button = ({ children, variant = 'primary', size = 'md', full = false, loading = false, className = '', ...props }) => (
  <button
    className={`${variants[variant] || variants.primary} ${sizes[size]} ${full ? 'btn-full' : ''} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <span className="spinner w-4 h-4" /> : children}
  </button>
);

export default Button;
