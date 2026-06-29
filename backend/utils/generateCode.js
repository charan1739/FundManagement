/**
 * Generates a unique project code like PFM-2024-ABCD
 */
const generateProjectCode = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PFM-${year}-${code}`;
};

/**
 * Generates a transaction ID like TXN-XXXXXXXXXXXXXXXX
 */
const generateTransactionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'TXN-';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

module.exports = { generateProjectCode, generateTransactionId };
