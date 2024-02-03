import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CatchAsyncError } from './catch-async';
import ErrorHandler from '../utils/error-handlers';
import { redis } from '../utils/redis';

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandler(401, 'Not authorized to access this route'),
      );
    }

    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN! as string,
    ) as JwtPayload;

    if (!decoded) {
      return next(
        new ErrorHandler(401, 'Not authorized to access this route'),
      );
    }

    const user = await redis.get(decoded.id);

    if (!user) {
      return next(
        new ErrorHandler(401, 'Not authorized to access this route'),
      );
    }

    (req as any).user = JSON.parse(user);

    next();
  },
);

// validate user role
export const authorizeRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(
        new ErrorHandler(
          403,
          `Not authorized to access this route. Required role: ${req.user?.role}`,
        ),
      );
    }
    next();
  };
