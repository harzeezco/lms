import { Document, Schema, model } from 'mongoose';
import { IUser } from './user-model';

interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies: Array<IComment>;
}

interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReplies: Array<IComment>;
}

interface ILink extends Document {
  title: string;
  url: string;
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: Array<ILink>;
  suggestion: string;
  questions: Array<IComment>;
}

interface ICourse extends Document {
  name: string;
  description: string;
  thumbnail: object;
  price: number;
  estimatedPrice?: number;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: Array<IReview>;
  courseData: Array<ICourseData>;
  ratings?: number;
  purchased?: number;
}

const ReviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});

const LinksSchema = new Schema<ILink>({
  title: String,
  url: String,
});

const CommentSchema = new Schema<IComment>({
  user: Object,
  question: String,
  questionReplies: [Object],
});

const CourseDataSchema = new Schema<ICourseData>({
  title: String,
  description: String,
  videoUrl: String,
  videoThumbnail: String,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [LinksSchema],
  suggestion: String,
  questions: [CommentSchema],
});

const CourseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
  },
  tags: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  reviews: [ReviewSchema],
  courseData: [CourseDataSchema],
  ratings: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
});

const CourseModel = model<ICourse>('Course', CourseSchema);

export default CourseModel;
