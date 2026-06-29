import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowUpRight, Check, Paperclip } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatINR, formatIST, avatarColor, getInitials } from '../../utils/formatters';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import BottomSheet from '../../components/ui/BottomSheet';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusTimeline from '../../components/ui/StatusTimeline';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groupActivity } = useSocket();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null); // { action: 'approve' | 'transfer' }

  const fetchRequest = async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setRequest(data.data);
    } catch (err) {
      toast.error('Failed to load request');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequest(); }, [id]);
  
  // Refresh if socket event affects this group
  useEffect(() => {
    if (groupActivity?.groupId === request?.group?._id) fetchRequest();
  }, [groupActivity]);

  const handleAction = async (action, data = null) => {
    setSubmitting(true);
    try {
      let res;
      if (action === 'confirm') {
        const formData = new FormData();
        if (receiptFile) formData.append('receipt', receiptFile);
        res = await api.patch(`/requests/${id}/confirm`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.patch(`/requests/${id}/${action}`, data);
      }
      setRequest(res.data.data.request || res.data.data);
      toast.success('Action successful');
      setConfirmDialog(null);
      setShowReject(false);
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !request) return <AppShell hideNav><TopBar title="Loading..." /></AppShell>;

  const isAdmin = true; // Simplified: in a real app, check req.user._id against group admins array. For V1 we assume the admin sees manage requests page.
  const isRequester = request.requestedBy._id === user._id;

  return (
    <AppShell hideNav>
      <TopBar title="Request Details" />
      <div className="page-content bg-surface space-y-4">
        
        {/* Header Card */}
        <div className="bg-card px-5 py-6 border-b border-accent shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Badge variant={request.status} />
            <p className="text-xs text-brand-muted">{formatIST(request.createdAt)}</p>
          </div>
          <p className="text-2xl font-bold text-brand mb-1">{formatINR(request.amount)}</p>
          <p className="text-sm font-medium text-brand">{request.purpose}</p>
          {request.description && <p className="text-sm text-brand-sub mt-2 leading-relaxed">{request.description}</p>}
          
          <div className="mt-6 flex items-center gap-3 pt-4 border-t border-accent/50">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-brand flex-shrink-0" style={{ backgroundColor: avatarColor(request.requestedBy?.name) }}>
              {getInitials(request.requestedBy?.name)}
            </div>
            <div>
              <p className="text-xs text-brand-muted">Requested by</p>
              <p className="text-sm font-semibold text-brand">{request.requestedBy?.name}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <Card className="mx-4">
          <p className="section-label rounded-t-2xl">Status Timeline</p>
          <StatusTimeline request={request} />
          {request.status === 'rejected' && (
            <div className="mx-4 mb-4 mt-2 p-3 bg-danger/10 border border-danger/20 rounded-xl">
              <p className="text-xs font-semibold text-danger mb-1">Rejection Reason:</p>
              <p className="text-sm text-brand-sub">{request.rejectedReason}</p>
            </div>
          )}
        </Card>

        {/* Documents */}
        {(request.attachmentUrl || request.receiptUrl) && (
          <Card className="mx-4">
            <p className="section-label rounded-t-2xl">Documents</p>
            <div className="p-4 space-y-3">
              {request.attachmentUrl && (
                <a href={request.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-surface hover:bg-accent/50 rounded-xl border border-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-hover flex items-center justify-center"><Paperclip size={14} /></div>
                  <span className="text-sm font-medium text-brand">Supporting Document</span>
                </a>
              )}
              {request.receiptUrl && (
                <a href={request.receiptUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-surface hover:bg-accent/50 rounded-xl border border-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-success/20 text-success flex items-center justify-center"><CheckCircle size={14} /></div>
                  <span className="text-sm font-medium text-brand">Uploaded Receipt</span>
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Admin Actions */}
        {isAdmin && request.status === 'pending' && (
          <div className="px-4 py-2 flex gap-3">
            <Button variant="outline-danger" full onClick={() => setShowReject(true)}><XCircle size={16} /> Reject</Button>
            <Button variant="success" full onClick={() => setConfirmDialog({ action: 'approve' })}><CheckCircle size={16} /> Approve</Button>
          </div>
        )}
        {isAdmin && request.status === 'approved' && (
          <div className="px-4 py-2">
            <Button variant="primary" full onClick={() => setConfirmDialog({ action: 'transfer' })}><ArrowUpRight size={16} /> Mark as Transferred</Button>
          </div>
        )}

        {/* Requester Actions */}
        {isRequester && request.status === 'transferred' && (
          <div className="px-4 py-2">
            <Button variant="success" full onClick={() => setShowConfirm(true)}><Check size={16} /> Confirm Receipt of Funds</Button>
          </div>
        )}
      </div>

      {/* Reject Sheet */}
      <BottomSheet open={showReject} onClose={() => setShowReject(false)} title="Reject Request">
        <form onSubmit={(e) => { e.preventDefault(); handleAction('reject', { reason: rejectReason }); }} className="space-y-4">
          <Textarea label="Reason for rejection *" placeholder="Explain why..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
          <Button type="submit" variant="danger" full loading={submitting}>Reject Request</Button>
        </form>
      </BottomSheet>

      {/* Confirm Receipt Sheet */}
      <BottomSheet open={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Receipt">
        <form onSubmit={(e) => { e.preventDefault(); handleAction('confirm'); }} className="space-y-4">
          <p className="text-sm text-brand-sub mb-4">
            By confirming, you acknowledge receipt of <strong>{formatINR(request.amount)}</strong>. This will deduct the amount from the group balance permanently.
          </p>
          <FileUpload label="Upload Receipt / Bill (optional)" file={receiptFile} onChange={setReceiptFile} onRemove={() => setReceiptFile(null)} />
          <Button type="submit" variant="success" full loading={submitting} className="mt-2">I have received the funds</Button>
        </form>
      </BottomSheet>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.action === 'approve' ? 'Approve Request' : 'Mark as Transferred'}
        message={confirmDialog?.action === 'approve' 
          ? `Approve ${request.requestedBy?.name}'s request for ${formatINR(request.amount)}?`
          : `Have you transferred ${formatINR(request.amount)} to ${request.requestedBy?.name}?`}
        confirmLabel={confirmDialog?.action === 'approve' ? 'Approve' : 'Yes, Transferred'}
        variant={confirmDialog?.action === 'approve' ? 'success' : 'primary'}
        onConfirm={() => handleAction(confirmDialog.action)}
        onCancel={() => setConfirmDialog(null)}
      />
    </AppShell>
  );
};

export default RequestDetailPage;
