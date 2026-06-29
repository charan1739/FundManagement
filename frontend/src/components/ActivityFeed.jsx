import React from 'react';
import { motion } from 'framer-motion';
import { formatRelativeTime, getInitials } from '../utils/formatters';

const ActivityFeed = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-dark-700 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-dark-700 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return <p className="text-center text-slate-500 py-8">No recent activity</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, i) => (
        <motion.div
          key={activity._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex gap-3 items-start"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
            {getInitials(activity.user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 leading-snug">{activity.action}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatRelativeTime(activity.createdAt)}
              {activity.project?.name && (
                <span className="ml-1 text-indigo-400/70">· {activity.project.name}</span>
              )}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
