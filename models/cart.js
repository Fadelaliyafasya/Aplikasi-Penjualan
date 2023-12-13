const pool = require("../models/database.js");

const addCart = async (data) => {
  // Set quantity to 1 if not provided
  const quantity = data[2] || 1;

  const cart = await pool.query(
    "insert into cart (user_id, product_id, quantity) values ($1, $2, $3)",
    [data[0], data[1], quantity]
  );
  return cart;
};

const searchCart = async (user_id, product_id) => {
  const cart = await pool.query(
    "select * from cart where user_id = $1 and product_id = $2",
    [user_id, product_id]
  );
  return cart.rows[0];
};

const updateCart = async (data) => {
  const cart = await pool.query(
    "update cart set quantity = $1 where user_id = $2 and product_id = $3",
    [data[2], data[0], data[1]]
  );
  return cart;
};

const searchCartByUserId = async (data) => {
  const cart = await pool.query(
    "SELECT cart.cart_id, cart.product_id, products.product_name, cart.quantity as jumlah_beli, products.stock_quantity as jumlah_barang, price FROM cart INNER JOIN products ON cart.product_id = products.product_id WHERE user_id = $1 ORDER BY cart_id asc",
    [data]
  );
  return cart.rows;
};

module.exports = { addCart, searchCart, updateCart, searchCartByUserId };
