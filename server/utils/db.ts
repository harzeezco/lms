import mongoose from 'mongoose';

require('dotenv').config();

const dbUrl = process.env.DB_URL || '';

export default async function connectDB() {
  const data = await mongoose.connect(dbUrl);

  try {
    console.log(
      `MongoDB connected with server: ${data.connection.host}`,
    );
  } catch (error) {
    console.log(error);
  }
}
