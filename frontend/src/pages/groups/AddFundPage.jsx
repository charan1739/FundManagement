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

const AddFundPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount: '', source: '', remarks: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('amount', form.amount);
      if (form.source) formData.append('source', form.source);
      if (form.remarks) formData.append('remarks', form.remarks);
      if (file) formData.append('proof', file);

      await api.post(`/groups/${id}/funds`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Funds added successfully');
      navigate(`/groups/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideNav>
      <TopBar title="Add Funds" />
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
              label="Source (optional)" 
              placeholder="e.g. Client payment, Team collection"
              value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
            />

            <Textarea 
              label="Remarks (optional)" 
              placeholder="Any additional notes..."
              value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              maxLength={200}
            />

            <FileUpload 
              label="Attach Proof (optional)" 
              file={file} onChange={setFile} onRemove={() => setFile(null)} 
            />

            <div className="pt-2">
              <Button type="submit" full loading={loading} variant="success">Add Funds</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};

export default AddFundPage;
