import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Lock, Clock } from 'lucide-react';

const BalanceDisplay = ({ currentBalance, allocatedBalance, pendingRequestsTotal = 0 }) => {
  const available = Math.max(0, currentBalance - allocatedBalance);
  const totalWidth = Math.max(currentBalance, 1);
  const allocatedPct = Math.min(100, (allocatedBalance / totalWidth) * 100);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={18} className="text-emerald-400" />
        <h3 className="font-semibold text-slate-100">Balance Overview</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-700 rounded-xl p-4 border border-emerald-500/10">
          <p className="text-xs text-slate-500 mb-1">Current Balance</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(currentBalance)}</p>
        </div>
        <div className="bg-dark-700 rounded-xl p-4 border border-indigo-500/10">
          <div className="flex items-center gap-1 mb-1">
            <Lock size={10} className="text-slate-500" />
            <p className="text-xs text-slate-500">Allocated</p>
          </div>
          <p className="text-xl font-bold text-indigo-400">{formatCurrency(allocatedBalance)}</p>
        </div>
        <div className="bg-dark-700 rounded-xl p-4 border border-violet-500/10">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={10} className="text-slate-500" />
            <p className="text-xs text-slate-500">Available</p>
          </div>
          <p className="text-xl font-bold text-violet-400">{formatCurrency(available)}</p>
        </div>
      </div>

      {/* Bar visualization */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Balance usage</span>
          <span>{allocatedPct.toFixed(0)}% allocated</span>
        </div>
        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${allocatedPct}%` }}
          />
        </div>
        {pendingRequestsTotal > 0 && (
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <Clock size={10} />
            {formatCurrency(pendingRequestsTotal)} in pending requests (not deducted from balance)
          </p>
        )}
      </div>
    </div>
  );
};

export default BalanceDisplay;
