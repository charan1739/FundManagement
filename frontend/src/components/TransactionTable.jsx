import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const TransactionTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-dark-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg font-medium">No transactions yet</p>
        <p className="text-sm mt-1">Transactions will appear here once funds are added or requests are completed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-600">
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4">Transaction ID</th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4">Type</th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4">Amount</th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4 hidden md:table-cell">Category</th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4 hidden lg:table-cell">Purpose</th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4 hidden md:table-cell">Performed By</th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-600/50">
          {transactions.map((txn, i) => (
            <motion.tr
              key={txn._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="table-row"
            >
              <td className="py-3.5 pr-4">
                <span className="font-mono text-xs text-slate-400">{txn.transactionId}</span>
              </td>
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    {txn.type === 'credit'
                      ? <ArrowUpRight size={14} className="text-emerald-400" />
                      : <ArrowDownLeft size={14} className="text-rose-400" />}
                  </div>
                  <StatusBadge status={txn.type} />
                </div>
              </td>
              <td className="py-3.5 pr-4">
                <span className={`font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </span>
              </td>
              <td className="py-3.5 pr-4 hidden md:table-cell">
                <span className="text-sm text-slate-300 capitalize">{txn.category?.replace('_', ' ')}</span>
              </td>
              <td className="py-3.5 pr-4 hidden lg:table-cell">
                <span className="text-sm text-slate-400 truncate max-w-[150px] block">{txn.purpose || txn.remarks || '—'}</span>
              </td>
              <td className="py-3.5 pr-4 hidden md:table-cell">
                <span className="text-sm text-slate-300">{txn.performedBy?.name || '—'}</span>
              </td>
              <td className="py-3.5">
                <span className="text-sm text-slate-400">{formatDate(txn.transactionDate)}</span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
