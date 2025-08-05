
import React from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface JourneyImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  error?: string;
}

export const JourneyImageUpload: React.FC<JourneyImageUploadProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <FormItem>
      <FormLabel>Image du parcours</FormLabel>
      <FormControl>
        <ImageUpload
          value={value}
          onChange={onChange}
          bucket="journey-images"
          className="w-full"
          placeholder="Glissez une image ici ou cliquez pour sélectionner"
        />
      </FormControl>
      <FormDescription>
        Ajoutez une image représentative de votre parcours (JPG, PNG max 10MB)
      </FormDescription>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};
