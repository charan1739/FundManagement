import React, { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';

const ACCEPTED = 'image/jpeg, image/png, application/pdf';

const FileUpload = ({ file, onChange, onRemove, label = 'Attach Document (optional)', disabled = false }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      alert('File too large — max 5 MB');
      return;
    }
    onChange(selected);
    e.target.value = '';
  };

  return (
    <div>
      <p className="field-label">{label}</p>
      {file ? (
        <div className="file-chip">
          <Paperclip size={13} className="flex-shrink-0" />
          <span className="flex-1 truncate">{file.name}</span>
          <button type="button" onClick={onRemove} disabled={disabled} className="text-brand-muted hover:text-danger transition-colors">
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-accent text-brand-sub hover:border-primary hover:text-primary transition-all text-sm w-full"
        >
          <Paperclip size={15} />
          <span>Attach JPG, PNG, or PDF (max 5 MB)</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleChange} />
    </div>
  );
};

export default FileUpload;
