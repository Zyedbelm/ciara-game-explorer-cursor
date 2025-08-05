import React, { createContext, useContext, useState, useCallback } from 'react';

interface JourneyCardsContextType {
  expandedCards: Set<string>;
  expandAllCards: (cardIds: string[]) => void;
  collapseAllCards: () => void;
  toggleCard: (cardId: string) => void;
  setCardExpanded: (cardId: string, expanded: boolean) => void;
}

const JourneyCardsContext = createContext<JourneyCardsContextType | undefined>(undefined);

export const useJourneyCards = () => {
  const context = useContext(JourneyCardsContext);
  if (!context) {
    throw new Error('useJourneyCards must be used within a JourneyCardsProvider');
  }
  return context;
};

interface JourneyCardsProviderProps {
  children: React.ReactNode;
}

export const JourneyCardsProvider: React.FC<JourneyCardsProviderProps> = ({ children }) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const expandAllCards = useCallback((cardIds: string[]) => {
    setExpandedCards(new Set(cardIds));
  }, []);

  const collapseAllCards = useCallback(() => {
    setExpandedCards(new Set());
  }, []);

  const toggleCard = useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const setCardExpanded = useCallback((cardId: string, expanded: boolean) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      return newSet;
    });
  }, []);

  const value: JourneyCardsContextType = {
    expandedCards,
    expandAllCards,
    collapseAllCards,
    toggleCard,
    setCardExpanded,
  };

  return (
    <JourneyCardsContext.Provider value={value}>
      {children}
    </JourneyCardsContext.Provider>
  );
}; 