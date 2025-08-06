import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/common/OptimizedImage';
import { StandardPageLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSimplifiedTranslations } from '@/hooks/useSimplifiedTranslations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GeographicalFilters from '@/components/common/GeographicalFilters';
import { getLocalizedTitle, getLocalizedExcerpt, getLocalizedContent, getMultilingualArticleSelect } from '@/utils/articleLocalization';

interface Article {
  id: string;
  title: string;
  title_en?: string;
  title_de?: string;
  slug: string;
  content: string;
  content_en?: string;
  content_de?: string;
  excerpt?: string;
  excerpt_en?: string;
  excerpt_de?: string;
  featured_image_url?: string;
  category: string;
  status: string;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  city_id?: string;
  author?: {
    full_name?: string;
  };
  cities?: {
    id: string;
    name: string;
    country_id: string;
  };
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

const BlogPage = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useSimplifiedTranslations();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchArticles(),
        fetchCountries(),
        fetchCities()
      ]);
    };
    
    loadData();
  }, []);

  // Reload articles when language changes
  useEffect(() => {
    if (currentLanguage) {
      // No need to refetch, just refilter the display
    }
  }, [currentLanguage]);

  // Sync selected category with language changes
  useEffect(() => {
    if (currentLanguage) {
      const localizedAllCategory = currentLanguage === 'en' ? 'All' : currentLanguage === 'de' ? 'Alle' : 'Tous';
      
      // If the current category is the "All" category in any language, update it to the localized version
      const allCategories = ['All', 'Alle', 'Tous'];
      if (allCategories.includes(selectedCategory)) {
        setSelectedCategory(localizedAllCategory);
      }
    }
  }, [currentLanguage, selectedCategory]);

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
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, country_id')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (err) {
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const selectQuery = getMultilingualArticleSelect();
      const { data, error } = await supabase
        .from('articles')
        .select(selectQuery)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les articles',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setArticles(data as any[]);
      } else {
        setArticles([]);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on search, category, and geography
  const filteredDbArticles = articles.filter(article => {
    if (!article) return false;
    
    const localizedTitle = getLocalizedTitle(article, currentLanguage);
    const localizedContent = getLocalizedContent(article, currentLanguage);
    
    const matchesSearch = !searchTerm || 
      localizedTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      localizedContent.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === (currentLanguage === 'en' ? 'All' : currentLanguage === 'de' ? 'Alle' : 'Tous') || 
      article.category === selectedCategory;

    const matchesCountry = selectedCountry === 'all' || 
      !article.cities || // Articles without city should be visible to all
      article.cities.country_id === selectedCountry;
    
    const matchesCity = selectedCity === 'all' || 
      !article.city_id || // Articles without city should be visible to all
      article.city_id === selectedCity;
    
    const matches = matchesSearch && matchesCategory && matchesCountry && matchesCity;
    
    if (!matches) {
      }
    
    return matches;
  });

  // Use only database articles - no fallback
  const displayArticles = filteredDbArticles;
  
  const categories = [
    currentLanguage === 'en' ? 'All' : currentLanguage === 'de' ? 'Alle' : 'Tous',
    'general',
    'randonnee', 
    'culture',
    'decouverte',
    'gastronomie'
  ];

  const handleClearFilters = () => {
    setSelectedCountry('all');
    setSelectedCity('all');
    setSearchTerm('');
    setSelectedCategory(currentLanguage === 'en' ? 'All' : currentLanguage === 'de' ? 'Alle' : 'Tous');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail.trim()) {
      toast({
        title: 'Erreur',
        description: currentLanguage === 'en' 
          ? 'Please enter your email address' 
          : currentLanguage === 'de' 
          ? 'Bitte geben Sie Ihre E-Mail-Adresse ein'
          : 'Veuillez saisir votre adresse email',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(newsletterEmail)) {
      toast({
        title: 'Erreur',
        description: currentLanguage === 'en' 
          ? 'Please enter a valid email address' 
          : currentLanguage === 'de' 
          ? 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
          : 'Veuillez saisir une adresse email valide',
        variant: 'destructive',
      });
      return;
    }

    try {
      setNewsletterLoading(true);
      const { error } = await supabase
        .from('email_newsletter')
        .insert({
          email: newsletterEmail.toLowerCase().trim(),
          language: currentLanguage,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Information',
            description: currentLanguage === 'en' 
              ? 'This email is already subscribed to our newsletter' 
              : currentLanguage === 'de' 
              ? 'Diese E-Mail ist bereits für unseren Newsletter angemeldet'
              : 'Cette adresse email est déjà inscrite à notre newsletter',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Succès !',
          description: currentLanguage === 'en' 
            ? 'Thank you for subscribing to our newsletter!' 
            : currentLanguage === 'de' 
            ? 'Vielen Dank für das Abonnieren unseres Newsletters!'
            : 'Merci pour votre inscription à notre newsletter !',
        });
        setNewsletterEmail('');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: currentLanguage === 'en' 
          ? 'An error occurred. Please try again.' 
          : currentLanguage === 'de' 
          ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
          : 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <StandardPageLayout 
      showBackButton={true} 
      title="Blog CIARA"
      containerClassName="py-16 max-w-6xl"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">
          {currentLanguage === 'en' ? 'CIARA Blog' : currentLanguage === 'de' ? 'CIARA Blog' : 'Blog CIARA'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {currentLanguage === 'en' 
            ? 'Discover inspiring stories, travel tips, and insights about gamified tourism and cultural exploration.' 
            : currentLanguage === 'de' 
            ? 'Entdecken Sie inspirierende Geschichten, Reisetipps und Einblicke über gamifizierten Tourismus und kulturelle Erkundung.'
            : 'Découvrez des histoires inspirantes, des conseils de voyage et des perspectives sur le tourisme gamifié et l\'exploration culturelle.'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6 mb-12">
        {/* Geographical Filters */}
        <GeographicalFilters
          countries={countries}
          cities={cities}
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          searchTerm={searchTerm}
          onCountryChange={setSelectedCountry}
          onCityChange={setSelectedCity}
          onSearchChange={setSearchTerm}
          onClearFilters={handleClearFilters}
          language={currentLanguage}
        />

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === selectedCategory ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {displayArticles.length > 0 && (
        <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="md:flex">
            <div className="md:w-1/2">
              <OptimizedImage
                src={displayArticles[0]?.featured_image_url || '/api/placeholder/600/400'}
                alt={displayArticles[0]?.title}
                className="h-64 md:h-full"
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{displayArticles[0]?.category}</Badge>
              {displayArticles[0]?.cities?.name && (
                <Badge variant="outline">{displayArticles[0].cities.name}</Badge>
              )}
              <Badge variant="outline">
                {currentLanguage === 'en' ? 'Featured' : currentLanguage === 'de' ? 'Vorgestellt' : 'À la une'}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
              {getLocalizedTitle(displayArticles[0], currentLanguage)}
            </h2>
            <p className="text-muted-foreground mb-6 line-clamp-3">
              {getLocalizedExcerpt(displayArticles[0], currentLanguage)}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {displayArticles[0]?.author?.full_name || 'CIARA'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(displayArticles[0]?.published_at || '').toLocaleDateString(
                    currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'en' ? 'en-US' : 'de-DE'
                  )}
                </div>
                <span>5 min</span>
              </div>
              <Button onClick={() => navigate(`/blog/${displayArticles[0]?.slug}`)}>
                {currentLanguage === 'en' ? 'Read More' : currentLanguage === 'de' ? 'Mehr lesen' : 'Lire la suite'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
             </div>
            </div>
          </div>
        </Card>
      )}

      {/* Blog Posts Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : displayArticles.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-3">
            {articles.length === 0 ? (
              currentLanguage === 'en' 
                ? 'No articles available' 
                : currentLanguage === 'de' 
                ? 'Keine Artikel verfügbar'
                : 'Aucun article disponible'
            ) : (
              currentLanguage === 'en' 
                ? 'No articles found' 
                : currentLanguage === 'de' 
                ? 'Keine Artikel gefunden'
                : 'Aucun article trouvé'
            )}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {articles.length === 0 ? (
              currentLanguage === 'en' 
                ? 'Articles are being prepared. Please check back later.' 
                : currentLanguage === 'de' 
                ? 'Artikel werden vorbereitet. Schauen Sie später noch einmal vorbei.'
                : 'Les articles sont en cours de préparation. Revenez plus tard.'
            ) : (
              currentLanguage === 'en' 
                ? 'Try adjusting your search terms or category filters to find the content you\'re looking for.' 
                : currentLanguage === 'de' 
                ? 'Versuchen Sie, Ihre Suchbegriffe oder Kategoriefilter anzupassen, um den gewünschten Inhalt zu finden.'
                : 'Essayez d\'ajuster vos termes de recherche ou les filtres de catégorie pour trouver le contenu que vous recherchez.'
            )}
          </p>
          {articles.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
            >
              {currentLanguage === 'en' ? 'Clear filters' : currentLanguage === 'de' ? 'Filter zurücksetzen' : 'Effacer les filtres'}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayArticles.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video">
                <OptimizedImage
                  src={post.featured_image_url || '/api/placeholder/600/400'}
                  alt={post.title}
                  className="h-full"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">{post.category}</Badge>
                    {post.cities?.name && (
                      <Badge variant="outline" className="text-xs">{post.cities.name}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">5 min</span>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  {getLocalizedTitle(post, currentLanguage)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
                  {getLocalizedExcerpt(post, currentLanguage)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author?.full_name || 'CIARA'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(post.published_at || '').toLocaleDateString(
                          currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'en' ? 'en-US' : 'de-DE'
                        )}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    {currentLanguage === 'en' ? 'Read' : currentLanguage === 'de' ? 'Lesen' : 'Lire'}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Newsletter Subscription */}
      <Card className="mt-16 bg-gradient-to-r from-primary to-secondary text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {currentLanguage === 'en' 
              ? 'Stay Updated with CIARA' 
              : currentLanguage === 'de' 
              ? 'Bleiben Sie mit CIARA auf dem Laufenden'
              : 'Restez informé avec CIARA'
            }
          </h3>
          <p className="mb-6 text-white/90">
            {currentLanguage === 'en' 
              ? 'Get the latest insights on gamified tourism, new destinations, and exclusive travel tips delivered to your inbox.' 
              : currentLanguage === 'de' 
              ? 'Erhalten Sie die neuesten Einblicke über gamifizierten Tourismus, neue Reiseziele und exklusive Reisetipps in Ihr Postfach.'
              : 'Recevez les dernières actualités sur le tourisme gamifié, les nouvelles destinations et des conseils de voyage exclusifs dans votre boîte mail.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={currentLanguage === 'en' ? 'Your email address' : currentLanguage === 'de' ? 'Ihre E-Mail-Adresse' : 'Votre adresse email'}
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
              disabled={newsletterLoading}
            />
            <Button 
              variant="secondary" 
              className="whitespace-nowrap"
              onClick={handleNewsletterSubmit}
              disabled={newsletterLoading}
            >
              {newsletterLoading ? '...' : (currentLanguage === 'en' ? 'Subscribe' : currentLanguage === 'de' ? 'Abonnieren' : 'S\'abonner')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

export default BlogPage;