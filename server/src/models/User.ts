import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'USER' | 'ADMIN';
  profilePhoto?: string;
  isVerified: boolean;
  documents: {
    type: 'DRIVING_LICENSE' | 'GOVERNMENT_ID' | 'ADDRESS_PROOF' | 'OTHER';
    label: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  profilePhoto: { type: String },
  isVerified: { type: Boolean, default: false },
  documents: [{
    type: {
      type: String,
      enum: ['DRIVING_LICENSE', 'GOVERNMENT_ID', 'ADDRESS_PROOF', 'OTHER'],
      required: true
    },
    label: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
