const pool = require("../models/database.js");
const bcrypt = require("bcrypt");

// Fungsi untuk ambil data dari database PostgreSQL
const fetchDataCustomers = async () => {
  const connection = await pool.connect();

  const query = `SELECT * FROM data_customer`;

  const results = await connection.query(query);

  connection.release();

  const customers = results.rows;

  return customers;
};

const fetchCustomerById = async (id_customer) => {
  const connection = await pool.connect();

  const query = "SELECT * FROM data_customer WHERE id_customer = $1";
  const result = await connection.query(query, [id_customer]);

  connection.release();

  return result.rows[0];
};

// Add new Customer
// Add new Admin
const addDataCustomer = async (
  username,
  nama,
  email,
  mobile_phone,
  password
) => {
  const connection = await pool.connect();

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO data_customer (username, nama, email, mobile_phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *";

    const values = [username, nama, email, mobile_phone, hashedPassword];

    const result = await connection.query(query, values);

    return result.rows[0];
  } catch (error) {
    // Handle error appropriately, for example, log the error
    console.error(error);
    throw new Error("An error occurred while adding data");
  } finally {
    connection.release();
  }
};

const totalCustomer = async (nama) => {
  const connection = await pool.connect();

  try {
    let query = "SELECT COUNT(*) AS total_customer FROM data_customer";
    const values = [];

    if (nama) {
      query += " WHERE nama = $1";
      values.push(nama);
    }

    const result = await connection.query(query, values);

    return result.rows[0].total_customer;
  } finally {
    connection.release();
  }
};

// Fungsi untuk Cek ID  data_customer
const checkIdCustomer = async (id_customer) => {
  const connection = await pool.connect();

  try {
    // Mengecek apakah id_customer sudah terdaftar
    const duplicateCheck = await connection.query(
      "SELECT COUNT(*) FROM data_customer WHERE id_customer = $1",
      [id_customer]
    );

    if (duplicateCheck.rows[0].count === 0) {
      // Jika tidak ada duplikat, mengembalikan null
      return null;
    }

    // Mengambil data pegawai berdasarkan id_customer
    const result = await connection.query(
      "SELECT * FROM data_customer WHERE id_customer = $1",
      [id_customer]
    );

    // Mengembalikan data data_customer
    return result.rows[0];
  } finally {
    connection.release();
  }
};

// duplicate Id check
const duplicateIdCustomerCheck = async (id_customer) => {
  const customers = await fetchDataCustomers();
  return customers.find(
    (data_customer) => data_customer.id_customer === id_customer
  );
};

// duplicate Name check
const duplicateCustomerName = async (nama) => {
  const customers = await fetchDataCustomers();
  return customers.find((data_customer) => data_customer.nama === nama);
};

// duplicate password check
const duplicatePasswordCustomer = async (password) => {
  const customers = await fetchDataCustomers();
  return customers.find((data_customer) => data_customer.password === password);
};

// duplicate username check
const duplicateUsernameCustomer = async (username) => {
  const customers = await fetchDataCustomers();
  return customers.find((data_customer) => data_customer.username === username);
};

// email duplicate check
const emailDuplicateCustomerCheck = async (email) => {
  const customers = await fetchDataCustomers();
  return customers.find((data_customer) => data_customer.email === email);
};

// update contact
const updateCustomer = async (newContact) => {
  const connection = await pool.connect();
  const query = `
    UPDATE data_customer
    SET id_customer = $1, username = $2, nama = $3, email = $4, mobile_phone = $5
    WHERE nama = $6
  `;
  await connection.query(query, [
    newContact.id_customer,
    newContact.username,
    newContact.nama,
    newContact.email,
    newContact.mobile_phone,
    newContact.oldName,
  ]);
};

// Delete-customer
const deleteDataCustomer = async (id_customer) => {
  const connection = await pool.connect();
  try {
    const query =
      "DELETE FROM data_customer WHERE id_customer = $1 RETURNING *";

    const result = await connection.query(query, [id_customer]);

    return result.rows[0]; // Mengembalikan baris yang dihapus
  } finally {
    connection.release();
  }
};

// Cari contact
const searchCustomer = async (id_customer) => {
  const customers = await fetchDataCustomers();
  const costumer = customers.find(
    (data_customer) =>
      data_customer.id_customer.toLowerCase() === id_customer.toLowerCase()
  );
  return costumer;
};

module.exports = {
  fetchDataCustomers,
  addDataCustomer,
  deleteDataCustomer,
  fetchCustomerById,
  checkIdCustomer,
  duplicateIdCustomerCheck,
  searchCustomer,
  emailDuplicateCustomerCheck,
  updateCustomer,
  duplicateCustomerName,
  duplicatePasswordCustomer,
  duplicateUsernameCustomer,
  totalCustomer,
};
