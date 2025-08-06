import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Custom hook to handle automatic cleanup of old audio messages
export const useAudioCleanup = () => {
  useEffect(() => {
    const cleanupOldAudioMessages = async () => {
      try {
        // Delete audio messages older than 14 days
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .lt('created_at', fourteenDaysAgo.toISOString())
          .not('audio_url', 'is', null);

        if (error) {
        } else {
          }
      } catch (error) {
      }
    };

    // Run cleanup on mount and then every 24 hours
    cleanupOldAudioMessages();
    
    const interval = setInterval(cleanupOldAudioMessages, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
};