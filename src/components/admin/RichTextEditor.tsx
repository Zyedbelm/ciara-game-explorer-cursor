import React, { useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link2, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight
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
  placeholder = "Commencez à écrire...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      executeCommand('createLink', url);
    }
  }, [executeCommand]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const toolbarButtons = useMemo(() => [
    { command: 'bold', icon: Bold, title: 'Gras (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: 'Italique (Ctrl+I)' },
    { command: 'underline', icon: Underline, title: 'Souligné (Ctrl+U)' },
    { command: 'separator' },
    { command: 'formatBlock', value: '<h1>', icon: Heading1, title: 'Titre 1' },
    { command: 'formatBlock', value: '<h2>', icon: Heading2, title: 'Titre 2' },
    { command: 'formatBlock', value: '<h3>', icon: Heading3, title: 'Titre 3' },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: List, title: 'Liste à puces' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Liste numérotée' },
    { command: 'formatBlock', value: '<blockquote>', icon: Quote, title: 'Citation' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: AlignLeft, title: 'Aligner à gauche' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Centrer' },
    { command: 'justifyRight', icon: AlignRight, title: 'Aligner à droite' },
    { command: 'separator' },
    { command: 'createLink', icon: Link2, title: 'Insérer un lien', custom: insertLink },
  ], [insertLink]);

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
              onClick={() => {
                if (button.custom) {
                  button.custom();
                } else {
                  executeCommand(button.command, button.value);
                }
              }}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-4 focus:outline-none"
        style={{ 
          minHeight: '400px',
          lineHeight: '1.6',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'embed'
        }}
        dir="ltr"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.4em 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.3em 0;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        [contenteditable] p {
          margin: 0.5em 0;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};