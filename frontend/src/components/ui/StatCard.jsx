import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'indigo', currency = false, suffix = '' }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', border: 'border-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
    rose: { bg: 'bg-rose-500/10', icon: 'text-rose-400', border: 'border-rose-500/20' },
    violet: { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20' },
  };

  const c = colorMap[color] || colorMap.indigo;

  const displayValue = currency
    ? formatCurrency(value)
    : `${formatNumber(value)}${suffix}`;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 border ${c.border} hover:border-opacity-50 transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{displayValue}</p>
      {trendLabel && <p className="text-xs text-slate-500 mt-1">{trendLabel}</p>}
    </motion.div>
  );
};

export default StatCard;
