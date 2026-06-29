import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center px-6 py-12 sm:px-12">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-card">
            <Wallet size={32} className="text-brand" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-brand tracking-tight">Fund Manager</h1>
          <p className="text-brand-sub text-sm mt-1.5">Group-based project finances</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email" type="email" placeholder="you@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="relative">
              <Input
                label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-[38px] text-brand-muted hover:text-brand-sub transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" full loading={loading} className="mt-2">Sign In</Button>
          </form>
        </Card>

        <p className="text-center text-sm text-brand-sub">
          New user?{' '}
          <Link to="/register" className="text-primary-hover font-semibold hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
