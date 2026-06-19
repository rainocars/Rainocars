import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
  static getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) throw new AppError('User not found', 404);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  static getAdminUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({ role: 'USER' }).select('-password');
    res.status(200).json({
      status: 'success',
      data: { users }
    });
  });

  static addUserDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { type, label, fileName, fileUrl } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) throw new AppError('User not found', 404);

    const document = {
      type,
      label,
      fileName,
      fileUrl,
      uploadedAt: new Date()
    };

    user.documents.push(document as any);
    await user.save();

    const addedDoc = user.documents[user.documents.length - 1] as any;

    res.status(201).json({
      status: 'success',
      message: 'Document added successfully',
      data: { document: { ...addedDoc.toObject(), id: addedDoc._id } }
    });
  });

  static removeUserDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, documentId } = req.params;
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.documents = user.documents.filter(doc => ((doc as any)._id as any).toString() !== documentId) as any;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Document removed successfully'
    });
  });

  static getAllUserDocuments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({ 'documents.0': { $exists: true } });
    const documents: any[] = [];
    
    for (const u of users) {
      for (const doc of u.documents) {
        documents.push({
          id: (doc as any)._id,
          userId: u._id,
          type: doc.type,
          label: doc.label,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt,
          userName: u.name,
          userEmail: u.email
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: { documents }
    });
  });
}
