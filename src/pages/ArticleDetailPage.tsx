import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Clock, Share2, Eye } from 'lucide-react';
import { StandardPageLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getLocalizedTitle, getLocalizedContent, getLocalizedExcerpt } from '@/utils/articleLocalization';
import { sanitizeHTML } from '@/utils/securityUtils';

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
  view_count: number;
  tags?: string[];
  author_id?: string;
  cities?: {
    id: string;
    name: string;
  };
}

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
      fetchRelatedArticles();
    }
  }, [slug, currentLanguage]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const selectQuery = `
        *,
        title,
        title_en,
        title_de,
        content,
        content_en,
        content_de,
        excerpt,
        excerpt_en,
        excerpt_de,
        cities (
          id,
          name
        )
      `;
      
      const { data, error } = await supabase
        .from('articles')
        .select(selectQuery)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // Article not found
          setArticle(null);
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de charger l\'article',
            variant: 'destructive',
          });
        }
        return;
      }

      setArticle(data);

      // Increment view count
      if (data) {
        await supabase
          .from('articles')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }

    } catch (error) {
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          title,
          title_en,
          title_de,
          excerpt,
          excerpt_en,
          excerpt_de
        `)
        .eq('status', 'published')
        .neq('slug', slug)
        .limit(3);

      if (!error && data) {
        setRelatedArticles(data as Article[]);
      }
    } catch (error) {
    }
  };


  const getLocalizedContentAsHTML = (article: Article) => {
    const content = getLocalizedContent(article, currentLanguage);
    // Le contenu est maintenant du HTML, on le retourne directement
    return content;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: currentLanguage === 'en' ? 'Link copied!' : currentLanguage === 'de' ? 'Link kopiert!' : 'Lien copié !',
        description: currentLanguage === 'en' ? 'Article link copied to clipboard' : currentLanguage === 'de' ? 'Artikel-Link in die Zwischenablage kopiert' : 'Lien de l\'article copié dans le presse-papiers',
      });
    }
  };

  if (loading) {
    return (
      <StandardPageLayout showBackButton={true} containerClassName="py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  if (!article) {
    return (
      <StandardPageLayout showBackButton={true} containerClassName="py-16">
        <div className="text-center">
          <div className="h-32 w-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <span className="text-4xl">📄</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {currentLanguage === 'en' ? 'Article Not Found' : currentLanguage === 'de' ? 'Artikel nicht gefunden' : 'Article introuvable'}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {currentLanguage === 'en' 
              ? 'The article you\'re looking for doesn\'t exist or has been removed.' 
              : currentLanguage === 'de' 
              ? 'Der Artikel, den Sie suchen, existiert nicht oder wurde entfernt.'
              : 'L\'article que vous cherchez n\'existe pas ou a été supprimé.'
            }
          </p>
          <div className="space-y-4">
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentLanguage === 'en' ? 'Back to Blog' : currentLanguage === 'de' ? 'Zurück zum Blog' : 'Retour au blog'}
            </Button>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout showBackButton={true} containerClassName="py-8">
      <article className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          className="mb-6 -ml-4"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentLanguage === 'en' ? 'Back to Blog' : currentLanguage === 'de' ? 'Zurück zum Blog' : 'Retour au blog'}
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            {article.cities?.name && (
              <Badge variant="outline">{article.cities.name}</Badge>
            )}
            {article.is_featured && (
              <Badge variant="outline">
                {currentLanguage === 'en' ? 'Featured' : currentLanguage === 'de' ? 'Vorgestellt' : 'À la une'}
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {getLocalizedTitle(article, currentLanguage)}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>CIARA Team</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(article.published_at || '').toLocaleDateString(
                  currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'en' ? 'en-US' : 'de-DE'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{article.view_count} vues</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              {currentLanguage === 'en' ? 'Share' : currentLanguage === 'de' ? 'Teilen' : 'Partager'}
            </Button>
            {article.tags && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="mb-8">
            <img
              src={article.featured_image_url}
              alt={getLocalizedTitle(article, currentLanguage)}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/800/400';
              }}
              loading="lazy"
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mt-8"
          style={{
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHTML(getLocalizedContentAsHTML(article), import.meta.env.VITE_SECURITY_DRY_RUN === 'true') 
          }}
        />
        
        <style>{`
          .prose h1 {
            font-size: 2em !important;
            font-weight: bold !important;
            margin: 0.5em 0 !important;
          }
          
          .prose h2 {
            font-size: 1.5em !important;
            font-weight: bold !important;
            margin: 0.4em 0 !important;
          }
          
          .prose h3 {
            font-size: 1.25em !important;
            font-weight: bold !important;
            margin: 0.3em 0 !important;
          }
          
          .prose ul, .prose ol {
            margin: 1em 0 !important;
            padding-left: 2em !important;
          }
          
          .prose blockquote {
            border-left: 4px solid hsl(var(--border)) !important;
            padding-left: 1em !important;
            margin: 1em 0 !important;
            font-style: italic !important;
            color: hsl(var(--muted-foreground)) !important;
          }
          
          .prose p {
            margin: 0.5em 0 !important;
          }
          
          .prose strong {
            font-weight: 600 !important;
            color: hsl(var(--foreground)) !important;
          }
          
          .prose a {
            color: hsl(var(--primary)) !important;
            text-decoration: underline !important;
          }
        `}</style>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h3 className="text-2xl font-bold mb-8">
              {currentLanguage === 'en' ? 'Related Articles' : currentLanguage === 'de' ? 'Ähnliche Artikel' : 'Articles connexes'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video">
                    <img
                      src={relatedArticle.featured_image_url || '/api/placeholder/400/200'}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {relatedArticle.category}
                    </Badge>
                    <h4 className="font-semibold line-clamp-2 mb-2">
                      {getLocalizedTitle(relatedArticle, currentLanguage)}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {getLocalizedExcerpt(relatedArticle, currentLanguage)}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/blog/${relatedArticle.slug}`)}
                    >
                      {currentLanguage === 'en' ? 'Read' : currentLanguage === 'de' ? 'Lesen' : 'Lire'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </article>
    </StandardPageLayout>
  );
};

export default ArticleDetailPage;