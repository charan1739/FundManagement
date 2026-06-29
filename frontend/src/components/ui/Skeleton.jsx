import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-accent/60 rounded-xl ${className}`} />
);

export const SkeletonGroup = () => (
  <div className="px-4 py-3.5 border-b border-accent/60 flex items-center gap-3">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

export const SkeletonNotif = () => (
  <div className="px-4 py-3.5 border-b border-accent/60 flex items-start gap-3">
    <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

export const SkeletonTransaction = () => (
  <div className="px-4 py-3.5 border-b border-accent/60 flex items-center gap-3">
    <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-4 w-16" />
  </div>
);

export default Skeleton;
