import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, formatRelativeTime, CATEGORY_LABELS } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import { CheckCircle, XCircle, Send, Check, Clock, Tag, User } from 'lucide-react';

const WORKFLOW_STEPS = ['pending', 'approved', 'transferred', 'completed'];

const RequestCard = ({ request, onApprove, onReject, onTransfer, onConfirm, userRole, userId }) => {
  const stepIdx = WORKFLOW_STEPS.indexOf(request.status === 'received' ? 'completed' : request.status);
  const isRequester = request.requestedBy?._id === userId;
  const canManage = ['owner', 'finance_manager'].includes(userRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:border-dark-500 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="font-semibold text-slate-100">{request.purpose}</h4>
          <div className="flex items-center gap-2 mt-1">
            <User size={12} className="text-slate-500" />
            <span className="text-xs text-slate-400">{request.requestedBy?.name}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-500">{formatRelativeTime(request.createdAt)}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-indigo-400">{formatCurrency(request.amount)}</p>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Category & Description */}
      <div className="flex items-center gap-2 mb-3">
        <Tag size={12} className="text-slate-500" />
        <span className="badge bg-dark-700 text-slate-300 text-xs">{CATEGORY_LABELS[request.category] || request.category}</span>
        {request.requiredDate && (
          <span className="text-xs text-amber-400 flex items-center gap-1">
            <Clock size={10} />
            Needed by {formatDate(request.requiredDate)}
          </span>
        )}
      </div>

      {request.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{request.description}</p>
      )}

      {/* Workflow progress */}
      <div className="flex items-center gap-1 mb-4">
        {WORKFLOW_STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-1 text-xs font-medium ${i <= stepIdx ? 'text-indigo-400' : 'text-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full ${i <= stepIdx ? 'bg-indigo-500' : 'bg-dark-600'}`} />
              <span className="hidden sm:inline capitalize">{step}</span>
            </div>
            {i < WORKFLOW_STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < stepIdx ? 'bg-indigo-500/50' : 'bg-dark-600'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Rejection reason */}
      {request.status === 'rejected' && request.rejectionReason && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-rose-400">
            <span className="font-medium">Rejected by {request.rejectedBy?.name}: </span>
            {request.rejectionReason}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {canManage && request.status === 'pending' && (
          <>
            <button id={`approve-${request._id}`} onClick={() => onApprove(request._id)} className="btn-success flex items-center gap-1.5 text-sm py-1.5">
              <CheckCircle size={14} /> Approve
            </button>
            <button id={`reject-${request._id}`} onClick={() => onReject(request._id)} className="btn-danger flex items-center gap-1.5 text-sm py-1.5">
              <XCircle size={14} /> Reject
            </button>
          </>
        )}
        {canManage && request.status === 'approved' && (
          <>
            <button id={`transfer-${request._id}`} onClick={() => onTransfer(request._id)} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
              <Send size={14} /> Mark Transferred
            </button>
            <button id={`reject-approved-${request._id}`} onClick={() => onReject(request._id)} className="btn-danger flex items-center gap-1.5 text-sm py-1.5">
              <XCircle size={14} /> Reject
            </button>
          </>
        )}
        {isRequester && request.status === 'transferred' && (
          <button id={`confirm-${request._id}`} onClick={() => onConfirm(request._id)} className="btn-success flex items-center gap-1.5 text-sm py-1.5">
            <Check size={14} /> I have received the funds
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default RequestCard;
