import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, id, error, maxLength, value = '', className = '', ...props }, ref) => (
  <div>
    {label && <label htmlFor={id} className="field-label">{label}</label>}
    <input
      id={id} ref={ref}
      value={value}
      maxLength={maxLength}
      className={`field-input ${error ? 'error' : ''} ${className}`}
      {...props}
    />
    {maxLength && <p className="char-counter">{String(value).length}/{maxLength}</p>}
    {error && <p className="text-xs text-danger mt-1">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
