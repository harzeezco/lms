import { Response } from 'express';
import { CatchAsyncError } from '../middlewares/catch-async';
import CourseModel from '../models/course-model';

// create a course

export const createCourse = CatchAsyncError(
  async (data: any, res: Response) => {
    try {
      const course = await CourseModel.create(data);

      return res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);
