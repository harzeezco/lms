import { createServer } from 'node:http';

import { v2 as cloudinary } from 'cloudinary';
import app from './app';

import connectDB from './utils/db';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

require('dotenv').config();

const port = Number.parseInt(process.env.PORT || '5173', 10);
const server = createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

connectDB();
