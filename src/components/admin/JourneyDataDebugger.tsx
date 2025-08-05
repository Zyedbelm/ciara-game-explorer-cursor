import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJourneyDataSync } from '@/hooks/useJourneyDataSync';
import { useAuth } from '@/hooks/useAuth';

/**
 * Debug component for testing journey data synchronization
 * Only for development and admin use
 */
export function JourneyDataDebugger() {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { syncing, repairJourneyData, diagnoseJourneyData } = useJourneyDataSync();
  const [testUserId, setTestUserId] = useState(user?.id || '');
  const [testJourneyId, setTestJourneyId] = useState('');

  const handleRepair = async () => {
    if (!testUserId || !testJourneyId) {
      alert('Veuillez saisir un User ID et Journey ID');
      return;
    }
    
    await repairJourneyData(testUserId, testJourneyId);
  };

  const handleDiagnose = async () => {
    if (!testUserId || !testJourneyId) {
      alert('Veuillez saisir un User ID et Journey ID');
      return;
    }
    
    await diagnoseJourneyData(testUserId, testJourneyId);
  };

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔧 Journey Data Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">User ID:</label>
          <Input
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            placeholder="UUID du utilisateur..."
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Journey ID:</label>
          <Input
            value={testJourneyId}
            onChange={(e) => setTestJourneyId(e.target.value)}
            placeholder="UUID du parcours..."
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleDiagnose}
            variant="outline"
            disabled={syncing}
            className="flex-1"
          >
            🔍 Diagnostiquer
          </Button>
          
          <Button
            onClick={handleRepair}
            disabled={syncing}
            className="flex-1"
          >
            {syncing ? '⏳ Réparation...' : '🔧 Réparer'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Diagnostic:</strong> Vérifie les inconsistances</p>
          <p><strong>Réparation:</strong> Corrige les données automatiquement</p>
        </div>
      </CardContent>
    </Card>
  );
}