import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../api/index';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await resetPassword(token, { password });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center px-6 py-12 sm:px-12">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-card">
            <Lock size={32} className="text-brand" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-brand tracking-tight">New Password</h1>
          <p className="text-brand-sub text-sm mt-1.5">Enter your new password below</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="New Password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-[38px] text-brand-muted hover:text-brand-sub transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" full loading={loading} className="mt-2">Reset Password</Button>
          </form>
        </Card>

        <p className="text-center text-sm text-brand-sub">
          <Link to="/login" className="text-primary-hover font-semibold hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
