interface LocalizableArticle {
  title: string;
  title_en?: string;
  title_de?: string;
  content: string;
  content_en?: string;
  content_de?: string;
  excerpt?: string;
  excerpt_en?: string;
  excerpt_de?: string;
}

export const getLocalizedTitle = (article: LocalizableArticle, language: string): string => {
  if (!article) return '';
  
  if (language === 'en' && article.title_en?.trim()) return article.title_en.trim();
  if (language === 'de' && article.title_de?.trim()) return article.title_de.trim();
  return article.title?.trim() || '';
};

export const getLocalizedContent = (article: LocalizableArticle, language: string): string => {
  if (!article) return '';
  
  if (language === 'en' && article.content_en?.trim()) return article.content_en.trim();
  if (language === 'de' && article.content_de?.trim()) return article.content_de.trim();
  return article.content?.trim() || '';
};

export const getLocalizedExcerpt = (article: LocalizableArticle, language: string): string => {
  if (!article) return '';
  
  if (language === 'en' && article.excerpt_en?.trim()) return article.excerpt_en.trim();
  if (language === 'de' && article.excerpt_de?.trim()) return article.excerpt_de.trim();
  if (article.excerpt?.trim()) return article.excerpt.trim();
  
  // Fallback: extract first 150 characters from content
  const content = getLocalizedContent(article, language);
  if (content) {
    const plainText = content.replace(/<[^>]+>/g, '').replace(/[#*_\[\]]/g, '');
    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }
  
  return '';
};

// Build select query string for fetching multilingual articles
export const getMultilingualArticleSelect = (): string => {
  return `
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
      name,
      country_id
    )
  `;
};