import React, { useState, useEffect } from 'react';
import { PlusCircle, LogOut, Users, UserPlus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatINR, avatarColor, getInitials } from '../../utils/formatters';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BottomSheet from '../../components/ui/BottomSheet';
import Skeleton, { SkeletonGroup } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    try {
      const [groupsRes, invitesRes] = await Promise.all([
        api.get('/groups'),
        api.get('/groups/pending-invites')
      ]);
      setGroups(groupsRes.data.data);
      setInvites(invitesRes.data.data);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRespond = async (groupId, action) => {
    try {
      await api.post(`/groups/${groupId}/${action}`); // action is 'join' or 'decline'
      toast.success(action === 'join' ? 'Joined group successfully!' : 'Invite declined');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/groups', { name: newGroupName.trim() });
      toast.success('Group created');
      setShowCreate(false);
      navigate(`/groups/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-muted">Welcome back,</p>
          <h1 className="text-xl font-semibold text-brand tracking-tight">{user?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="p-2 bg-primary text-brand rounded-full hover:bg-primary-hover shadow-sm transition-colors">
            <PlusCircle size={22} />
          </button>
          <button onClick={handleLogout} className="p-2 text-brand-muted hover:text-brand transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Pending Invites Banner */}
        {invites.length > 0 && (
          <div className="px-5 pb-5">
            <Card className="bg-surface border-accent">
              <div className="p-4 border-b border-accent/50 flex items-center gap-3 text-primary-hover">
                <UserPlus size={18} />
                <span className="font-medium text-sm text-brand">You have {invites.length} pending invite{invites.length > 1 ? 's' : ''}</span>
              </div>
              <div>
                {invites.map((invite) => (
                  <div key={invite._id} className="p-4 flex flex-col gap-3 border-b border-accent/50 last:border-0">
                    <div>
                      <p className="font-semibold text-brand text-sm">{invite.group.name}</p>
                      <p className="text-xs text-brand-sub mt-0.5">Invited by {invite.group.createdBy.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" full onClick={() => handleRespond(invite.group._id, 'decline')}>Decline</Button>
                      <Button variant="primary" size="sm" full onClick={() => handleRespond(invite.group._id, 'join')}>Accept</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Group List */}
        <div className="px-5">
          <p className="section-label bg-transparent px-1 pb-3 mb-1 border-0">My Groups</p>
          
          {loading ? (
            <Card className="divide-y divide-accent/60">
              <SkeletonGroup /><SkeletonGroup /><SkeletonGroup />
            </Card>
          ) : groups.length > 0 ? (
            <Card className="divide-y divide-accent/60">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => navigate(`/groups/${group._id}`)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-surface/50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-brand flex-shrink-0" style={{ backgroundColor: avatarColor(group.name) }}>
                    {getInitials(group.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-brand text-base truncate">{group.name}</p>
                      <Badge variant={group.myRole} className="flex-shrink-0" />
                    </div>
                    <p className="text-sm text-brand-sub">Balance: {formatINR(group.currentBalance)}</p>
                  </div>
                  <ChevronRight size={18} className="text-brand-muted flex-shrink-0" />
                </button>
              ))}
            </Card>
          ) : (
            <Card className="mt-2">
              <EmptyState
                icon={Users}
                title="No groups yet"
                subtitle="Create a group or wait for an invite to get started."
                actionLabel="Create Group"
                onAction={() => setShowCreate(true)}
              />
            </Card>
          )}
        </div>
      </div>

      {/* Create Group Sheet */}
      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="Create New Group">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Group Name *"
            placeholder="e.g. Office Supplies Fund"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            maxLength={100}
            required autoFocus
          />
          <Button type="submit" full loading={creating} className="mt-2">Create Group</Button>
        </form>
      </BottomSheet>
    </AppShell>
  );
};

export default HomePage;
