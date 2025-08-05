import React from 'react';
import { FileUpload } from './file-upload';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  bucket: string;
  className?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  className,
  placeholder = "Glissez une image ici ou cliquez pour sélectionner"
}: ImageUploadProps) {
  return (
    <FileUpload
      value={value}
      onChange={onChange}
      bucket={bucket}
      accept="image/*"
      maxSize={10}
      className={className}
      placeholder={placeholder}
    />
  );
}