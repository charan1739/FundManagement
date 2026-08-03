import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../../api/index';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center px-6 py-12 sm:px-12">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-card">
            <Mail size={32} className="text-brand" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-brand tracking-tight">Reset Password</h1>
          <p className="text-brand-sub text-sm mt-1.5">We'll send you a link to reset it</p>
        </div>

        <Card className="p-6 sm:p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-brand text-sm">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link to="/login" className="btn-secondary w-full inline-flex justify-center mt-2">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email" type="email" placeholder="you@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" full loading={loading} className="mt-2">Send Reset Link</Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-brand-sub">
          <Link to="/login" className="flex items-center justify-center gap-1 text-brand-sub hover:text-brand transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
