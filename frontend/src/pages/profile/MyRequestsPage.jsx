import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { formatINR, formatIST } from '../../utils/formatters';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGroup } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await api.get('/requests/user');
        setRequests(data.data);
      } catch (err) {
        toast.error('Failed to load your requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <AppShell hideNav>
      <TopBar title="My Requests" />

      <div className="page-content bg-surface p-4 space-y-4">
        {loading ? (
          <Card className="divide-y divide-accent/60 border-0">
            <SkeletonGroup /><SkeletonGroup /><SkeletonGroup />
          </Card>
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <button
              key={req._id}
              onClick={() => navigate(`/requests/${req._id}`)}
              className="w-full bg-card rounded-2xl border border-accent shadow-sm p-4 hover:shadow-md hover:border-primary transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-primary-hover mb-0.5">{req.group?.name}</p>
                  <p className="text-[10px] text-brand-muted">{formatIST(req.createdAt)}</p>
                </div>
                <Badge variant={req.status} />
              </div>
              
              <div className="flex items-end justify-between mt-2 pt-3 border-t border-accent/50">
                <div className="flex-1 pr-4">
                  <p className="font-medium text-brand text-sm mb-1 truncate">{req.purpose}</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <p className="font-bold text-brand text-base tabular-nums">{formatINR(req.amount)}</p>
                  <ChevronRight size={16} className="text-brand-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
            </button>
          ))
        ) : (
          <EmptyState icon={FileText} title="No requests yet" subtitle="You haven't made any fund requests across any groups." />
        )}
      </div>
    </AppShell>
  );
};

export default MyRequestsPage;
