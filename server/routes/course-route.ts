import express from 'express';
import { authorizeRole, isAuthenticated } from '../middlewares/auth';
import {
  editCourse,
  getAllCourses,
  getCourseForValidUser,
  getSingleCourse,
  uploadCourse,
} from '../controllers/course.controller';

const courseRouter = express.Router();

courseRouter.post(
  '/create-course',
  isAuthenticated,
  authorizeRole('admin'),
  uploadCourse,
);

courseRouter.put(
  '/edit-course/:id',
  isAuthenticated,
  authorizeRole('admin'),
  editCourse,
);

courseRouter.get('/get-course/:id', getSingleCourse);

courseRouter.get('/get-courses', getAllCourses);

courseRouter.get(
  '/get-valid-courses',
  isAuthenticated,
  getCourseForValidUser,
);

export default courseRouter;
