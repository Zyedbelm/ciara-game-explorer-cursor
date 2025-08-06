import { useState } from 'react';
import { journeyDataSynchronizer } from '@/services/journeyDataSynchronizer';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  success: boolean;
  stepsProcessed: number;
  inconsistenciesFixed: number;
  errors: string[];
}

/**
 * Hook for manually triggering journey data synchronization
 * Useful for debugging and fixing data inconsistencies
 */
export function useJourneyDataSync() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const repairJourneyData = async (userId: string, journeyId: string): Promise<SyncResult> => {
    setSyncing(true);
    
    try {
      const result = await journeyDataSynchronizer.manualRepair(userId, journeyId);
      
      if (result.success) {
        toast({
          title: "✅ Données synchronisées",
          description: `${result.stepsProcessed} étapes traitées, ${result.inconsistenciesFixed} inconsistances corrigées`,
        });
        } else {
        toast({
          title: "❌ Erreur de synchronisation",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        title: "❌ Erreur de synchronisation",
        description: errorMsg,
        variant: "destructive",
      });
      
      return {
        success: false,
        stepsProcessed: 0,
        inconsistenciesFixed: 0,
        errors: [errorMsg]
      };
    } finally {
      setSyncing(false);
    }
  };

  const diagnoseJourneyData = async (userId: string, journeyId: string) => {
    try {
      const diagnostics = await journeyDataSynchronizer.diagnoseInconsistencies(userId, journeyId);
      
      if (diagnostics.totalInconsistencies > 0) {
        toast({
          title: "⚠️ Inconsistances détectées",
          description: `${diagnostics.totalInconsistencies} inconsistances trouvées`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Données cohérentes",
          description: "Aucune inconsistance détectée",
        });
      }
      
      return diagnostics;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        title: "❌ Erreur de diagnostic",
        description: errorMsg,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    syncing,
    repairJourneyData,
    diagnoseJourneyData
  };
}