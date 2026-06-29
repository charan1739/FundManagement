import React from 'react';
import { formatIST } from '../../utils/formatters';

const STEPS = [
  { key: 'pending',     label: 'Submitted' },
  { key: 'approved',   label: 'Approved' },
  { key: 'transferred',label: 'Transferred' },
  { key: 'completed',  label: 'Received' },
];

const STATUS_ORDER = { pending: 0, approved: 1, rejected: 1, transferred: 2, received: 3, completed: 3 };

const StatusTimeline = ({ request }) => {
  const currentIdx = STATUS_ORDER[request.status] ?? 0;
  const isRejected = request.status === 'rejected';

  const timestamps = {
    pending: request.createdAt,
    approved: request.approvedAt,
    transferred: request.transferredAt,
    completed: request.completedAt || request.receivedAt,
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIdx || (i === currentIdx && !isRejected);
          const active = i === currentIdx && !isRejected;
          const rejected = isRejected && i === 1;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                  rejected ? 'bg-danger border-danger' :
                  done ? 'bg-primary border-primary' :
                  active ? 'bg-primary border-primary scale-125' :
                  'bg-card border-accent'
                }`} />
                <p className={`text-[10px] mt-1 font-medium text-center max-w-[56px] leading-tight ${
                  rejected ? 'text-danger' :
                  done ? 'text-primary' :
                  'text-brand-muted'
                }`}>
                  {rejected && i === 1 ? 'Rejected' : step.label}
                </p>
                {timestamps[step.key] && done && (
                  <p className="text-[9px] text-brand-muted text-center max-w-[60px] leading-tight mt-0.5">
                    {formatIST(timestamps[step.key])}
                  </p>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mt-1.5 transition-all ${
                  i < currentIdx && !isRejected ? 'bg-primary' : 'bg-accent'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
