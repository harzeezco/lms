import { createServer } from 'node:http';

import app from './app';

import connectDB from './utils/db';

require('dotenv').config();

const port = Number.parseInt(process.env.PORT || '5173', 10);
const server = createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

connectDB();
