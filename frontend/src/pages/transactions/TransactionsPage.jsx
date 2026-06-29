import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { getTransactions, exportTransactions } from '../../api/transactions';
import { getProject } from '../../api/projects';
import TransactionTable from '../../components/TransactionTable';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

const TransactionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [txnRes, projRes] = await Promise.all([
          getTransactions(id, { ...filters, page, limit: 15 }),
          getProject(id),
        ]);
        setTransactions(txnRes.data.data);
        setPagination(txnRes.data.pagination);
        setProject(projRes.data.data);
      } catch {
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, page, filters]);

  const handleExport = async (format) => {
    try {
      const { data } = await exportTransactions(id, { ...filters, format });
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions.${format}`;
      a.click();
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/projects/${id}`)} className="text-slate-400 hover:text-slate-200 p-1">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Transactions</h1>
            {project && <p className="text-sm text-slate-400">{project.name} · {pagination.total || 0} total</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select className="input text-sm w-32" value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <select className="input text-sm w-40" value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {['travel', 'software', 'hardware', 'marketing', 'operations', 'miscellaneous', 'fund_addition'].map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <input type="date" className="input text-sm w-40" value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} placeholder="From" />
        <input type="date" className="input text-sm w-40" value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} placeholder="To" />
        <button onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}
          className="btn-secondary text-sm px-3">Clear</button>
      </div>

      <div className="card p-6">
        <TransactionTable transactions={transactions} loading={loading} />
        <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default TransactionsPage;
