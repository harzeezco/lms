/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable no-param-reassign */
import { NextFunction, Request, Response } from 'express';

import ErrorHandler from '../utils/error-handlers';

export default (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // if mongodb id is not correct or specify this error code should run
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;

    err = new ErrorHandler(404, message);
  }

  // if key is duplicated
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;

    err = new ErrorHandler(400, message);
  }

  // if wrong jwt error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Json Web Token is invalid, try again';

    err = new ErrorHandler(400, message);
  }

  // if jwt is expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Json Web Token is expired, try again';

    err = new ErrorHandler(400, message);
  }

  res.status(err.statusCode).json({
    status: false,
    message: err.message,
  });
};
