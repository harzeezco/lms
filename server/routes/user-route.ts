import express from 'express';
import {
  activateUser,
  getUserInfo,
  logOutUser,
  loginUser,
  registerUser,
  socialLogin,
  updateAccessToken,
  updateUser,
  updateUserPassword,
} from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth';

const userRouter = express.Router();

userRouter.post('/register', registerUser);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login', loginUser);

userRouter.post('/social-auth', socialLogin);

userRouter.get('/logout', isAuthenticated, logOutUser);

userRouter.get('/refresh', updateAccessToken);

userRouter.get('/user', isAuthenticated, getUserInfo);

userRouter.put('/update-userInfo', isAuthenticated, updateUser);

userRouter.put(
  '/update-userPassword',
  isAuthenticated,
  updateUserPassword,
);

export default userRouter;
