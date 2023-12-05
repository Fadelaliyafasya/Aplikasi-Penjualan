const pool = require("../models/database.js");
const bcrypt = require("bcrypt");

// Fungsi untuk ambil data dari database PostgreSQL
const fetchData = async () => {
  const connection = await pool.connect();

  const query = `SELECT * FROM data_admin`;

  const results = await connection.query(query);

  connection.release();

  const admins = results.rows;

  return admins;
};

const fetchAdminById = async (nama) => {
  const connection = await pool.connect();

  const query = "SELECT * FROM data_admin WHERE nama = $3";
  const result = await connection.query(query, [nama]);

  connection.release();

  return result.rows[0];
};

// Add new Admin
// Add new Admin
const addDataAdmin = async (username, nama, email, mobile_phone, password) => {
  const connection = await pool.connect();

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO data_admin (username, nama, email, mobile_phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *";

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

// Fungsi untuk Cek ID  data_admin
const checkIdAdmin = async (id_admin) => {
  const connection = await pool.connect();

  try {
    // Mengecek apakah id_admin sudah terdaftar
    const duplicateCheck = await connection.query(
      "SELECT COUNT(*) FROM data_admin WHERE id_admin = $1",
      [id_admin]
    );

    if (duplicateCheck.rows[0].count === 0) {
      // Jika tidak ada duplikat, mengembalikan null
      return null;
    }

    // Mengambil data pegawai berdasarkan id_admin
    const result = await connection.query(
      "SELECT * FROM data_admin WHERE id_admin = $1",
      [id_admin]
    );

    // Mengembalikan data data_admin
    return result.rows[0];
  } finally {
    connection.release();
  }
};

// duplicate Id check
const duplicateIdCheck = async (id_admin) => {
  const admins = await fetchData();
  return admins.find((data_admin) => data_admin.id_admin === id_admin);
};

// duplicate Name check
const duplicateName = async (nama) => {
  const admins = await fetchData();
  return admins.find((data_admin) => data_admin.nama === nama);
};

// duplicate password check
const duplicatePassword = async (password) => {
  const admins = await fetchData();
  return admins.find((data_admin) => data_admin.password === password);
};

// email duplicate check
const emailDuplicateCheck = async (email) => {
  const admins = await fetchData();
  return admins.find((data_admin) => data_admin.email === email);
};

// update contact
const updateAdmin = async (newContact) => {
  const connection = await pool.connect();
  const query = `
    UPDATE data_admin
    SET id_admin = $1, username = $2, nama = $3, email = $4, mobile_phone = $5
    WHERE nama = $6
  `;
  await connection.query(query, [
    newContact.id_admin,
    newContact.username,
    newContact.nama,
    newContact.email,
    newContact.mobile_phone,
    newContact.oldName,
  ]);
};

// Delete-Admin
const deleteDataAdmin = async (id_admin) => {
  const connection = await pool.connect();
  try {
    const query = "DELETE FROM data_admin WHERE id_admin = $1 RETURNING *";

    const result = await connection.query(query, [id_admin]);

    return result.rows[0]; // Mengembalikan baris yang dihapus
  } finally {
    connection.release();
  }
};

// Cari contact
const searchAdmin = async (id_admin) => {
  const admins = await fetchData();
  const admin = admins.find(
    (data_admin) => data_admin.id_admin.toLowerCase() === id_admin.toLowerCase()
  );
  return admin;
};

module.exports = {
  fetchData,
  addDataAdmin,
  deleteDataAdmin,
  fetchAdminById,
  checkIdAdmin,
  duplicateIdCheck,
  searchAdmin,
  emailDuplicateCheck,
  updateAdmin,
  duplicateName,
  duplicatePassword,
};
