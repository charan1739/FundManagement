import React from 'react';
import { Trash2, Shield, User } from 'lucide-react';
import { getInitials } from '../utils/helpers';

const MemberItem = ({ member, isAdmin, currentUserId, onRemove }) => {
  const isMe = member.user?._id === currentUserId;
  const memberIsAdmin = member.role === 'admin';
  const isPending = member.status === 'pending';

  return (
    <div className="list-item">
      <div className="avatar">
        {getInitials(member.user?.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {member.user?.name}
            {isMe && <span className="text-gray-400 font-normal"> (you)</span>}
          </p>
          <span className={`badge ${memberIsAdmin ? 'badge-admin' : 'badge-member'}`}>
            {memberIsAdmin ? 'Admin' : 'Member'}
          </span>
          {isPending && <span className="badge badge-pending">Pending</span>}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">@{member.user?.username}</p>
      </div>
      {isAdmin && !memberIsAdmin && !isMe && !isPending && (
        <button
          onClick={() => onRemove(member.user._id, member.user.name)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
};

export default MemberItem;
