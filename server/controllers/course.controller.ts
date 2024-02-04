import cloudinary from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import ErrorHandler from '../utils/error-handlers';
import { CatchAsyncError } from '../middlewares/catch-async';
import { createCourse } from '../services/course-service';
import CourseModel from '../models/course-model';
import { redis } from '../utils/redis';

// upload Course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data?.thumbnail;
      console.log(thumbnail);

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(
          thumbnail,
          {
            folder: 'courses',
          },
        );
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  },
);

// Edit Course

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data?.thumbnail;

      // if (thumbnail) {
      //   await cloudinary.v2.uploader.destroy(thumbnail?.public_id);
      //   const myCloud = await cloudinary.v2.uploader.upload(
      //     thumbnail.public_id,
      //     {
      //       folder: 'courses',
      //     },
      //   );

      //   data.thumbnail = {
      //     public_id: myCloud.public_id,
      //     url: myCloud.secure_url,
      //   };

      //   const courseId = req.params.id;

      //   const course = await CourseModel.findByIdAndUpdate(
      //     courseId,
      //     { $set: data },
      //     { new: true },
      //   );

      //   res.status(201).json({
      //     success: true,
      //     course,
      //   });
      // }

      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true },
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  },
);

// Get single course details without purchasing

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCourseCached = await redis.get(courseId);

      if (isCourseCached) {
        const course = JSON.parse(isCourseCached);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(
          req.params.id,
        ).select(
          '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links',
        );

        if (course) await redis.set(courseId, JSON.stringify(course));

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  },
);

// Get all courses without purchasing

export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCoursesCached = await redis.get('allCourses');
      if (isCoursesCached) {
        const courses = JSON.parse(isCoursesCached);
        res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select(
          '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links',
        );

        if (courses) {
          await redis.set('allCourses', JSON.stringify(courses));
        }

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  },
);

// get course content -- only for valid user

export const getCourseForValidUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userCourseList = req.user.courses;
    const courseId = req.params.id;

    const courseExist = userCourseList.find(
      (course: any) => course._id.toString() === courseId,
    );

    if (!courseExist) {
      return next(new ErrorHandler(404, 'Course not found'));
    }

    const course = await CourseModel.findById(courseId);

    const content = course?.courseData;

    res.status(200).json({
      success: true,
      content,
    });
  },
);

// Add question in course

interface IQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId } =
        req.body as IQuestionData;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new ErrorHandler(404, 'Course not found'));
      }
      const courseContent = course?.courseData.find((content: any) =>
        content._id.equals(contentId),
      );

      if (!courseContent) {
        return next(
          new ErrorHandler(404, 'Course content not found'),
        );
      }

      // create a new question object
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // Add this to our course content
      courseContent.questions.push(newQuestion);

      // save the updated course content
      await course?.save();

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  },
);
