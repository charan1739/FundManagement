import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { formatINR, formatIST, getInitials, avatarColor } from '../../utils/formatters';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import TabBar from '../../components/ui/TabBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGroup } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'transferred', 'completed', 'rejected'];

const ManageRequestsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get(`/groups/${id}/requests`, { params });
      setRequests(data.data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [id, filter]);

  return (
    <AppShell hideNav>
      <TopBar title="Manage Requests" />
      <TabBar tabs={STATUS_FILTERS} activeTab={filter} onTabChange={setFilter} className="capitalize" />

      <div className="page-content bg-surface p-4">
        {loading ? (
          <Card className="divide-y divide-accent/60 border-0">
            <SkeletonGroup /><SkeletonGroup /><SkeletonGroup />
          </Card>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <button
                key={req._id}
                onClick={() => navigate(`/requests/${req._id}`)}
                className="w-full bg-card rounded-2xl border border-accent shadow-sm p-4 hover:shadow-md hover:border-primary transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-brand" style={{ backgroundColor: avatarColor(req.requestedBy?.name) }}>
                      {getInitials(req.requestedBy?.name)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-brand">{req.requestedBy?.name}</p>
                      <p className="text-[10px] text-brand-muted">{formatIST(req.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant={req.status} />
                </div>
                
                <div className="flex items-end justify-between">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-brand text-base mb-1 truncate">{req.purpose}</p>
                    {req.description && <p className="text-sm text-brand-sub line-clamp-1">{req.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <p className="font-bold text-brand text-lg tabular-nums">{formatINR(req.amount)}</p>
                    <ChevronRight size={18} className="text-brand-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={FileText} 
            title={filter === 'all' ? 'No fund requests yet' : `No ${filter} requests`}
          />
        )}
      </div>
    </AppShell>
  );
};

export default ManageRequestsPage;
