import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';

import path from 'path';
import { CatchAsyncError } from '../middlewares/catch-async';
import ErrorHandler from '../utils/error-handlers';
import UserModel from '../models/user-model';
import sendEmail from '../utils/send-mail';

require('dotenv').config();

interface ActiveToken {
  activationCode: string;
  token: string;
}

export const createActiveToken = (
  user: IUser,
): ActiveToken => {
  const activationCode = Math.floor(Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '5m',
    },
  );

  return { token, activationCode };
};

// Type || Interface for registered User
interface IUser {
  avatar?: string;
  email: string;
  name: string;
  password: string;
}

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar, email, name, password } =
        req.body as unknown as IUser;

      // if email is already exist i.e store in database
      const isEmailExist = await UserModel.findOne({ email });

      if (isEmailExist) {
        return next(new ErrorHandler(400, 'Email already in use'));
      }

      const user: IUser = {
        avatar,
        email,
        name,
        password,
      };

      const activationToken = createActiveToken(user);

      const { activationCode } = activationToken;

      const data = {
        user: { name: user.name },
        activationCode,
      };
      const html = await ejs.renderFile(
        path.join(__dirname, '../mails/activation-mail.ejs'),
        data,
      );

      try {
        await sendEmail({
          email: user.email,
          subject: 'Activate your account',
          template: 'activation-mail.ejs',
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.name} to activate your account!`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(400, error.message));
      }
    } catch (error: any) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);
