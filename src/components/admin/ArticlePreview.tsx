import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Article {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category: string;
  status: string;
  is_featured: boolean;
  published_at?: string;
  created_at?: string;
  tags?: string[];
}

interface ArticlePreviewProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticlePreview({ article, isOpen, onClose }: ArticlePreviewProps) {
  const { currentLanguage } = useLanguage();

  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {currentLanguage === 'en' ? 'Article Preview' : currentLanguage === 'de' ? 'Artikel-Vorschau' : 'Aperçu de l\'article'}
          </DialogTitle>
        </DialogHeader>
        
        <article className="space-y-6">
          {/* Article Header */}
          <header>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              {article.is_featured && (
                <Badge variant="outline">
                  {currentLanguage === 'en' ? 'Featured' : currentLanguage === 'de' ? 'Vorgestellt' : 'À la une'}
                </Badge>
              )}
              <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                {article.status}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>CIARA Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {article.published_at 
                    ? new Date(article.published_at).toLocaleDateString(
                        currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'en' ? 'en-US' : 'de-DE'
                      )
                    : 'Non publié'
                  }
                </span>
              </div>
            </div>

            {article.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="mb-6">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/800/400';
                }}
              />
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-lg italic">{article.excerpt}</p>
            </div>
          )}

          {/* Article Content */}
import { sanitizeHTML } from '@/utils/securityUtils';

// ... existing code ...

          <div 
            className="prose prose-lg prose-gray dark:prose-invert max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-4
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:text-muted-foreground prose-ol:text-muted-foreground
              prose-li:mb-2 prose-blockquote:border-l-primary"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHTML(article.content, import.meta.env.VITE_SECURITY_DRY_RUN === 'true') 
            }}
          />
        </article>
      </DialogContent>
    </Dialog>
  );
}