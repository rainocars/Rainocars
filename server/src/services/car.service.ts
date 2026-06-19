import Car from '../models/Car';
import { AppError } from '../utils/AppError';

export class CarService {
  static async getAllCars(query: any) {
    const cars = await Car.find(query).sort({ createdAt: -1 });
    return cars;
  }

  static async getCarBySlug(slug: string) {
    const car = await Car.findOne({ slug });
    if (!car) {
      throw new AppError('Car not found', 404);
    }
    return car;
  }

  static async createCar(carData: any) {
    const existingCar = await Car.findOne({ slug: carData.slug });
    if (existingCar) {
      throw new AppError('A car with this slug already exists', 400);
    }
    return await Car.create(carData);
  }

  static async updateCar(id: string, updateData: any) {
    const car = await Car.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!car) {
      throw new AppError('Car not found', 404);
    }
    return car;
  }

  static async deleteCar(id: string) {
    const car = await Car.findByIdAndDelete(id);
    if (!car) {
      throw new AppError('Car not found', 404);
    }
    return car;
  }
}
