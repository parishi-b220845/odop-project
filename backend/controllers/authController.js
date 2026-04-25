const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { sendWelcomeEmail } = require('../services/emailService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const userRole = ['buyer', 'seller'].includes(role) ? role : 'buyer';
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, email_verified) VALUES ($1,$2,$3,$4,$5,true) RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, phone, userRole]
    );
    const user = result.rows[0];

    if (userRole === 'seller') {
      const { businessName, description, district, state } = req.body;
      await pool.query(
        `INSERT INTO seller_profiles (user_id, business_name, description, district, state, city) VALUES ($1,$2,$3,$4,$5,$4)`,
        [user.id, businessName || name + "'s Shop", description || '', district || '', state || '']
      );
    }

    const tokens = generateTokens(user.id);
    sendWelcomeEmail(email, name);
    res.status(201).json({ user, ...tokens });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT id, name, email, password_hash, role, is_active, avatar_url FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const tokens = generateTokens(user.id);
    const { password_hash, ...userData } = user;

    let sellerProfile = null;
    if (user.role === 'seller') {
      const sp = await pool.query('SELECT * FROM seller_profiles WHERE user_id = $1', [user.id]);
      if (sp.rows.length > 0) sellerProfile = sp.rows[0];
    }

    res.json({ user: userData, sellerProfile, ...tokens });
  } catch (error) { next(error); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    let sellerProfile = null;
    if (user.role === 'seller') {
      const sp = await pool.query('SELECT * FROM seller_profiles WHERE user_id = $1', [user.id]);
      if (sp.rows.length > 0) sellerProfile = sp.rows[0];
    }
    let addresses = [];
    if (user.role === 'buyer') {
      addresses = (await pool.query('SELECT * FROM buyer_addresses WHERE user_id = $1 ORDER BY is_default DESC', [user.id])).rows;
    }
    res.json({ user, sellerProfile, addresses });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const result = await pool.query(
      'UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone), avatar_url=COALESCE($3,avatar_url) WHERE id=$4 RETURNING id,name,email,phone,role,avatar_url',
      [name, phone, avatar_url, req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (error) { next(error); }
};

exports.updateSellerProfile = async (req, res, next) => {
  try {
    const f = req.body;
    const result = await pool.query(
      `UPDATE seller_profiles SET business_name=COALESCE($1,business_name), description=COALESCE($2,description), bio=COALESCE($3,bio), craft_speciality=COALESCE($4,craft_speciality), gstin=COALESCE($5,gstin), pan_number=COALESCE($6,pan_number), bank_account=COALESCE($7,bank_account), bank_ifsc=COALESCE($8,bank_ifsc), bank_name=COALESCE($9,bank_name), address_line1=COALESCE($10,address_line1), city=COALESCE($11,city), state=COALESCE($12,state), pincode=COALESCE($13,pincode), district=COALESCE($14,district) WHERE user_id=$15 RETURNING *`,
      [f.businessName, f.description, f.bio, f.craftSpeciality, f.gstin, f.panNumber, f.bankAccount, f.bankIfsc, f.bankName, f.addressLine1, f.city, f.state, f.pincode, f.district, req.user.id]
    );
    res.json({ sellerProfile: result.rows[0] });
  } catch (error) { next(error); }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { label, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;
    if (isDefault) await pool.query('UPDATE buyer_addresses SET is_default=false WHERE user_id=$1', [req.user.id]);
    const result = await pool.query(
      `INSERT INTO buyer_addresses (user_id,label,name,phone,address_line1,address_line2,city,state,pincode,is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, label||'Home', name, phone, addressLine1, addressLine2||'', city, state, pincode, isDefault||false]
    );
    res.status(201).json({ address: result.rows[0] });
  } catch (error) { next(error); }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM buyer_addresses WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Address deleted' });
  } catch (error) { next(error); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    res.json(generateTokens(decoded.userId));
  } catch (error) { res.status(401).json({ error: 'Invalid refresh token' }); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!(await bcrypt.compare(currentPassword, result.rows[0].password_hash)))
      return res.status(400).json({ error: 'Current password is incorrect' });
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(newPassword, 12), req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (error) { next(error); }
};
