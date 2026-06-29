import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Shield } from 'lucide-react';
import { getMembers, addMember, updateMember, removeMember } from '../../api/members';
import { getProject } from '../../api/projects';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate, getInitials } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['owner', 'finance_manager', 'member', 'viewer'];

const MembersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [addForm, setAddForm] = useState({ email: '', role: 'member' });
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, projectRes] = await Promise.all([getMembers(id), getProject(id)]);
      setMembers(membersRes.data.data);
      setProject(projectRes.data.data);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const isOwner = project?.myRole === 'owner';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.email) return toast.error('Email is required');
    setAddLoading(true);
    try {
      await addMember(id, addForm);
      toast.success('Member added successfully');
      setAddModal(false);
      setAddForm({ email: '', role: 'member' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    try {
      await removeMember(id, deleteConfirm.userId);
      toast.success('Member removed');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateMember(id, userId, { role });
      toast.success('Role updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/projects/${id}`)} className="text-slate-400 hover:text-slate-200 p-1">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Team Members</h1>
            {project && <p className="text-sm text-slate-400">{project.name}</p>}
          </div>
        </div>
        {isOwner && (
          <button id="add-member-btn" onClick={() => setAddModal(true)} className="btn-primary flex items-center gap-2">
            <UserPlus size={16} /> Add Member
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-dark-700 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="divide-y divide-dark-600">
            {members.map((member) => {
              const isCurrentUser = member.user?._id === user?._id;
              const isProjectOwner = project?.owner?._id === member.user?._id;

              return (
                <div key={member._id} className="flex items-center gap-4 p-4 hover:bg-dark-700/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400 flex-shrink-0">
                    {getInitials(member.user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-200 text-sm">{member.user?.name}</p>
                      {isCurrentUser && <span className="text-xs text-slate-500">(you)</span>}
                      {isProjectOwner && <Shield size={12} className="text-violet-400" />}
                    </div>
                    <p className="text-xs text-slate-400">{member.user?.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Joined {formatDate(member.joinedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={member.status} size="xs" />
                    {isOwner && !isProjectOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                        className="text-xs bg-dark-700 border border-dark-500 rounded-lg px-2 py-1 text-slate-300"
                      >
                        {ROLES.filter(r => r !== 'owner').map(r => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={member.role} />
                    )}
                    {isOwner && !isProjectOwner && (
                      <button
                        id={`remove-member-${member.user?._id}`}
                        onClick={() => setDeleteConfirm({ userId: member.user?._id, name: member.user?.name })}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="label">Email Address *</label>
            <input type="email" className="input" placeholder="user@example.com"
              value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required />
            <p className="text-xs text-slate-500 mt-1">The user must already have an account in the system</p>
          </div>
          <div>
            <label className="label">Role *</label>
            <select className="input" value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
              {ROLES.filter(r => r !== 'owner').map(r => (
                <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={addLoading} className="btn-primary flex-1">
              {addLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Remove Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${deleteConfirm?.name} from this project?`}
        confirmText="Remove"
        danger
      />
    </div>
  );
};

export default MembersPage;
