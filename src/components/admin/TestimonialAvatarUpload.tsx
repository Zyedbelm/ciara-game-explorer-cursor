import React from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface TestimonialAvatarUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  error?: string;
}

export const TestimonialAvatarUpload: React.FC<TestimonialAvatarUploadProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <FormItem>
      <FormControl>
        <ImageUpload
          value={value}
          onChange={onChange}
          bucket="testimonial-avatars"
          className="w-full"
          placeholder="Upload testimonial avatar"
        />
      </FormControl>
      <FormDescription>
        Upload an avatar image for the testimonial (JPG, PNG, WebP max 5MB)
      </FormDescription>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};