const ROLES = {
  OWNER: 'owner',
  FINANCE_MANAGER: 'finance_manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
};

const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  TRANSFERRED: 'transferred',
  RECEIVED: 'received',
  COMPLETED: 'completed',
};

const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  ADJUSTMENT: 'adjustment',
};

const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

const CATEGORIES = [
  'travel',
  'software',
  'hardware',
  'marketing',
  'operations',
  'miscellaneous',
];

const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'new_request',
  REQUEST_APPROVED: 'request_approved',
  REQUEST_REJECTED: 'request_rejected',
  FUNDS_TRANSFERRED: 'funds_transferred',
  FUNDS_RECEIVED: 'funds_received',
  FUNDS_ADDED: 'funds_added',
  LOW_BALANCE: 'low_balance',
  MEMBER_ADDED: 'member_added',
  PROJECT_CREATED: 'project_created',
};

const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee',
};

module.exports = {
  ROLES,
  REQUEST_STATUS,
  TRANSACTION_TYPES,
  PROJECT_STATUS,
  CATEGORIES,
  NOTIFICATION_TYPES,
  CURRENCY,
};
