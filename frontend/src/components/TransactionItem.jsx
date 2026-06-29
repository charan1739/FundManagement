import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { fmtCurrency, fmtDate, getInitials } from '../utils/helpers';

const TransactionItem = ({ txn }) => {
  const isCredit = txn.type === 'credit';

  return (
    <div className="list-item">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
        {isCredit
          ? <ArrowUpRight size={18} className="text-green-600" />
          : <ArrowDownLeft size={18} className="text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{txn.purpose || 'Transaction'}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {txn.performedBy?.name} · {fmtDate(txn.transactionDate)}
        </p>
      </div>
      <span className={`text-sm font-semibold ${isCredit ? 'amount-credit' : 'amount-debit'} flex-shrink-0`}>
        {isCredit ? '+' : '-'}{fmtCurrency(txn.amount)}
      </span>
    </div>
  );
};

export default TransactionItem;
