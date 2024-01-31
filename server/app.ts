import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import Error from './middlewares/error';
import userRouter from './routes/user-route';

require('dotenv').config();

const app = express();

export default app;

app.use(express.json({ limit: '54mb' }));

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use('/api', userRouter);

app.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'message sent successfully',
  });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as any;

  res.statusCode = 404;
  next(error);
});

app.use(Error);
