import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Copy, PlusCircle, ClipboardList, FileText, 
  TrendingUp, TrendingDown, Paperclip, UserPlus, Trash2, Activity, Settings, RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatINR, formatIST, avatarColor, getInitials } from '../../utils/formatters';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import TabBar from '../../components/ui/TabBar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import BottomSheet from '../../components/ui/BottomSheet';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton, { SkeletonTransaction, SkeletonGroup } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const TABS = ['Transactions', 'Members', 'Activity'];

const GroupPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { joinGroup, leaveGroup, groupActivity, clearGroupActivity, balanceUpdate } = useSocket();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('Transactions');
  const [loading, setLoading] = useState(true);

  // Tab Data
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Actions
  const [showInvite, setShowInvite] = useState(false);
  const [inviteVal, setInviteVal] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null); // { id, name }

  const isAdmin = group?.myRole === 'admin';

  const fetchGroup = async () => {
    try {
      const { data } = await api.get(`/groups/${id}`);
      setGroup(data.data);
    } catch (err) {
      toast.error('Failed to load group');
      navigate('/');
    }
  };

  const fetchTabData = async (tab) => {
    setLoadingData(true);
    try {
      if (tab === 'Transactions') {
        const { data } = await api.get(`/groups/${id}/transactions`);
        setTransactions(data.data);
      } else if (tab === 'Members') {
        const { data } = await api.get(`/groups/${id}/members`);
        setMembers(data.data);
      } else if (tab === 'Activity') {
        const { data } = await api.get(`/groups/${id}/activity`);
        setActivity(data.data);
      }
    } catch (err) {
      toast.error(`Failed to load ${tab}`);
    } finally {
      setLoadingData(false);
    }
  };

  const initialLoad = async () => {
    setLoading(true);
    await fetchGroup();
    await fetchTabData(activeTab);
    setLoading(false);
  };

  useEffect(() => {
    initialLoad();
    joinGroup(id);
    return () => leaveGroup(id);
  }, [id]);

  useEffect(() => {
    if (!loading) fetchTabData(activeTab);
  }, [activeTab]);

  // Socket sync
  useEffect(() => {
    if (balanceUpdate?.groupId === id) {
      fetchGroup();
    }
  }, [balanceUpdate]);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(group.groupCode);
    toast.success('Group code copied');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteVal.trim()) return;
    setInviting(true);
    try {
      await api.post(`/groups/${id}/members`, { emailOrUsername: inviteVal.trim() });
      toast.success('Invite sent successfully');
      setShowInvite(false);
      setInviteVal('');
      fetchTabData('Members');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    try {
      await api.delete(`/groups/${id}/members/${removeTarget.id}`);
      toast.success(`${removeTarget.name} removed`);
      setRemoveTarget(null);
      fetchTabData('Members');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRefresh = async () => {
    clearGroupActivity();
    await fetchGroup();
    await fetchTabData(activeTab);
  };

  if (loading) {
    return (
      <AppShell hideNav>
        <TopBar title="Loading..." />
        <div className="balance-banner">
          <Skeleton className="h-3 w-32 bg-primary-hover mb-2" />
          <Skeleton className="h-8 w-48 bg-primary-hover" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <TopBar 
        title={group?.name}
        rightSlot={
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface text-brand-sub hover:bg-accent rounded-lg text-xs font-semibold transition-colors" onClick={handleCopyCode}>
            <span className="font-mono">{group?.groupCode}</span>
            <Copy size={12} />
          </button>
        }
      />

      {/* Balance Banner */}
      <div className="balance-banner relative">
        <p className="balance-label">Group Balance</p>
        <p className="balance-amount">{formatINR(group?.currentBalance)}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary-hover/50">
          <div>
            <p className="text-[10px] text-brand-sub uppercase tracking-wider font-semibold mb-0.5">Available</p>
            <p className="text-brand font-semibold tabular-nums">{formatINR(group?.availableBalance)}</p>
          </div>
          <div>
            <p className="text-[10px] text-brand-sub uppercase tracking-wider font-semibold mb-0.5">Allocated</p>
            <p className="text-brand font-semibold tabular-nums">{formatINR(group?.allocatedBalance)}</p>
          </div>
        </div>
      </div>

      {/* Real-time Refresh Banner */}
      {groupActivity && groupActivity.groupId === id && (
        <button onClick={handleRefresh} className="w-full bg-accent py-2 px-4 flex items-center justify-center gap-2 text-brand-sub text-xs font-semibold hover:bg-secondary transition-colors animate-slide-down">
          <RefreshCw size={14} className="animate-spin" />
          New activity — tap to refresh
        </button>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-4 bg-card border-b border-accent flex gap-3 shadow-sm z-10 relative">
        {isAdmin ? (
          <>
            <Button className="flex-1" onClick={() => navigate(`/groups/${id}/add-fund`)}>
              <PlusCircle size={16} /> Add Funds
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => navigate(`/groups/${id}/requests`)}>
              <ClipboardList size={16} /> Manage Requests
            </Button>
          </>
        ) : (
          <Button full onClick={() => navigate(`/groups/${id}/new-request`)}>
            <FileText size={16} /> Request Funds
          </Button>
        )}
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto bg-surface">
        {loadingData ? (
          <Card className="m-4 divide-y divide-accent/60 border-0">
            {activeTab === 'Transactions' ? (
              <><SkeletonTransaction /><SkeletonTransaction /><SkeletonTransaction /></>
            ) : (
              <><SkeletonGroup /><SkeletonGroup /><SkeletonGroup /></>
            )}
          </Card>
        ) : (
          <div className="p-4">
            <Card className="divide-y divide-accent/60 overflow-hidden border-0">
              
              {/* Transactions Tab */}
              {activeTab === 'Transactions' && (
                transactions.length > 0 ? transactions.map((txn) => {
                  const isAdd = txn.type === 'fund-added';
                  return (
                    <div key={txn._id} className="p-4 hover:bg-surface/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isAdd ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                          {isAdd ? <TrendingUp size={18} strokeWidth={2.5} /> : <TrendingDown size={18} strokeWidth={2.5} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand text-sm truncate">{txn.remarks || (isAdd ? 'Funds Added' : 'Transfer Completed')}</p>
                          <p className="text-xs text-brand-muted mt-0.5 truncate">{txn.addedBy?.name} · {formatIST(txn.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={isAdd ? 'amount-credit text-sm' : 'amount-debit text-sm'}>
                            {isAdd ? '+' : '-'}{formatINR(txn.amount)}
                          </p>
                        </div>
                      </div>
                      {txn.proofUrl && (
                        <div className="mt-3 ml-13 pl-[52px]">
                          <a href={txn.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/50 hover:bg-accent rounded-lg text-xs font-medium text-brand-sub transition-colors">
                            <Paperclip size={12} /> View Proof
                          </a>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <EmptyState icon={TrendingUp} title="No transactions yet" subtitle="Transactions will appear here once funds are added or requests are completed." />
                )
              )}

              {/* Members Tab */}
              {activeTab === 'Members' && (
                <>
                  {isAdmin && (
                    <button onClick={() => setShowInvite(true)} className="w-full p-4 flex items-center gap-3 hover:bg-surface/50 transition-colors border-b border-accent/60">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-hover border border-primary/30">
                        <UserPlus size={18} strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-brand text-sm">Invite New Member</span>
                    </button>
                  )}
                  {members.map((m) => {
                    const isMe = m.user._id === user._id;
                    const isPending = m.status === 'pending';
                    return (
                      <div key={m._id} className="p-4 flex items-center gap-3 group">
                        <Avatar name={m.user.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-brand text-sm truncate">
                              {m.user.name} {isMe && <span className="font-normal text-brand-muted">(you)</span>}
                            </p>
                            <Badge variant={m.role} />
                            {isPending && <Badge variant="pending" />}
                          </div>
                          <p className="text-xs text-brand-muted truncate">@{m.user.username}</p>
                        </div>
                        {isAdmin && !isMe && !isPending && m.role !== 'admin' && (
                          <button onClick={() => setRemoveTarget({ id: m.user._id, name: m.user.name })} className="p-2 text-brand-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Activity Tab */}
              {activeTab === 'Activity' && (
                activity.length > 0 ? activity.map((log) => (
                  <div key={log._id} className="p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0 text-brand-sub mt-0.5">
                      <Activity size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm text-brand font-medium leading-relaxed">{log.action}</p>
                      <p className="text-xs text-brand-muted mt-1">{formatIST(log.createdAt)}</p>
                    </div>
                  </div>
                )) : (
                  <EmptyState icon={Activity} title="No activity yet" subtitle="Group actions will appear here." />
                )
              )}

            </Card>
          </div>
        )}
      </div>

      {/* Invite Member Sheet */}
      <BottomSheet open={showInvite} onClose={() => setShowInvite(false)} title="Invite Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <p className="text-xs text-brand-sub bg-surface p-3 rounded-xl border border-accent">
            Members can join automatically using the group code <strong>{group?.groupCode}</strong>, or you can invite them directly.
          </p>
          <div className="relative">
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-accent text-sm text-brand placeholder-brand-muted bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Enter username or email"
              value={inviteVal} onChange={(e) => setInviteVal(e.target.value)} required autoFocus 
            />
            <UserPlus size={16} className="absolute left-4 top-[14px] text-brand-muted" />
          </div>
          <Button type="submit" full loading={inviting}>Send Invite</Button>
        </form>
      </BottomSheet>

      {/* Remove Member Dialog */}
      <ConfirmDialog
        open={!!removeTarget}
        title="Remove Member"
        message={`Are you sure you want to remove ${removeTarget?.name} from this group?`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemoveMember}
        onCancel={() => setRemoveTarget(null)}
      />
    </AppShell>
  );
};

export default GroupPage;
