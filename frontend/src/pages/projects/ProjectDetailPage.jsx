import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, DollarSign, FileText, BarChart3, Settings, Plus } from 'lucide-react';
import { getProject, getProjectStats } from '../../api/projects';
import BalanceDisplay from '../../components/BalanceDisplay';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'requests', label: 'Fund Requests', icon: FileText },
  { id: 'transactions', label: 'Transactions', icon: DollarSign },
  { id: 'members', label: 'Members', icon: Users },
];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const [projectRes, statsRes] = await Promise.all([getProject(id), getProjectStats(id)]);
        setProject(projectRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-dark-700 rounded-xl" />
        <div className="h-48 bg-dark-800 rounded-2xl" />
        <div className="h-32 bg-dark-800 rounded-2xl" />
      </div>
    );
  }

  if (!project) return null;

  const canManage = ['owner', 'finance_manager'].includes(project.myRole);
  const isOwner = project.myRole === 'owner';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-100">{project.name}</h1>
            <StatusBadge status={project.status} />
            <StatusBadge status={project.myRole} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{project.code} · Created {formatDate(project.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Link to={`/projects/${id}/funds`} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} /> Add Funds
            </Link>
          )}
          <Link to={`/projects/${id}/requests/new`} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus size={14} /> Request
          </Link>
        </div>
      </div>

      {/* Balance */}
      <BalanceDisplay
        currentBalance={project.currentBalance}
        allocatedBalance={project.allocatedBalance}
        pendingRequestsTotal={project.pendingRequestsTotal}
      />

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Members', value: stats.memberCount, color: 'text-indigo-400' },
            { label: 'Pending', value: stats.pendingCount, color: 'text-amber-400' },
            { label: 'Approved', value: stats.approvedCount, color: 'text-violet-400' },
            { label: 'Completed', value: stats.completedCount, color: 'text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-600">
        {TAB_ITEMS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
              ${activeTab === tabId ? 'text-indigo-400 border-indigo-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content — routes users to dedicated pages */}
      {activeTab === 'overview' && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-100 mb-3">About this Project</h3>
          <p className="text-slate-400">{project.description || 'No description provided.'}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Owner:</span> <span className="text-slate-200 ml-2">{project.owner?.name}</span></div>
            <div><span className="text-slate-500">Status:</span> <span className="ml-2"><StatusBadge status={project.status} /></span></div>
            <div><span className="text-slate-500">Created:</span> <span className="text-slate-200 ml-2">{formatDate(project.createdAt)}</span></div>
          </div>
        </div>
      )}
      {activeTab === 'requests' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to={`/projects/${id}/requests`} className="btn-primary inline-flex items-center gap-2 mb-4">
            View All Requests
          </Link>
        </motion.div>
      )}
      {activeTab === 'transactions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to={`/projects/${id}/transactions`} className="btn-primary inline-flex items-center gap-2">
            View All Transactions
          </Link>
        </motion.div>
      )}
      {activeTab === 'members' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to={`/projects/${id}/members`} className="btn-primary inline-flex items-center gap-2">
            Manage Members
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
