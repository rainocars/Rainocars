import { Request, Response, NextFunction } from 'express';
import { CarService } from '../services/car.service';
import { catchAsync } from '../utils/catchAsync';

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
    const images = (req.files as any)?.['images']?.map((file: any) => file.path) || [];
    const carData = { ...req.body, images };

    const car = await CarService.createCar(carData);

    res.status(201).json({
      status: 'success',
      message: 'Car added successfully',
      data: { car }
    });
  });

  static updateCar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const images = (req.files as any)?.['images']?.map((file: any) => file.path) || [];
    const updateData = { ...req.body };
    if (images.length > 0) updateData.images = images;

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
