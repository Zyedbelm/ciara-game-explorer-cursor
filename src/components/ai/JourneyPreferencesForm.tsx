
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface JourneyPreferences {
  duration: string;
  interests: string[];
  difficulty: string;
  groupSize: string;
  startLocation?: string;
}

interface JourneyPreferencesFormProps {
  preferences: JourneyPreferences;
  onPreferencesChange: (preferences: JourneyPreferences) => void;
}

const JourneyPreferencesForm: React.FC<JourneyPreferencesFormProps> = ({
  preferences,
  onPreferencesChange
}) => {
  const { t } = useLanguage();

  const interestOptions = [
    { key: 'history', label: t('history') },
    { key: 'culture', label: t('culture') },
    { key: 'nature', label: t('nature') },
    { key: 'gastronomy', label: t('gastronomy') },
    { key: 'architecture', label: t('architecture') },
    { key: 'art', label: t('art') },
    { key: 'shopping', label: t('shopping') },
    { key: 'nightlife', label: t('nightlife') }
  ];
  const toggleInterest = (interest: string) => {
    const newInterests = preferences.interests.includes(interest)
      ? preferences.interests.filter(i => i !== interest)
      : [...preferences.interests, interest];
    
    onPreferencesChange({
      ...preferences,
      interests: newInterests
    });
  };

  const updatePreference = (key: keyof JourneyPreferences, value: string) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">{t('desired_duration')} *</Label>
        <Select 
          value={preferences.duration} 
          onValueChange={(value) => updatePreference('duration', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('choose_duration')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">{t('1_hour')}</SelectItem>
            <SelectItem value="120">{t('2_hours')}</SelectItem>
            <SelectItem value="180">{t('3_hours')}</SelectItem>
            <SelectItem value="240">{t('4_hours')}</SelectItem>
            <SelectItem value="360">{t('full_day')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <Label>{t('interests')} *</Label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => (
            <Badge
              key={interest.key}
              variant={preferences.interests.includes(interest.key) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleInterest(interest.key)}
            >
              {interest.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label htmlFor="difficulty">{t('difficulty_level')} *</Label>
        <Select 
          value={preferences.difficulty} 
          onValueChange={(value) => updatePreference('difficulty', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('choose_difficulty')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">{t('easy_walk')}</SelectItem>
            <SelectItem value="medium">{t('moderate_walk')}</SelectItem>
            <SelectItem value="hard">{t('difficult_hike')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Group Size */}
      <div className="space-y-2">
        <Label htmlFor="groupSize">{t('group_size')}</Label>
        <Select 
          value={preferences.groupSize} 
          onValueChange={(value) => updatePreference('groupSize', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('optional')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solo">{t('solo')}</SelectItem>
            <SelectItem value="couple">{t('couple')}</SelectItem>
            <SelectItem value="family">{t('family')}</SelectItem>
            <SelectItem value="group">{t('group')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Location */}
      <div className="space-y-2">
        <Label htmlFor="startLocation">{t('start_location')}</Label>
        <Input
          id="startLocation"
          placeholder={t('start_location_placeholder')}
          value={preferences.startLocation || ''}
          onChange={(e) => updatePreference('startLocation', e.target.value)}
        />
      </div>
    </div>
  );
};

export default JourneyPreferencesForm;
