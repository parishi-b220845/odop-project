const { pool } = require('../config/database');

const validateProduct = async (state, district, productName) => {
  const result = await pool.query(
    `SELECT * FROM odop_dataset WHERE LOWER(state) = LOWER($1) AND LOWER(district) = LOWER($2) AND LOWER(product_name) LIKE LOWER($3)`,
    [state, district, `%${productName}%`]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

const getOdopByState = async (state) => {
  return (await pool.query('SELECT * FROM odop_dataset WHERE LOWER(state) = LOWER($1) ORDER BY district', [state])).rows;
};

const getOdopByDistrict = async (district) => {
  return (await pool.query('SELECT * FROM odop_dataset WHERE LOWER(district) = LOWER($1)', [district])).rows;
};

const getAllOdopProducts = async () => {
  return (await pool.query('SELECT * FROM odop_dataset ORDER BY state, district')).rows;
};

const getStatesWithProducts = async () => {
  return (await pool.query(`
    SELECT state, COUNT(*) as product_count, 
           array_agg(DISTINCT district) as districts,
           array_agg(DISTINCT product_name) as products
    FROM odop_dataset GROUP BY state ORDER BY state
  `)).rows;
};

module.exports = { validateProduct, getOdopByState, getOdopByDistrict, getAllOdopProducts, getStatesWithProducts };
