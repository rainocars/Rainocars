import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'raino-cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  } as any,
});

export const upload = multer({ storage });

export const uploadImages = (fields: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        return next(new AppError('Image upload failed. Please upload valid images.', 400));
      }
      next();
    });
  };
};
