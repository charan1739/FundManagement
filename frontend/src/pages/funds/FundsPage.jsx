import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { addFunds, getFunds } from '../../api/funds';
import { getProject } from '../../api/projects';
import Modal from '../../components/ui/Modal';
import TransactionTable from '../../components/TransactionTable';
import Pagination from '../../components/ui/Pagination';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const FundsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [funds, setFunds] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ amount: '', source: '', remarks: '', transactionDate: '' });
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectRes, fundsRes] = await Promise.all([getProject(id), getFunds(id, { page, limit: 10 })]);
      setProject(projectRes.data.data);
      setFunds(fundsRes.data.data);
      setPagination(fundsRes.data.pagination);
    } catch {
      toast.error('Failed to load fund data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, page]);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Please enter a valid amount');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', form.amount);
      if (form.source) formData.append('source', form.source);
      if (form.remarks) formData.append('remarks', form.remarks);
      if (form.transactionDate) formData.append('transactionDate', form.transactionDate);
      if (receipt) formData.append('receipt', receipt);

      const { data } = await addFunds(id, formData);
      toast.success(`₹${Number(form.amount).toLocaleString('en-IN')} added to project!`);
      setAddModal(false);
      setForm({ amount: '', source: '', remarks: '', transactionDate: '' });
      setReceipt(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add funds');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/projects/${id}`)} className="text-slate-400 hover:text-slate-200 p-1">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Fund Management</h1>
            {project && <p className="text-sm text-slate-400">{project.name}</p>}
          </div>
        </div>
        <button id="add-funds-btn" onClick={() => setAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Funds
        </button>
      </div>

      {project && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Current Balance', value: project.currentBalance, color: 'text-emerald-400' },
            { label: 'Allocated', value: project.allocatedBalance, color: 'text-indigo-400' },
            { label: 'Available', value: Math.max(0, project.currentBalance - project.allocatedBalance), color: 'text-violet-400' },
          ].map((item) => (
            <div key={item.label} className="card p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6">
        <h3 className="section-title mb-4">Fund Addition History</h3>
        <TransactionTable transactions={funds} loading={loading} />
        <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Funds to Project">
        <form onSubmit={handleAddFunds} className="space-y-4">
          <div>
            <label className="label">Amount (₹) *</label>
            <input id="fund-amount-input" type="number" className="input" placeholder="e.g. 50000"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              min="1" required />
          </div>
          <div>
            <label className="label">Source</label>
            <input type="text" className="input" placeholder="e.g. Client Payment, Investor, Personal"
              value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div>
            <label className="label">Transaction Date</label>
            <input type="date" className="input" value={form.transactionDate}
              onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea className="input resize-none" rows={3} placeholder="Any additional notes..."
              value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </div>
          <div>
            <label className="label">Receipt (Optional)</label>
            <input type="file" accept="image/*,application/pdf"
              onChange={(e) => setReceipt(e.target.files[0])}
              className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-500/20 file:text-indigo-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Adding...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FundsPage;
