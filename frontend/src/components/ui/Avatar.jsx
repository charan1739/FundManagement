import React from 'react';
import { getInitials, avatarColor } from '../../utils/formatters';

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-2xl' };

const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const initials = getInitials(name);
  const bg = avatarColor(name);

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-brand flex-shrink-0 ${className}`}
      style={{ backgroundColor: bg }}
    >
      {initials || '?'}
    </div>
  );
};

export default Avatar;
