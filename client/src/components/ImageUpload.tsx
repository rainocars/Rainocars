import React, { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const MAX_SIZE_MB = 30;

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

const ImageUpload = ({ images, onChange, maxImages = 4, label = 'Car photos' }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    Array.from(files)
      .slice(0, remaining)
      .forEach(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB`);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onChange([...images, reader.result]);
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-off-white/60">
        <ImageIcon className="h-4 w-4 text-accent" /> {label}
        <span className="text-xs text-off-white/40">(shown to customers — max {maxImages}, {MAX_SIZE_MB}MB each)</span>
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-accent/20">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-full bg-primary/80 p-1 text-off-white hover:text-danger"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
              'border-accent/20 text-off-white/40 transition-colors hover:border-accent/50 hover:text-accent'
            )}
          >
            <Upload className="h-6 w-6" />
            <span className="text-xs">Upload</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default ImageUpload;
