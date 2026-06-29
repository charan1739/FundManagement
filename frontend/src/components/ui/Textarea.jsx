import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ label, id, error, maxLength, value = '', rows = 3, className = '', ...props }, ref) => (
  <div>
    {label && <label htmlFor={id} className="field-label">{label}</label>}
    <textarea
      id={id} ref={ref} rows={rows}
      value={value} maxLength={maxLength}
      className={`field-input resize-none ${error ? 'error' : ''} ${className}`}
      {...props}
    />
    {maxLength && <p className="char-counter">{String(value).length}/{maxLength}</p>}
    {error && <p className="text-xs text-danger mt-1">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';
export default Textarea;
