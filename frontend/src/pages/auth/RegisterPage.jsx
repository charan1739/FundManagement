import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.username || !form.password) return toast.error('All fields are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return toast.error('Username can only contain letters, numbers and underscores');

    setLoading(true);
    try {
      const { confirm, ...data } = form;
      await register(data);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center px-6 py-12 sm:px-12">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/login" className="p-2 -ml-2 text-brand-muted hover:text-brand hover:bg-card rounded-xl transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-brand tracking-tight">Create Account</h1>
            <p className="text-sm text-brand-sub mt-0.5">Join Fund Manager</p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={set('name')} required />
            <Input label="Email" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
            <Input label="Username" type="text" placeholder="priya_s" value={form.username} onChange={set('username')} required />
            
            <div className="relative">
              <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-[38px] text-brand-muted hover:text-brand-sub">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <Input label="Confirm Password" type={showPw ? 'text' : 'password'} placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            
            <Button type="submit" full loading={loading} className="mt-2">Create Account</Button>
          </form>
        </Card>

        <p className="text-center text-sm text-brand-sub">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-hover font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
