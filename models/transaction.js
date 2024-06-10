const pool = require("../config/database.js");

const getAllTransaction = async () => {
  const user = await pool.query(
    "SELECT transaction.id, invoice, data_user.name, transaction.created_at FROM transaction INNER JOIN data_user ON data_user.user_id = transaction.user_id ORDER BY transaction.id ASC"
  );
  return user.rows;
};

const getAllTransactionByUserId = async (data) => {
  const user = await pool.query(
    "SELECT transaction.id, invoice, data_user.name, transaction.created_at FROM transaction INNER JOIN data_user ON data_user.user_id = transaction.user_id WHERE transaction.user_id = $1 ORDER BY transaction.id ASC",
    [data]
  );
  return user.rows;
};

const getTransactionByInv = async (data) => {
  const user = await pool.query(
    "SELECT id FROM transaction WHERE invoice = $1",
    [data]
  );
  return user.rows[0];
};

const getDetailTransaction = async (id) => {
  const user = await pool.query(
    "SELECT product_name, product_price, product_total FROM detail_transaction WHERE transaction_id = $1 ORDER BY detail_transaction.id ASC",
    [id]
  );
  return user.rows;
};

const addTransaction = async (data) => {
  const user = await pool.query(
    "INSERT INTO transaction (invoice, user_id, created_at) VALUES ($1, $2, $3)",
    [data[0], data[1], data[2]]
  );
  return user;
};

const addTransactionDetail = async (data) => {
  const user = await pool.query(
    "INSERT INTO detail_transaction (transaction_id, product_name, product_total, product_price) VALUES ($1, $2, $3, $4)",
    [data[0], data[1], data[2], data[3]]
  );
  return user;
};

// Fungsi untuk mendapatkan produk berdasarkan ID produk
const fetchProductsById = async (productId) => {
  const product = await pool.query(
    "SELECT * FROM products WHERE product_id = $1", // Pastikan nama kolom benar
    [productId]
  );
  return product.rows[0];
};

// Fungsi untuk memperbarui kuantitas produk
const updateQuantityProduct = async (quantity, productId) => {
  const product = await pool.query(
    "UPDATE products SET stock_quantity = $1 WHERE product_id = $2", // Pastikan nama kolom benar
    [quantity, productId]
  );
  return product;
};

module.exports = {
  getAllTransaction,
  getDetailTransaction,
  addTransaction,
  addTransactionDetail,
  getAllTransactionByUserId,
  getTransactionByInv,
  fetchProductsById,
  updateQuantityProduct,
};
