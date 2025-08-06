import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, Save, X, Upload, Link, Image, EyeOff, Archive } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import CountryFilters from '@/components/admin/CountryFilters';
import ArticlePreview from '@/components/admin/ArticlePreview';
import { useOptimizedTranslations } from '@/hooks/useOptimizedTranslations';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category: string;
  status: string;
  is_featured: boolean;
  published_at?: string;
  author_id?: string;
  city_id?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

interface Country {
  id: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  country_id: string;
}

export default function ArticleManagement() {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, isTenantAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    category: 'general',
    city_id: '',
    status: 'draft',
    is_featured: false,
    tags: [] as string[]
  });
  const [imageUploadType, setImageUploadType] = useState<'url' | 'upload'>('url');
  const { currentLanguage } = useOptimizedTranslations();

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCountries(data || []);
    } catch (err) {
      console.warn('Error fetching countries:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchCities();
    fetchCountries();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      // Si l'utilisateur est tenant_admin, filtrer par sa ville
      if (profile?.role === 'tenant_admin' && profile?.city_id) {
        query = query.or(`city_id.eq.${profile.city_id},city_id.is.null`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching articles:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les articles',
          variant: 'destructive',
        });
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      // Fetch cities with country information and filter out archived countries
      const { data, error } = await supabase
        .from('cities')
        .select(`
          id, 
          name, 
          country_id,
          countries!inner(id, is_active)
        `)
        .eq('is_archived', false)
        .eq('countries.is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching cities:', error);
        return;
      }

      // Filter cities based on user role
      let filteredCities = data || [];
      
      // For tenant admins, only show their city
      if (isTenantAdmin() && profile?.city_id) {
        filteredCities = filteredCities.filter(city => city.id === profile.city_id);
      }

      setCities(filteredCities);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Initialize filters for tenant admins
  useEffect(() => {
    if (isTenantAdmin() && profile?.city_id && cities.length > 0) {
      const userCity = cities.find(c => c.id === profile.city_id);
      if (userCity) {
        setSelectedCountry(userCity.country_id);
        setSelectedCity(userCity.id);
      }
    }
  }, [isTenantAdmin, profile?.city_id, cities]);

  // Filter articles based on selections
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());

    const articleCity = cities.find(c => c.id === article.city_id);
    const matchesCountry = selectedCountry === 'all' || 
      !article.city_id || // Articles without city should be visible to all
      (articleCity && articleCity.country_id === selectedCountry);
    
    const matchesCity = selectedCity === 'all' || 
      !article.city_id || // Articles without city should be visible to all
      article.city_id === selectedCity;

    return matchesSearch && matchesCountry && matchesCity;
  });

  const handleClearFilters = () => {
    if (!isTenantAdmin()) {
      setSelectedCountry('all');
      setSelectedCity('all');
    }
    setSearchTerm('');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const generateTags = (category: string, cityId: string) => {
    const tags = [category];
    
    if (cityId) {
      const city = cities.find(c => c.id === cityId);
      if (city) {
        tags.push(city.name);
      }
    }
    
    return tags;
  };

  // Function to clean UUID fields - convert empty strings to null
  const cleanUuidField = (value: string | undefined): string | null => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  };

  const handleSaveArticle = async () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        toast({
          title: 'Erreur',
          description: 'Le titre et le contenu sont obligatoires',
          variant: 'destructive',
        });
        return;
      }

      const slug = formData.slug || generateSlug(formData.title);
      const tags = generateTags(formData.category, formData.city_id);
      
      const articleData = {
        ...formData,
        slug,
        tags,
        city_id: cleanUuidField(formData.city_id),
        author_id: cleanUuidField(user?.id),
        created_by: cleanUuidField(user?.id),
        updated_by: cleanUuidField(user?.id),
        // The database trigger will handle published_at automatically
      };

      let result;
      if (selectedArticle) {
        // Update existing article
        result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', selectedArticle.id)
          .select()
          .single();
      } else {
        // Create new article
        result = await supabase
          .from('articles')
          .insert([articleData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving article:', result.error);
        toast({
          title: 'Erreur',
          description: result.error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Succès',
        description: selectedArticle ? 'Article mis à jour' : 'Article créé',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        console.error('Error deleting article:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer l\'article',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Succès',
        description: 'Article supprimé',
      });

      fetchArticles();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVisibility = async (article: Article, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: newStatus })
        .eq('id', article.id);

      if (error) {
        console.error('Error updating article visibility:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de modifier la visibilité',
          variant: 'destructive',
        });
        return;
      }

      const statusLabels = {
        published: 'publié',
        draft: 'masqué',
        archived: 'archivé'
      };

      toast({
        title: 'Succès',
        description: `Article ${statusLabels[newStatus as keyof typeof statusLabels]}`,
      });

      fetchArticles();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    const defaultCityId = profile?.role === 'tenant_admin' ? profile?.city_id || '' : '';
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image_url: '',
      category: 'general',
      city_id: defaultCityId,
      status: 'draft',
      is_featured: false,
      tags: []
    });
    setSelectedArticle(null);
    setImageUploadType('url');
  };

  const openEditDialog = (article: Article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || '',
      featured_image_url: article.featured_image_url || '',
      category: article.category,
      city_id: article.city_id || '',
      status: article.status,
      is_featured: article.is_featured,
      tags: article.tags || []
    });
    // Détecter le type d'image basé sur l'URL
    if (article.featured_image_url) {
      setImageUploadType(article.featured_image_url.includes('supabase.co/storage') ? 'upload' : 'url');
    } else {
      setImageUploadType('url');
    }
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Country and City Filters */}
      <CountryFilters
        countries={countries}
        cities={cities}
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        searchTerm={searchTerm}
        onCountryChange={isTenantAdmin() ? () => {} : setSelectedCountry}
        onCityChange={isTenantAdmin() ? () => {} : setSelectedCity}
        onSearchChange={setSearchTerm}
        onClearFilters={handleClearFilters}
        language={currentLanguage}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Articles</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedArticle ? 'Modifier l\'Article' : 'Créer un Nouvel Article'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: !selectedArticle ? generateSlug(title) : formData.slug
                      });
                    }}
                    placeholder="Titre de l'article"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="slug-de-l-article"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Général</SelectItem>
                      <SelectItem value="randonnee">Randonnée</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="decouverte">Découverte</SelectItem>
                      <SelectItem value="gastronomie">Gastronomie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  {profile?.role === 'super_admin' ? (
                    <Select value={formData.city_id || 'all'} onValueChange={(value) => setFormData({ ...formData, city_id: value === 'all' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les villes</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={cities.find(c => c.id === formData.city_id)?.name || 'Ville assignée'}
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile?.role === 'super_admin' 
                      ? "Sélectionnez la ville pour cet article"
                      : "Ville assignée à votre compte admin"
                    }
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Résumé</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Résumé de l'article"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenu * (Éditeur HTML)</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Écrivez votre contenu ici..."
                />
              </div>

              <div>
                <Label htmlFor="featured_image">Image mise en avant</Label>
                <div className="space-y-4">
                  {/* Choix du type d'image */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="image-url"
                        name="image-type"
                        value="url"
                        checked={imageUploadType === 'url'}
                        onChange={(e) => {
                          setImageUploadType('url');
                          setFormData({ ...formData, featured_image_url: '' });
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="image-url" className="flex items-center space-x-2 cursor-pointer">
                        <Link className="h-4 w-4" />
                        <span>URL d'image</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="image-upload"
                        name="image-type"
                        value="upload"
                        checked={imageUploadType === 'upload'}
                        onChange={(e) => {
                          setImageUploadType('upload');
                          setFormData({ ...formData, featured_image_url: '' });
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="image-upload" className="flex items-center space-x-2 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Upload sécurisé</span>
                      </Label>
                    </div>
                  </div>

                  {/* Input basé sur le type sélectionné */}
                  {imageUploadType === 'url' ? (
                    <Input
                      id="featured_image_url"
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                      placeholder="https://exemple.com/image.jpg"
                    />
                  ) : (
                    <ImageUpload
                      bucket="articles"
                      value={formData.featured_image_url}
                      onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
                      placeholder="Sélectionnez une image à uploader"
                      className="min-h-32"
                    />
                  )}

                  {/* Prévisualisation de l'image */}
                  {formData.featured_image_url && (
                    <div className="mt-4">
                      <Label className="text-sm text-muted-foreground">Aperçu :</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img
                          src={formData.featured_image_url}
                          alt="Aperçu"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Preview */}
              <div>
                <Label className="text-sm font-medium">Tags automatiques</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Les tags sont générés automatiquement à partir de la catégorie et de la ville sélectionnée
                </p>
                <div className="flex flex-wrap gap-2">
                  {generateTags(formData.category, formData.city_id).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Article mis en avant</Label>
                </div>

                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSaveArticle}>
                  <Save className="h-4 w-4 mr-2" />
                  {selectedArticle ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {article.title}
                    {article.is_featured && <Badge variant="default">Mis en avant</Badge>}
                    {getStatusBadge(article.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Slug: {article.slug} | Catégorie: {article.category}
                  </p>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => { setPreviewArticle(article); setIsPreviewOpen(true); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(article)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {article.status === 'published' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleVisibility(article, 'draft')}
                      title="Masquer l'article"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleVisibility(article, 'published')}
                      title="Publier l'article"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {article.excerpt && (
                <p className="text-sm text-muted-foreground mb-2">{article.excerpt}</p>
              )}
              <div className="text-xs text-muted-foreground">
                Créé le {new Date(article.created_at).toLocaleDateString('fr-FR')}
                {article.published_at && ` | Publié le ${new Date(article.published_at).toLocaleDateString('fr-FR')}`}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Aucun article trouvé.</p>
          </CardContent>
        </Card>
      )}

      <ArticlePreview
        article={previewArticle}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}