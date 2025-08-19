import React, { useRef, useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Save,
  RotateCcw
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Commencez à écrire votre article...',
  className = ''
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fonction pour insérer du texte à la position du curseur
  const insertText = useCallback((text: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newText = textarea.value.substring(0, start) + text + textarea.value.substring(end);
      onChange(newText);
      
      // Restaurer le focus et la position du curseur
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  }, [onChange]);

  // Fonctions pour les boutons de formatage
  const formatBold = useCallback(() => insertText('**texte en gras**'), [insertText]);
  const formatItalic = useCallback(() => insertText('*texte en italique*'), [insertText]);
  const formatUnderline = useCallback(() => insertText('__texte souligné__'), [insertText]);
  const formatH1 = useCallback(() => insertText('# Titre 1\n'), [insertText]);
  const formatH2 = useCallback(() => insertText('## Titre 2\n'), [insertText]);
  const formatH3 = useCallback(() => insertText('### Titre 3\n'), [insertText]);
  const formatList = useCallback(() => insertText('- Élément de liste\n'), [insertText]);
  const formatNumberedList = useCallback(() => insertText('1. Élément numéroté\n'), [insertText]);
  const formatQuote = useCallback(() => insertText('> Citation\n'), [insertText]);
  const formatLink = useCallback(() => {
    const url = prompt('Entrez l\'URL:');
    const text = prompt('Entrez le texte du lien:');
    if (url && text) {
      insertText(`[${text}](${url})`);
    }
  }, [insertText]);

  // Fonction pour réinitialiser
  const resetEditor = useCallback(() => {
    onChange('');
  }, [onChange]);

  // Fonction pour basculer entre mode édition et prévisualisation
  const togglePreview = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
  }, [isPreviewMode]);

  // Fonction simple pour convertir le markdown en HTML basique
  const convertToHTML = useCallback((text: string): string => {
    if (!text) return '';
    
    return text
      // Titres
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Formatage
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      // Liens
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Citations
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Listes
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
      // Paragraphes (simplement entourer le texte de <p>)
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        if (paragraph.startsWith('<h') || paragraph.startsWith('<blockquote>') || paragraph.startsWith('<li>')) {
          return paragraph;
        }
        return `<p>${paragraph}</p>`;
      })
      .join('\n');
  }, []);

  const toolbarButtons = useMemo(() => [
    { command: 'bold', icon: Bold, title: 'Gras', action: formatBold },
    { command: 'italic', icon: Italic, title: 'Italique', action: formatItalic },
    { command: 'underline', icon: Underline, title: 'Souligné', action: formatUnderline },
    { command: 'separator' },
    { command: 'h1', icon: Heading1, title: 'Titre 1', action: formatH1 },
    { command: 'h2', icon: Heading2, title: 'Titre 2', action: formatH2 },
    { command: 'h3', icon: Heading3, title: 'Titre 3', action: formatH3 },
    { command: 'separator' },
    { command: 'list', icon: List, title: 'Liste à puces', action: formatList },
    { command: 'numberedList', icon: ListOrdered, title: 'Liste numérotée', action: formatNumberedList },
    { command: 'quote', icon: Quote, title: 'Citation', action: formatQuote },
    { command: 'separator' },
    { command: 'link', icon: Link2, title: 'Lien', action: formatLink },
    { command: 'separator' },
    { command: 'reset', icon: RotateCcw, title: 'Réinitialiser', action: resetEditor },
  ], [formatBold, formatItalic, formatUnderline, formatH1, formatH2, formatH3, formatList, formatNumberedList, formatQuote, formatLink, resetEditor]);

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        {toolbarButtons.map((button, index) => {
          if (button.command === 'separator') {
            return <div key={index} className="w-px h-6 bg-border mx-1" />;
          }

          const Icon = button.icon!;
          
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title={button.title}
              onClick={button.action}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant={isPreviewMode ? "default" : "outline"}
          size="sm"
          onClick={togglePreview}
          className="ml-auto"
        >
          {isPreviewMode ? 'Éditer' : 'Prévisualiser'}
        </Button>
      </div>

      {/* Zone d'édition */}
      {!isPreviewMode ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] p-4 border-0 resize-none focus:ring-0"
          style={{
            direction: 'ltr',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        />
      ) : (
        <div 
          className="min-h-[400px] p-4 prose prose-sm max-w-none"
          style={{
            direction: 'ltr',
            textAlign: 'left'
          }}
          dangerouslySetInnerHTML={{
            __html: convertToHTML(value)
          }}
        />
      )}

      {/* Aide pour le formatage */}
      {!isPreviewMode && (
        <div className="p-2 bg-muted/30 text-xs text-muted-foreground border-t">
          <strong>Aide formatage :</strong> # Titre | **Gras** | *Italique* | __Souligné__ | - Liste | &gt; Citation | [Lien](URL)
        </div>
      )}
    </div>
  );
};