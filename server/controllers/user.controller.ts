import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ejs from 'ejs';

import path from 'path';
import cloudinary from 'cloudinary';
import { CatchAsyncError } from '../middlewares/catch-async';
import ErrorHandler from '../utils/error-handlers';
import UserModel from '../models/user-model';
import sendEmail from '../utils/send-mail';
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from '../utils/jwt';
import { redis } from '../utils/redis';
import { getUseerById } from '../services/user-service';

require('dotenv').config();

interface ActiveToken {
  activationCode: string;
  token: string;
}

export const createActiveToken = (user: IUser): ActiveToken => {
  const activationCode = Math.floor(Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET!,
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

// activate user and save to database

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } =
        jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET as string,
        ) as { user: IUser; activationCode: string };

      if (activation_code !== newUser.activationCode) {
        return next(new ErrorHandler(400, 'Invalid activation code'));
      }

      const { email, name, password } = newUser.user;

      const existUser = await UserModel.findOne({ email });

      if (existUser) {
        return next(new ErrorHandler(400, 'Email already in use'));
      }

      const user = await UserModel.create({
        email,
        name,
        password,
      });

      res.status(201).json({
        success: true,
        message: 'Account has been activated',
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

interface ILoginUser {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginUser;

      if (!email || !password) {
        return next(
          new ErrorHandler(400, 'Please add email and password'),
        );
      }

      const user = await UserModel.findOne({ email }).select(
        '+password',
      );

      if (!user) {
        return next(
          new ErrorHandler(400, 'Invalid email and password'),
        );
      }

      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        return next(
          new ErrorHandler(400, 'Invalid email and password'),
        );
      }

      sendToken(user, res, 200);
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

export const logOutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie('access_token', '', { maxAge: 1 });
      res.cookie('refresh_token', '', { maxAge: 1 });
      const userId = req.user?._id || '';

      redis.del(userId);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

// update access token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN! as string,
      ) as JwtPayload;

      const message = 'Could not access token';

      if (!decoded) {
        return next(new ErrorHandler(400, message));
      }

      const session = await redis.get(decoded.id as string);

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN! as string,
        {
          expiresIn: '5m',
        },
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN! as string,
        {
          expiresIn: '3d',
        },
      );

      req.user = user;

      res.cookie('access_token', accessToken, accessTokenOptions);
      res.cookie('refresh_token', refreshToken, refreshTokenOptions);

      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user?._id;
      1;
      getUseerById(user, res);
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

// social auth

interface ISocialLogin {
  name: string;
  email: string;
  avatar: string;
}

export const socialLogin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialLogin;
      const user = await UserModel.findOne({ email });

      if (!user) {
        const newUser = await UserModel.create({
          email,
          name,
          avatar,
        });
        sendToken(newUser, res, 201);
      } else {
        sendToken(user, res, 200);
      }
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

// UDATE USER INFO
interface IUpdateUser {
  name: string;
  email: string;
}

export const updateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body as IUpdateUser;
      const userId = req.user?._id;
      const user = await UserModel.findById(req.user?._id);

      if (email && user) {
        const isUserExist = await UserModel.findOne({ email });

        if (isUserExist) {
          return next(new ErrorHandler(400, 'Email already in use'));
        }

        user.email = email;
      }

      if (name && user) {
        user.name = name;
      }

      await user?.save();
      await redis.set(userId, JSON.stringify(user) as any);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

// update user password

interface IUserPassword {
  oldPassword: string;
  newPassword: string;
}

export const updateUserPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUserPassword;

      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler(
            400,
            'Please provide old and new password',
          ),
        );
      }
      const user = await UserModel.findById(req.user?._id).select(
        '+password',
      );

      if (!user.password) {
        return next(new ErrorHandler(400, 'User not found'));
      }

      const isPasswordMatch = await user.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler(400, 'Incorrect password'));
      }

      user.password = newPassword;
      await redis.set(req.user?._id, JSON.stringify(user) as any);
      await user.save();

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);

// update user avatar
interface IUpdateUserAvatar {
  avatar: string;
}

export const updateUserAvatar = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateAvatar = req.body as unknown as IUpdateUserAvatar;

      const { avatar } = updateAvatar;
      const user = await UserModel.findById(req.user?._id);

      if (avatar && user) {
        if (user.avatar.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(
            avatar,
            {
              folder: 'avatars',
              width: '150',
            },
          );

          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(
            avatar,
            {
              folder: 'avatars',
              width: '150',
            },
          );
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }

        await user.save();
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  },
);
