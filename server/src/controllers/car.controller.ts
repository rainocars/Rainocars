import { Request, Response, NextFunction } from 'express';
import { CarService } from '../services/car.service';
import { catchAsync } from '../utils/catchAsync';
import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/AppError';

// Function to upload a single base64 image or a URL to Cloudinary
async function uploadToCloudinary(imageStr: string): Promise<string> {
  if (!imageStr.startsWith('data:image/')) {
    // If it's already a URL, return it as is
    return imageStr;
  }
  
  try {
    const uploadRes = await cloudinary.uploader.upload(imageStr, {
      folder: 'raino-cars',
    });
    return uploadRes.secure_url;
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    throw new AppError('Failed to upload car image to Cloudinary', 500);
  }
}

export class CarController {
  static getAllCars = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cars = await CarService.getAllCars(req.query);

    res.status(200).json({
      status: 'success',
      results: cars.length,
      data: { cars }
    });
  });

  static getCar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const car = await CarService.getCarBySlug(req.params.slug);

    res.status(200).json({
      status: 'success',
      data: { car }
    });
  });

  static createCar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let images: string[] = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      images = await Promise.all(req.body.images.map((img: string) => uploadToCloudinary(img)));
    } else if ((req.files as any)?.['images']) {
      images = (req.files as any)['images'].map((file: any) => file.path);
    }

    const name = req.body.name;
    let slug = req.body.slug;
    if (!slug && name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const pricePerDay = Number(req.body.pricePerDay);
    const weeklyDiscount = req.body.weeklyDiscount ? Number(req.body.weeklyDiscount) : Math.round(pricePerDay * 0.9);
    const monthlyDiscount = req.body.monthlyDiscount ? Number(req.body.monthlyDiscount) : Math.round(pricePerDay * 0.8);

    const carData = {
      ...req.body,
      images,
      slug,
      weeklyDiscount,
      monthlyDiscount
    };

    const car = await CarService.createCar(carData);

    res.status(201).json({
      status: 'success',
      message: 'Car added successfully',
      data: { car }
    });
  });

  static updateCar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let images: string[] = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      images = await Promise.all(req.body.images.map((img: string) => uploadToCloudinary(img)));
    } else if ((req.files as any)?.['images']) {
      images = (req.files as any)['images'].map((file: any) => file.path);
    }

    const updateData = { ...req.body };
    if (images.length > 0) {
      updateData.images = images;
    } else if (req.body.images) {
      updateData.images = [];
    }

    if (req.body.pricePerDay) {
      const pricePerDay = Number(req.body.pricePerDay);
      if (!req.body.weeklyDiscount) {
        updateData.weeklyDiscount = Math.round(pricePerDay * 0.9);
      }
      if (!req.body.monthlyDiscount) {
        updateData.monthlyDiscount = Math.round(pricePerDay * 0.8);
      }
    }

    if (req.body.name && !req.body.slug) {
      updateData.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const car = await CarService.updateCar(req.params.id, updateData);

    res.status(200).json({
      status: 'success',
      message: 'Car updated successfully',
      data: { car }
    });
  });

  static deleteCar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await CarService.deleteCar(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Car deleted successfully'
    });
  });
}
