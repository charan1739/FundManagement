import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

const NewRequestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount: '', purpose: '', description: '', requiredDate: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (!form.purpose.trim()) return toast.error('Purpose is required');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('amount', form.amount);
      formData.append('purpose', form.purpose.trim());
      if (form.description) formData.append('description', form.description.trim());
      if (form.requiredDate) formData.append('requiredDate', form.requiredDate);
      if (file) formData.append('attachment', file);

      await api.post(`/groups/${id}/requests`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Fund request submitted');
      navigate(`/groups/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideNav>
      <TopBar title="Request Funds" />
      <div className="page-content p-5">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label">Amount (₹) *</label>
              <div className="relative">
                <span className="absolute left-4 top-[13px] text-brand-muted font-medium text-lg">₹</span>
                <input 
                  type="number" min="1" required
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-accent text-lg font-bold tabular-nums text-brand placeholder-brand-muted bg-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="0"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            <Input 
              label="Purpose *" 
              placeholder="e.g. Printer cartridges"
              value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              maxLength={100} required
            />

            <Textarea 
              label="Description (optional)" 
              placeholder="Explain why you need this..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={200}
            />

            <Input 
              label="Required By Date (optional)" 
              type="date"
              value={form.requiredDate} onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
            />

            <FileUpload 
              label="Attach Document (optional)" 
              file={file} onChange={setFile} onRemove={() => setFile(null)} 
            />

            <div className="pt-2">
              <Button type="submit" full loading={loading}>Submit Request</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};

export default NewRequestPage;
