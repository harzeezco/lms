import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Document, Schema, model } from 'mongoose';

require('dotenv').config();

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  avatar: {
    public_id: string;
    url: string;
  };
  comparePassword: (password: string) => Promise<boolean>;
  courses: Array<{ courseId: string }>;
  email: string;
  name: string;
  password: string;
  role: string;
  isVerified: boolean;
  signAccessToken: () => string;
  signRefreshToken: () => string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      validate: {
        validator: (value: string) => emailRegexPattern.test(value),
        message: 'Please add a valid email',
      },
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true },
);

// hash password berfore saving to db
UserSchema.pre('save', async function (next: NextFunction) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await bcrypt.hash(this.password as string, 10);
  next();
});

// sign access token
UserSchema.methods.signAccessToken = function (): string {
  return jwt.sign(
    { id: this._id },
    (process.env.ACCESS_TOKEN as string) || '',
    {
      expiresIn: '5m',
    },
  );
};

// Refresh access token
UserSchema.methods.signRefreshToken = function (): string {
  return jwt.sign(
    { id: this._id },
    (process.env.REFRESH_TOKEN as string) || '',
    {
      expiresIn: '3d',
    },
  );
};

// compare user password with database password after hashing the password user entered
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = model<IUser>('User', UserSchema);

export default UserModel;
