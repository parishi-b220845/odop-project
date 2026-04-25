const { pool } = require('../config/database');
const { generateTicketNumber } = require('../utils/helpers');

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, category, orderId, message } = req.body;
    const ticketNumber = generateTicketNumber();

    const ticket = await pool.query(
      `INSERT INTO support_tickets (ticket_number, user_id, order_id, subject, category) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [ticketNumber, req.user.id, orderId || null, subject, category]
    );

    if (message) {
      await pool.query(
        `INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES ($1,$2,$3)`,
        [ticket.rows[0].id, req.user.id, message]
      );
    }

    res.status(201).json({ ticket: ticket.rows[0] });
  } catch (error) { next(error); }
};

exports.getTickets = async (req, res, next) => {
  try {
    let where = 'WHERE st.user_id = $1';
    let params = [req.user.id];
    if (req.user.role === 'admin') { where = ''; params = []; }

    const result = await pool.query(`
      SELECT st.*, u.name as user_name FROM support_tickets st JOIN users u ON st.user_id = u.id ${where} ORDER BY st.created_at DESC
    `, params);
    res.json({ tickets: result.rows });
  } catch (error) { next(error); }
};

exports.getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await pool.query('SELECT st.*, u.name as user_name FROM support_tickets st JOIN users u ON st.user_id=u.id WHERE st.id=$1', [id]);
    if (ticket.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await pool.query(
      'SELECT tm.*, u.name as sender_name FROM ticket_messages tm JOIN users u ON tm.sender_id=u.id WHERE tm.ticket_id=$1 ORDER BY tm.created_at ASC',
      [id]
    );

    res.json({ ticket: ticket.rows[0], messages: messages.rows });
  } catch (error) { next(error); }
};

exports.replyToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const result = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, message, is_admin) VALUES ($1,$2,$3,$4) RETURNING *`,
      [id, req.user.id, message, req.user.role === 'admin']
    );

    if (req.user.role === 'admin') {
      await pool.query("UPDATE support_tickets SET status='in_progress' WHERE id=$1 AND status='open'", [id]);
    }

    res.status(201).json({ message: result.rows[0] });
  } catch (error) { next(error); }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE support_tickets SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json({ ticket: result.rows[0] });
  } catch (error) { next(error); }
};
