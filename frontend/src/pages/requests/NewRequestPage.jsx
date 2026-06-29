import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { createRequest } from '../../api/requests';
import toast from 'react-hot-toast';

const CATEGORIES = ['travel', 'software', 'hardware', 'marketing', 'operations', 'miscellaneous'];

const NewRequestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount: '', purpose: '', category: '', description: '', requiredDate: '' });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.purpose || !form.category) return toast.error('Amount, purpose and category are required');
    if (Number(form.amount) <= 0) return toast.error('Amount must be greater than 0');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', form.amount);
      formData.append('purpose', form.purpose);
      formData.append('category', form.category);
      if (form.description) formData.append('description', form.description);
      if (form.requiredDate) formData.append('requiredDate', form.requiredDate);
      if (attachment) formData.append('attachment', attachment);

      await createRequest(id, formData);
      toast.success('Fund request submitted successfully!');
      navigate(`/projects/${id}/requests`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(`/projects/${id}/requests`)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Requests
      </button>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Send size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">New Fund Request</h1>
            <p className="text-sm text-slate-400">Submit a request for project funds</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (₹) *</label>
              <input id="req-amount" type="number" className="input" placeholder="e.g. 5000"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                min="1" required />
            </div>
            <div>
              <label className="label">Category *</label>
              <select id="req-category" className="input" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Purpose *</label>
            <input id="req-purpose" type="text" className="input" placeholder="Brief description of what funds are needed for"
              value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              maxLength={200} required />
          </div>

          <div>
            <label className="label">Detailed Description</label>
            <textarea className="input resize-none" rows={4}
              placeholder="Provide additional details, justification, or breakdown of costs..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={1000} />
          </div>

          <div>
            <label className="label">Required By Date</label>
            <input type="date" className="input" value={form.requiredDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, requiredDate: e.target.value })} />
          </div>

          <div>
            <label className="label">Supporting Document (Optional)</label>
            <input type="file" accept="image/*,application/pdf"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-violet-500/20 file:text-violet-400" />
          </div>

          <div className="bg-dark-700 rounded-xl p-4 border border-amber-500/10">
            <p className="text-xs text-amber-400/80">
              ⚡ Your balance will <strong>NOT</strong> be deducted until you confirm receipt of funds after transfer.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(`/projects/${id}/requests`)} className="btn-secondary flex-1">Cancel</button>
            <button id="submit-request-btn" type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send size={16} /> Submit Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequestPage;
