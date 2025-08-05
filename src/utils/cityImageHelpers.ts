import { supabase } from '@/integrations/supabase/client';

// Import city images
import sionHero from '@/assets/cities/sion-hero.jpg';
import genevaHero from '@/assets/cities/geneva-hero.jpg';
import lausanneHero from '@/assets/cities/lausanne-hero.jpg';
import montreuxHero from '@/assets/cities/montreux-hero.jpg';
import seteHero from '@/assets/cities/sete-hero.jpg';
import narbonneHero from '@/assets/cities/narbonne-hero.jpg';
import colliourHero from '@/assets/cities/collioure-hero.jpg';
import gruissanHero from '@/assets/cities/gruissan-hero.jpg';
import carcassonneHero from '@/assets/cities/carcassonne-hero.jpg';

// Fonction pour obtenir l'image d'une ville de manière unifiée
export function getCityImage(cityData: {
  hero_image_url?: string | null;
  name: string;
  slug?: string;
}): string {
  // 1. Priorité : Image uploadée dans la base de données (depuis l'espace admin)
  if (cityData.hero_image_url && cityData.hero_image_url.trim() !== '') {
    // Vérifier si c'est une URL Supabase Storage
    if (cityData.hero_image_url.includes('supabase.co')) {
      return cityData.hero_image_url;
    }
    // Si c'est une URL externe, l'utiliser directement
    if (cityData.hero_image_url.startsWith('http')) {
      return cityData.hero_image_url;
    }
    // Si c'est un chemin local incorrect (comme /src/assets/...), l'ignorer
    if (cityData.hero_image_url.startsWith('/src/') || cityData.hero_image_url.startsWith('src/')) {
      console.warn(`URL d'image incorrecte pour ${cityData.name}: ${cityData.hero_image_url}`);
    }
  }
  
  // 2. Fallback : Images par défaut basées sur le nom/slug de la ville
  const cityKey = (cityData.slug || cityData.name).toLowerCase();
  
  const cityImageMap: Record<string, string> = {
    // Villes suisses avec images générées
    'sion': sionHero,
    'lausanne': lausanneHero,
    'geneve': genevaHero,
    'geneva': genevaHero,
    'montreux': montreuxHero,
    'martigny': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    
    // Villes françaises avec images générées
    'sete': seteHero,
    'narbonne': narbonneHero,
    'collioure': colliourHero,
    'gruissan': gruissanHero,
    'carcassonne': carcassonneHero,
    
    // Autres villes suisses (à générer ultérieurement)
    'zurich': 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    'bern': 'https://images.unsplash.com/photo-1470813740244-df37b8c1ecdb?w=400&h=300&fit=crop',
    'berne': 'https://images.unsplash.com/photo-1470813740244-df37b8c1ecdb?w=400&h=300&fit=crop',
    'basel': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop',
    'bale': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop',
    'lucerne': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
    'luzern': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
    'lugano': 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400&h=300&fit=crop',
  };
  
  // 3. Image spécifique ou image générique par défaut
  return cityImageMap[cityKey] || getDefaultCityImage();
}

// Fonction pour obtenir une image par défaut pour les villes
export function getDefaultCityImage(): string {
  const defaultImages = [
    'https://images.unsplash.com/photo-1469474968028-56623f02e4269027?w=400&h=300&fit=crop', // Paysage urbain
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', // Architecture moderne
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&h=300&fit=crop', // Vue de ville
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Montagnes et ville
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop', // Centre-ville
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop', // Ville européenne
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', // Architecture classique
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bcff?w=400&h=300&fit=crop'  // Vue panoramique
  ];
  
  // Retourner une image aléatoire pour la variété
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

// Fonction pour obtenir une couleur de gradient basée sur l'index (pour maintenir la cohérence visuelle)
export function getCityGradient(index: number): string {
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-blue-700',
    'bg-gradient-to-br from-purple-500 to-purple-700', 
    'bg-gradient-to-br from-green-500 to-green-700',
    'bg-gradient-to-br from-orange-500 to-orange-700',
    'bg-gradient-to-br from-red-500 to-red-700',
    'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'bg-gradient-to-br from-pink-500 to-pink-700',
    'bg-gradient-to-br from-teal-500 to-teal-700',
  ];
  
  return gradients[index % gradients.length];
}