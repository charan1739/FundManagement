import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRequests, approveRequest, rejectRequest, markTransferred, confirmReceipt } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/layout/TopBar';
import RequestItem from '../../components/RequestItem';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'transferred', 'completed', 'rejected'];

const FundRequestsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await getRequests(id, params);
      setRequests(data.data);
      // Determine role from first request or from URL group data
      // We can infer it cheaply from whether any request has us as the admin actor
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Get group info to know our role
  useEffect(() => {
    import('../../api/index').then(({ getGroup }) => {
      getGroup(id).then(({ data }) => setIsAdmin(data.data.myRole === 'admin')).catch(() => {});
    });
  }, [id]);

  useEffect(() => { fetchRequests(); }, [id, filter]);

  const handle = (fn, successMsg) => async (...args) => {
    try {
      await fn(...args);
      toast.success(successMsg);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleApprove = handle((rId) => approveRequest(id, rId), 'Request approved');
  const handleReject = handle((rId, reason) => rejectRequest(id, rId, { reason }), 'Request rejected');
  const handleTransfer = handle((rId) => markTransferred(id, rId), 'Marked as transferred');
  const handleConfirm = handle((rId) => confirmReceipt(id, rId), 'Receipt confirmed! Balance updated.');

  return (
    <div className="app-shell">
      <TopBar title="Fund Requests" />

      {/* Filter tabs */}
      <div className="flex overflow-x-auto gap-1 px-3 py-2 border-b border-gray-100 no-scrollbar">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner w-7 h-7" />
          </div>
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <RequestItem
              key={req._id}
              request={req}
              isAdmin={isAdmin}
              currentUserId={user?._id}
              onApprove={handleApprove}
              onReject={handleReject}
              onTransfer={handleTransfer}
              onConfirm={handleConfirm}
            />
          ))
        ) : (
          <div className="empty-state">
            <p className="text-gray-500 font-medium">
              {filter === 'all' ? 'No fund requests yet' : `No ${filter} requests`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundRequestsPage;
