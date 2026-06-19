import { Router } from 'express';
import { CarController } from '../controllers/car.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { uploadImages } from '../middleware/upload.middleware';

const router = Router();

// Public Routes
router.get('/', CarController.getAllCars);
router.get('/:slug', CarController.getCar);

// Admin Routes
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/', uploadImages({ images: 10 }), CarController.createCar);
router.patch('/:id', uploadImages({ images: 10 }), CarController.updateCar);
router.delete('/:id', CarController.deleteCar);

export default router;
