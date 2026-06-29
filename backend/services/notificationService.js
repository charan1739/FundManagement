const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * Create a notification for one or more recipients.
 */
const createNotification = async ({ recipients, type, title, message, relatedProject, relatedRequest }) => {
  if (!Array.isArray(recipients)) recipients = [recipients];
  const docs = recipients.map((recipient) => ({
    recipient,
    type,
    title,
    message,
    relatedProject: relatedProject || null,
    relatedRequest: relatedRequest || null,
  }));
  return await Notification.insertMany(docs);
};

const notifyNewRequest = async ({ financeManagers, projectId, requestId, requesterName, amount, projectName }) => {
  return createNotification({
    recipients: financeManagers,
    type: NOTIFICATION_TYPES.NEW_REQUEST,
    title: 'New Fund Request',
    message: `${requesterName} requested ₹${amount.toLocaleString('en-IN')} in ${projectName}`,
    relatedProject: projectId,
    relatedRequest: requestId,
  });
};

const notifyApproval = async ({ recipient, projectId, requestId, projectName, amount }) => {
  return createNotification({
    recipients: [recipient],
    type: NOTIFICATION_TYPES.REQUEST_APPROVED,
    title: 'Fund Request Approved',
    message: `Your request for ₹${amount.toLocaleString('en-IN')} in ${projectName} has been approved`,
    relatedProject: projectId,
    relatedRequest: requestId,
  });
};

const notifyRejection = async ({ recipient, projectId, requestId, projectName, amount, reason }) => {
  return createNotification({
    recipients: [recipient],
    type: NOTIFICATION_TYPES.REQUEST_REJECTED,
    title: 'Fund Request Rejected',
    message: `Your request for ₹${amount.toLocaleString('en-IN')} in ${projectName} was rejected. Reason: ${reason}`,
    relatedProject: projectId,
    relatedRequest: requestId,
  });
};

const notifyTransfer = async ({ recipient, projectId, requestId, projectName, amount }) => {
  return createNotification({
    recipients: [recipient],
    type: NOTIFICATION_TYPES.FUNDS_TRANSFERRED,
    title: 'Funds Transferred',
    message: `₹${amount.toLocaleString('en-IN')} has been transferred in ${projectName}. Please confirm receipt.`,
    relatedProject: projectId,
    relatedRequest: requestId,
  });
};

const notifyReceived = async ({ recipients, projectId, requestId, projectName, amount }) => {
  return createNotification({
    recipients,
    type: NOTIFICATION_TYPES.FUNDS_RECEIVED,
    title: 'Funds Received & Completed',
    message: `₹${amount.toLocaleString('en-IN')} request in ${projectName} is now complete. Balance updated.`,
    relatedProject: projectId,
    relatedRequest: requestId,
  });
};

const notifyFundsAdded = async ({ recipients, projectId, projectName, amount }) => {
  return createNotification({
    recipients,
    type: NOTIFICATION_TYPES.FUNDS_ADDED,
    title: 'Funds Added to Project',
    message: `₹${amount.toLocaleString('en-IN')} has been added to ${projectName}`,
    relatedProject: projectId,
  });
};

const notifyMemberAdded = async ({ recipient, projectId, projectName }) => {
  return createNotification({
    recipients: [recipient],
    type: NOTIFICATION_TYPES.MEMBER_ADDED,
    title: 'Added to Project',
    message: `You have been added to ${projectName}`,
    relatedProject: projectId,
  });
};

module.exports = {
  createNotification,
  notifyNewRequest,
  notifyApproval,
  notifyRejection,
  notifyTransfer,
  notifyReceived,
  notifyFundsAdded,
  notifyMemberAdded,
};
