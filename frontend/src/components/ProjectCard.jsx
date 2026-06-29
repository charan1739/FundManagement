import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate, truncate } from '../utils/formatters';
import StatusBadge from './StatusBadge';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const available = Math.max(0, project.currentBalance - project.allocatedBalance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(`/projects/${project._id}`)}
      className="card-hover p-6 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-100 truncate">{project.name}</h3>
          </div>
          <p className="text-xs text-indigo-400 font-mono">{project.code}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{truncate(project.description, 80)}</p>
      )}

      {/* Balance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-700 rounded-xl p-3 border border-emerald-500/10">
          <p className="text-xs text-slate-500 mb-0.5">Balance</p>
          <p className="font-bold text-emerald-400 text-sm">{formatCurrency(project.currentBalance)}</p>
        </div>
        <div className="bg-dark-700 rounded-xl p-3 border border-violet-500/10">
          <p className="text-xs text-slate-500 mb-0.5">Available</p>
          <p className="font-bold text-violet-400 text-sm">{formatCurrency(available)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users size={12} />
          <span>by {project.owner?.name}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:gap-2 transition-all">
          <span>View details</span>
          <ArrowRight size={12} />
        </div>
      </div>

      {/* Role badge if exists */}
      {project.myRole && (
        <div className="mt-3 pt-3 border-t border-dark-600">
          <StatusBadge status={project.myRole} size="xs" />
        </div>
      )}
    </motion.div>
  );
};

export default ProjectCard;
