import React, { useState } from 'react';
import { CheckCircle, XCircle, Send, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { fmtCurrency, fmtDate, statusLabel, statusClass, WORKFLOW_STEPS, getInitials } from '../utils/helpers';

const RequestItem = ({ request, isAdmin, currentUserId, onApprove, onReject, onTransfer, onConfirm }) => {
  const [expanded, setExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const isRequester = request.requestedBy?._id === currentUserId;
  const canApproveReject = isAdmin && request.status === 'pending';
  const canTransfer = isAdmin && request.status === 'approved';
  const canConfirm = isRequester && request.status === 'transferred';
  const stepIdx = WORKFLOW_STEPS.indexOf(
    request.status === 'received' || request.status === 'completed' ? 'completed' : request.status
  );

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(request._id, rejectReason.trim());
    setShowRejectInput(false);
    setRejectReason('');
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Main row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="avatar-sm bg-purple-50 text-purple-700">
          {getInitials(request.requestedBy?.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 truncate">{request.purpose}</p>
            <span className={`${statusClass[request.status] || 'badge'} flex-shrink-0`}>
              {statusLabel[request.status]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {request.requestedBy?.name} · {fmtDate(request.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">{fmtCurrency(request.amount)}</span>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 bg-gray-50">
          {/* Description */}
          {request.description && (
            <p className="text-sm text-gray-600">{request.description}</p>
          )}

          {/* Rejection reason */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
              <span className="font-medium">Rejected: </span>{request.rejectionReason}
            </div>
          )}

          {/* Workflow steps */}
          <div className="flex items-center gap-1">
            {WORKFLOW_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-1 text-xs font-medium ${i <= stepIdx && request.status !== 'rejected' ? 'text-blue-600' : 'text-gray-300'}`}>
                  <div className={`w-2 h-2 rounded-full ${i <= stepIdx && request.status !== 'rejected' ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  <span className="hidden sm:inline capitalize">{step}</span>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < stepIdx && request.status !== 'rejected' ? 'bg-blue-300' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {canApproveReject && !showRejectInput && (
              <>
                <button onClick={() => onApprove(request._id)} className="btn-success">
                  <CheckCircle size={15} /> Approve
                </button>
                <button onClick={() => setShowRejectInput(true)} className="btn-danger">
                  <XCircle size={15} /> Reject
                </button>
              </>
            )}
            {canApproveReject && showRejectInput && (
              <div className="w-full space-y-2">
                <input
                  className="field-input"
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={handleReject} className="btn-danger flex-1">Confirm Reject</button>
                  <button onClick={() => setShowRejectInput(false)} className="btn-outline flex-1">Cancel</button>
                </div>
              </div>
            )}
            {canTransfer && (
              <button onClick={() => onTransfer(request._id)} className="btn btn-primary">
                <Send size={15} /> Mark as Transferred
              </button>
            )}
            {canConfirm && (
              <button onClick={() => onConfirm(request._id)} className="btn-success">
                <Check size={15} /> I Received the Funds
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestItem;
