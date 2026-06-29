import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, FileText, ChevronRight, Settings, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { avatarColor, getInitials } from '../../utils/formatters';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BottomSheet from '../../components/ui/BottomSheet';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Edit Profile
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  // Change Password
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });

  // Delete Account
  const [showDelete, setShowDelete] = useState(false);

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/profile', editForm);
      updateUser(data.data);
      toast.success('Profile updated');
      setShowEdit(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePwd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/profile/password', pwdForm);
      toast.success('Password updated successfully');
      setShowPwd(false);
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/profile', { data: { confirmation: 'DELETE' } });
      await logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppShell>
      <TopBar title="Profile" showBack={false} />
      
      <div className="page-content px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-brand shadow-sm mb-3" style={{ backgroundColor: avatarColor(user?.name) }}>
            {getInitials(user?.name)}
          </div>
          <h2 className="text-lg font-bold text-brand">{user?.name}</h2>
          <p className="text-sm text-brand-sub mb-4">@{user?.username}</p>
          <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>Edit Profile</Button>
        </Card>

        {/* Menu Options */}
        <Card className="divide-y divide-accent/60 border-0">
          <button onClick={() => navigate('/profile/requests')} className="w-full flex items-center gap-3 p-4 hover:bg-surface/50 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-hover flex items-center justify-center"><FileText size={18} /></div>
            <div className="flex-1"><p className="font-semibold text-brand text-sm">My Requests</p><p className="text-xs text-brand-muted mt-0.5">View all your fund requests</p></div>
            <ChevronRight size={18} className="text-brand-muted" />
          </button>

          <button onClick={() => setShowPwd(true)} className="w-full flex items-center gap-3 p-4 hover:bg-surface/50 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-accent text-brand-sub flex items-center justify-center"><Settings size={18} /></div>
            <div className="flex-1"><p className="font-semibold text-brand text-sm">Change Password</p><p className="text-xs text-brand-muted mt-0.5">Update your security credentials</p></div>
            <ChevronRight size={18} className="text-brand-muted" />
          </button>

          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-surface/50 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-surface border border-accent text-brand-sub flex items-center justify-center"><LogOut size={18} /></div>
            <div className="flex-1"><p className="font-semibold text-brand text-sm">Log Out</p></div>
          </button>
        </Card>

        {/* Danger Zone */}
        <div className="px-2 pt-4">
          <button onClick={() => setShowDelete(true)} className="w-full flex items-center justify-center gap-2 text-danger hover:text-red-700 hover:bg-danger/5 py-3 rounded-xl transition-colors font-medium text-sm">
            <ShieldAlert size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Edit Profile Sheet */}
      <BottomSheet open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
          <Input label="Phone (optional)" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <Input label="Email" value={user?.email || ''} disabled className="opacity-60" />
          <Input label="Username" value={user?.username || ''} disabled className="opacity-60" />
          <Button type="submit" full loading={saving} className="mt-2">Save Changes</Button>
        </form>
      </BottomSheet>

      {/* Change Password Sheet */}
      <BottomSheet open={showPwd} onClose={() => setShowPwd(false)} title="Change Password">
        <form onSubmit={handlePwd} className="space-y-4">
          <Input label="Current Password" type="password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required />
          <Input label="New Password" type="password" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} minLength={6} required />
          <Button type="submit" full loading={saving} className="mt-2">Update Password</Button>
        </form>
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        title="Delete Account"
        message="This action is permanent and cannot be undone. All your data will be erased."
        confirmLabel="Delete Account"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </AppShell>
  );
};

export default ProfilePage;
