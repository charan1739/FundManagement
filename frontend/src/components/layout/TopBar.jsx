import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TopBar = ({ title, rightSlot, onBack, showBack = true }) => {
  const navigate = useNavigate();

  return (
    <div className="top-bar">
      {showBack && (
        <button
          onClick={onBack || (() => navigate(-1))}
          className="p-1.5 -ml-1.5 text-brand-muted hover:text-brand hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="top-bar-title">{title}</h1>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
};

export default TopBar;
