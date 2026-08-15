const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

/**
 * Send an email via Resend. If MAIL_ENABLED is not 'true', logs the email instead.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.MAIL_ENABLED !== 'true') {
    console.log(`[Email Skipped — MAIL_ENABLED=false] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  const client = getResendClient();
  const { data, error } = await client.emails.send({
    from: process.env.MAIL_FROM || 'Fund Manager <onboarding@resend.dev>',
    to,
    subject,
    text: text || subject,
    html,
  });

  if (error) {
    console.error(`[Email Error] To: ${to} | Error: ${JSON.stringify(error)}`);
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  console.log(`[Email Sent] To: ${to} | Message ID: ${data.id}`);
  return data;
};

// --- Email Templates ---

const sendFundRequestEmail = async ({ to, requesterName, projectName, amount, purpose }) => {
  await sendEmail({
    to,
    subject: `New Fund Request — ${projectName}`,
    html: `
      <h2>New Fund Request Received</h2>
      <p><strong>${requesterName}</strong> has submitted a fund request in <strong>${projectName}</strong>.</p>
      <ul>
        <li><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</li>
        <li><strong>Purpose:</strong> ${purpose}</li>
      </ul>
      <p>Please log in to Project Fund Manager to review and approve or reject this request.</p>
    `,
  });
};

const sendApprovalEmail = async ({ to, projectName, amount, status }) => {
  await sendEmail({
    to,
    subject: `Fund Request ${status} — ${projectName}`,
    html: `
      <h2>Fund Request Update</h2>
      <p>Your fund request of <strong>₹${amount.toLocaleString('en-IN')}</strong> in <strong>${projectName}</strong> has been <strong>${status}</strong>.</p>
    `,
  });
};

const sendTransferEmail = async ({ to, projectName, amount }) => {
  await sendEmail({
    to,
    subject: `Funds Transferred — ${projectName}`,
    html: `
      <h2>Funds Have Been Transferred</h2>
      <p>₹${amount.toLocaleString('en-IN')} has been transferred to you for <strong>${projectName}</strong>.</p>
      <p>Please log in to confirm receipt of funds.</p>
    `,
  });
};

module.exports = { sendEmail, sendFundRequestEmail, sendApprovalEmail, sendTransferEmail };
