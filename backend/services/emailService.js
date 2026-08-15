const https = require('https');

/**
 * Send an email via Brevo REST API (no SDK).
 * Free plan: 300 emails/day, no domain verification required.
 */
const sendEmail = ({ to, subject, html, text }) => {
  if (process.env.MAIL_ENABLED !== 'true') {
    console.log(`[Email Skipped — MAIL_ENABLED=false] To: ${to} | Subject: ${subject}`);
    return Promise.resolve({ skipped: true });
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: {
        name: process.env.MAIL_SENDER_NAME || 'Fund Manager',
        email: process.env.MAIL_USER || 'upgradeschoolsupport@gmail.com',
      },
      to: [{ email: to }],
      subject,
      htmlContent: html || `<p>${text || subject}</p>`,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = JSON.parse(body);
          console.log(`[Email Sent via Brevo] To: ${to} | MessageId: ${data.messageId}`);
          resolve(data);
        } else {
          const err = new Error(`Brevo API error ${res.statusCode}: ${body}`);
          console.error(`[Brevo Error] ${err.message}`);
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[Brevo Request Error]`, err.message);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
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
