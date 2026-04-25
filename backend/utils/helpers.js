const slugify = require('slugify');
const crypto = require('crypto');

const generateSlug = (text) => {
  return slugify(text, { lower: true, strict: true, trim: true }) + '-' + crypto.randomBytes(3).toString('hex');
};

const generateOrderNumber = () => {
  const prefix = 'ODOP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateTicketNumber = () => {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const paginate = (page = 1, limit = 12) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(Math.max(1, parseInt(limit) || 12), 50);
  const offset = (p - 1) * l;
  return { limit: l, offset, page: p };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

module.exports = { generateSlug, generateOrderNumber, generateTicketNumber, paginate, buildPaginationMeta };
