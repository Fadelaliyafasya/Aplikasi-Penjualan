const pool = require("../models/database.js");

// Fungsi untuk ambil data dari database PostgreSQL
// const fetchDataProducts = async () => {
//   const connection = await pool.connect();

//   const query = `SELECT * FROM products`;

//   const results = await connection.query(query);

//   connection.release();

//   const products = results.rows;

//   return products;
// };

const fetchDataProducts = async () => {
  const connection = await pool.connect();

  try {
    const query = "SELECT * FROM products";

    const results = await connection.query(query);

    const products = results.rows.map((product) => {
      // Format harga sebagai Rupiah
      const formattedPrice = product.price.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      });

      // Kembalikan produk dengan harga yang diformat
      return {
        ...product,
        price: formattedPrice,
      };
    });

    return products;
  } finally {
    connection.release();
  }
};

const fetchProductsById = async (product_id) => {
  const connection = await pool.connect();

  const query = "SELECT * FROM products WHERE product_id = $1";
  const result = await connection.query(query, [product_id]);

  connection.release();

  return result.rows[0];
};

// Add new Products
const addDataProducts = async (
  product_name,
  description,
  price,
  stock_quantity,
  image,
  category
) => {
  const connection = await pool.connect();

  const query =
    "INSERT INTO products (product_name, description, price, stock_quantity, image, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

  const values = [
    product_name,
    description,
    price,
    stock_quantity,
    image,
    category,
  ];

  const result = await connection.query(query, values);

  connection.release();

  return result.rows[0];
};

const totalProducts = async (product_name) => {
  const connection = await pool.connect();

  try {
    let query = "SELECT COUNT(*) AS total_produk FROM products";
    const values = [];

    if (product_name) {
      query += " WHERE product_name = $1";
      values.push(product_name);
    }

    const result = await connection.query(query, values);

    return result.rows[0].total_produk;
  } finally {
    connection.release();
  }
};

// Fungsi untuk Cek ID  products
const checkIdProducts = async (product_id) => {
  const connection = await pool.connect();

  try {
    // Mengecek apakah product_id sudah terdaftar
    const duplicateCheck = await connection.query(
      "SELECT COUNT(*) FROM products WHERE product_id = $1",
      [product_id]
    );

    if (duplicateCheck.rows[0].count === 0) {
      // Jika tidak ada duplikat, mengembalikan null
      return null;
    }

    // Mengambil data pegawai berdasarkan product_id
    const result = await connection.query(
      "SELECT * FROM products WHERE product_id = $1",
      [product_id]
    );

    // Mengembalikan data products
    return result.rows[0];
  } finally {
    connection.release();
  }
};

// duplicate Id check
const duplicateIdProductsCheck = async (product_id) => {
  const products = await fetchDataProducts();
  return products.find((products) => products.product_id === product_id);
};

// duplicate Name check
const duplicateProductsName = async (product_name) => {
  const products = await fetchDataProducts();
  return products.find((products) => products.product_name === product_name);
};

// email duplicate check
const emailDuplicateProductsCheck = async (email) => {
  const products = await fetchDataProducts();
  return products.find((products) => products.email === email);
};

// update contact
const updateProducts = async (newContact) => {
  const connection = await pool.connect();
  const query = `
    UPDATE products
    SET product_id = $1, product_name = $2, description = $3, price = $4, stock_quantity = $5
    WHERE nama = $6
  `;
  await connection.query(query, [
    newContact.product_id,
    newContact.product_name,
    newContact.description,
    newContact.price,
    newContact.stock_quantity,
    newContact.oldName,
  ]);
};

// Delete-products
const deleteDataProducts = async (product_name) => {
  const connection = await pool.connect();
  try {
    const query = "DELETE FROM products WHERE product_name = $1 RETURNING *";

    const result = await connection.query(query, [product_name]);

    return result.rows[0]; // Mengembalikan baris yang dihapus
  } finally {
    connection.release();
  }
};

// Cari contact
const searchProducts = async (product_id) => {
  const products = await fetchDataProducts();
  const product = products.find(
    (products) => products.product_id.toLowerCase() === product_id.toLowerCase()
  );
  return product;
};

module.exports = {
  fetchDataProducts,
  addDataProducts,
  fetchProductsById,
  checkIdProducts,
  duplicateIdProductsCheck,
  searchProducts,
  emailDuplicateProductsCheck,
  deleteDataProducts,
  duplicateProductsName,
  updateProducts,
  totalProducts,
};
