import { Response } from 'express';
import UserModel from '../models/user-model';
import { redis } from '../utils/redis';

export async function getUseerById(id: string, res: Response) {
  const userJson = await redis.get(id);
  const user = JSON.parse(userJson as string);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
}
