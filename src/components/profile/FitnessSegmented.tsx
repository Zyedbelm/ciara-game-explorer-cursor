import React from 'react';

interface FitnessSegmentedProps {
  value: number; // 1..5
  editable?: boolean;
  onChange?: (next: number) => void;
  className?: string;
}

const range = [1, 2, 3, 4, 5];

export const FitnessSegmented: React.FC<FitnessSegmentedProps> = ({
  value,
  editable = false,
  onChange,
  className,
}) => {
  const handleClick = (level: number) => {
    if (!editable || !onChange) return;
    // Si on reclique sur le dernier segment actif, on diminue d'un cran (toggle ergonomique)
    const next = level === value ? Math.max(1, value - 1) : level;
    onChange(next);
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center gap-1">
        {range.map((level) => {
          const active = level <= value;
          return (
            <button
              key={level}
              type="button"
              aria-label={`fitness-level-${level}`}
              onClick={() => handleClick(level)}
              disabled={!editable}
              className={`h-3 flex-1 rounded-sm transition-all duration-200
                ${active 
                  ? 'bg-accent border-accent shadow-sm' 
                  : 'bg-muted border-muted-foreground/20 hover:bg-muted/80'
                } 
                ${editable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                ${level === 1 ? 'rounded-l-md' : ''}
                ${level === 5 ? 'rounded-r-md' : ''}
              `}
            />
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Niveau {value}/5
      </div>
    </div>
  );
};

export default FitnessSegmented;


