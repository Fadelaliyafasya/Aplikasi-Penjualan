const pool = require("../models/database.js");
const bcrypt = require("bcrypt");

// Fungsi untuk ambil data dari database PostgreSQL
const fetchDataUser = async () => {
  const connection = await pool.connect();

  const query = `SELECT * FROM data_user`;

  const results = await connection.query(query);

  connection.release();

  const admins = results.rows;

  return admins;
};

const fetchUserById = async (name) => {
  const connection = await pool.connect();

  const query = "SELECT * FROM data_user WHERE name = $1";
  const result = await connection.query(query, [name]);

  connection.release();

  return result.rows[0];
};

// Add new Admin
const addDataUser = async (
  username,
  name,
  role,
  email,
  mobile_phone,
  password
) => {
  const connection = await pool.connect();

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO data_user (username, name, role, email, mobile_phone, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

    const values = [username, name, role, email, mobile_phone, hashedPassword];

    const result = await connection.query(query, values);

    return result.rows[0];
  } catch (error) {
    // Handle error appropriately, for example, log the error
    console.error(error.message);
    throw new Error("An error occurred while adding data");
  } finally {
    connection.release();
  }
};

const totalUser = async (name) => {
  const connection = await pool.connect();

  try {
    let query = "SELECT COUNT(*) AS total_user FROM data_user";
    const values = [];

    if (name) {
      query += " WHERE name = $1";
      values.push(name);
    }

    const result = await connection.query(query, values);

    return result.rows[0].total_user;
  } finally {
    connection.release();
  }
};

// Fungsi untuk Cek ID  data_user
const checkIdUser = async (user_id) => {
  const connection = await pool.connect();

  try {
    // Mengecek apakah user_id sudah terdaftar
    const duplicateCheck = await connection.query(
      "SELECT COUNT(*) FROM data_user WHERE user_id = $1",
      [user_id]
    );

    if (duplicateCheck.rows[0].count === 0) {
      // Jika tidak ada duplikat, mengembalikan null
      return null;
    }

    // Mengambil data user berdasarkan user_id
    const result = await connection.query(
      "SELECT * FROM data_user WHERE user_id = $1",
      [user_id]
    );

    // Mengembalikan data data_user
    return result.rows[0];
  } finally {
    connection.release();
  }
};

// duplicate Id check
const duplicateIdUserCheck = async (user_id) => {
  const admins = await fetchDataUser();
  return admins.find((data_user) => data_user.user_id === user_id);
};

// duplicate Name check
const duplicateUserName = async (name) => {
  const admins = await fetchDataUser();
  return admins.find((data_user) => data_user.name === name);
};

// duplicate password check
const duplicateUserPassword = async (password) => {
  const admins = await fetchDataUser();
  return admins.find((data_user) => data_user.password === password);
};

// email duplicate check
const emailDuplicateUserCheck = async (email) => {
  const admins = await fetchDataUser();
  return admins.find((data_user) => data_user.email === email);
};

// update contact
const updateUser = async (newContact) => {
  const connection = await pool.connect();
  const query = `
    UPDATE data_user
    SET user_id = $1, username = $2, name = $3, role = $4, email = $5, mobile_phone = $6
    WHERE name = $7
  `;
  ``;
  await connection.query(query, [
    newContact.user_id,
    newContact.username,
    newContact.name,
    newContact.role,
    newContact.email,
    newContact.mobile_phone,
    newContact.oldName,
  ]);
};

// Delete-User
const deleteDataUser = async (user_id) => {
  const connection = await pool.connect();
  try {
    const query = "DELETE FROM data_user WHERE user_id = $1 RETURNING *";

    const result = await connection.query(query, [user_id]);

    return result.rows[0]; // Mengembalikan baris yang dihapus
  } finally {
    connection.release();
  }
};

// Cari contact
const searchUser = async (user_id) => {
  const users = await fetchDataUser();
  const user = users.find(
    (data_user) => data_user.user_id.toLowerCase() === user_id.toLowerCase()
  );
  return user;
};

module.exports = {
  fetchDataUser,
  totalUser,
  addDataUser,
  deleteDataUser,
  fetchUserById,
  checkIdUser,
  duplicateIdUserCheck,
  searchUser,
  emailDuplicateUserCheck,
  updateUser,
  duplicateUserName,
  duplicateUserPassword,
};
