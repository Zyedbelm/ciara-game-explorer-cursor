import React from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ClientLogoUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  error?: string;
}

export const ClientLogoUpload: React.FC<ClientLogoUploadProps> = ({
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
          bucket="client-logos"
          className="w-full"
          placeholder="Upload company logo"
        />
      </FormControl>
      <FormDescription>
        Upload a company logo (JPG, PNG, WebP, SVG max 5MB)
      </FormDescription>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};