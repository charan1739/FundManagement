import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import { fmtCurrency } from '../utils/helpers';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();
  const isAdmin = group.myRole === 'admin';

  return (
    <button
      onClick={() => navigate(`/groups/${group._id}`)}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-blue-700 font-bold text-base">
          {group.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 text-sm truncate">{group.name}</p>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'} flex-shrink-0`}>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">Balance: {fmtCurrency(group.currentBalance)}</p>
      </div>

      <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
    </button>
  );
};

export default GroupCard;
