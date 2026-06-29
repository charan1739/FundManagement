const { nanoid } = require('crypto');

/**
 * Generates a group code in format PRJ-XXXX
 * Uses 4 random uppercase alphanumeric chars
 */
const generateGroupCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PRJ-${code}`;
};

module.exports = { generateGroupCode };
