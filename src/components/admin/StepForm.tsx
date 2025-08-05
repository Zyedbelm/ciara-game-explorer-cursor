import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { MapPin, Target, FileText, Camera } from 'lucide-react';

const stepSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  type: z.enum(['monument', 'restaurant', 'viewpoint', 'museum', 'shop', 'activity', 'landmark']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  points_awarded: z.number().min(1).max(100),
  validation_radius: z.number().min(10).max(1000),
  has_quiz: z.boolean(),
  images: z.array(z.string().url()).optional(),
  is_active: z.boolean(),
  city_id: z.string().min(1, 'La ville est obligatoire'),
  journey_id: z.string().optional(),
});

export type StepFormData = z.infer<typeof stepSchema>;

interface StepFormProps {
  onSubmit: (data: StepFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<StepFormData>;
  cities: Array<{ id: string; name: string }>;
  journeys: Array<{ id: string; name: string; city_id: string }>;
  loading?: boolean;
}

export const StepForm: React.FC<StepFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  cities,
  journeys,
  loading = false
}) => {
  const form = useForm<StepFormData>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'monument',
      latitude: 0,
      longitude: 0,
      address: '',
      points_awarded: 10,
      validation_radius: 50,
      has_quiz: false,
      images: [],
      is_active: true,
      city_id: '',
      journey_id: '',
      ...initialData,
    },
  });

  const watchCityId = form.watch('city_id');
  const filteredJourneys = journeys.filter(journey => journey.city_id === watchCityId);

  const getTypeLabel = (type: string) => {
    const labels = {
      monument: 'Monument',
      restaurant: 'Restaurant',
      viewpoint: 'Point de vue',
      museum: 'Musée',
      shop: 'Boutique',
      activity: 'Activité',
      landmark: 'Point d\'intérêt'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'étape</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de l'étape" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'étape</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(getTypeLabel('')).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description détaillée de l'étape"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="46.2338"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="7.3604"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validation_radius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rayon de validation (mètres)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="10"
                    max="1000"
                    placeholder="50"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Adresse complète" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="city_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="journey_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parcours (optionnel)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un parcours" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucun parcours</SelectItem>
                    {filteredJourneys.map((journey) => (
                      <SelectItem key={journey.id} value={journey.id}>
                        {journey.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="points_awarded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points attribués</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max="100"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_quiz"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Quiz associé</FormLabel>
                  <FormDescription>
                    Cette étape aura-t-elle un quiz ?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value || []}
                  onChange={field.onChange}
                  maxFiles={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Étape active</FormLabel>
                <FormDescription>
                  Cette étape est-elle visible pour les utilisateurs ?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 