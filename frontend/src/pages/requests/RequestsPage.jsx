import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import { getRequests, approveRequest, rejectRequest, markTransferred, confirmReceipt } from '../../api/requests';
import { getProject } from '../../api/projects';
import RequestCard from '../../components/RequestCard';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RequestsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, projectRes] = await Promise.all([
        getRequests(id, { status: statusFilter, page, limit: 10 }),
        getProject(id),
      ]);
      setRequests(requestsRes.data.data);
      setPagination(requestsRes.data.pagination);
      setProject(projectRes.data.data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, statusFilter, page]);

  const handleApprove = async (reqId) => {
    setActionLoading(true);
    try {
      await approveRequest(id, reqId);
      toast.success('Request approved');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Rejection reason is required');
    setActionLoading(true);
    try {
      await rejectRequest(id, rejectModal, { reason: rejectReason });
      toast.success('Request rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = async (reqId) => {
    setActionLoading(true);
    try {
      await markTransferred(id, reqId);
      toast.success('Marked as transferred');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (reqId) => {
    setActionLoading(true);
    try {
      await confirmReceipt(id, reqId);
      toast.success('Receipt confirmed! Transaction completed. Balance updated.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm receipt');
    } finally {
      setActionLoading(false);
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
            <h1 className="text-xl font-bold text-slate-100">Fund Requests</h1>
            {project && <p className="text-sm text-slate-400">{project.name}</p>}
          </div>
        </div>
        <button id="new-request-btn" onClick={() => navigate(`/projects/${id}/requests/new`)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'transferred', 'completed', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s ? 'bg-indigo-500 text-white' : 'bg-dark-700 text-slate-400 hover:text-slate-200 border border-dark-600'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Requests */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-dark-800 rounded-2xl animate-pulse border border-dark-600" />)}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard
              key={req._id}
              request={req}
              userRole={project?.myRole}
              userId={user?._id}
              onApprove={handleApprove}
              onReject={(reqId) => setRejectModal(reqId)}
              onTransfer={handleTransfer}
              onConfirm={handleConfirm}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <p className="text-slate-400 font-medium">No requests found</p>
          <p className="text-slate-500 text-sm mt-1">
            {statusFilter ? `No ${statusFilter} requests` : 'Create your first fund request'}
          </p>
        </div>
      )}

      <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason(''); }} title="Reject Request">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Please provide a reason for rejection. This will be visible to the requester.</p>
          <div>
            <label className="label">Rejection Reason *</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="e.g. Budget exceeded for this category, please resubmit next month..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleReject} disabled={actionLoading} className="btn-danger flex-1">
              {actionLoading ? 'Rejecting...' : 'Reject Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestsPage;
