# CIARA Game Explorer - Comprehensive Test Data

## Overview
This SQL migration file creates complete test data for the CIARA Game Explorer application with 4 diverse cities, each with comprehensive information including steps, journeys, partners, and rewards.

## Cities Created

### 1. Lyon, France 🇫🇷
- **Theme**: Cultural and gastronomic capital
- **Coordinates**: 45.7640, 4.8357
- **Colors**: Red (#DC2626) and Amber (#F59E0B)
- **Languages**: French, English
- **Specialty**: UNESCO heritage, traboules, gastronomy

### 2. Barcelona, Spain 🇪🇸
- **Theme**: Art and architecture (Gaudí)
- **Coordinates**: 41.3851, 2.1734
- **Colors**: Rose (#E11D48) and Sky Blue (#0EA5E9)
- **Languages**: Spanish, Catalan, English
- **Specialty**: Modernist architecture, Mediterranean culture

### 3. Prague, Czech Republic 🇨🇿
- **Theme**: Medieval charm and mystique
- **Coordinates**: 50.0755, 14.4378
- **Colors**: Purple (#7C3AED) and Amber (#F59E0B)
- **Languages**: Czech, English, German
- **Specialty**: Gothic architecture, beer culture, legends

### 4. Montreal, Canada 🇨🇦
- **Theme**: North American charm with European flair
- **Coordinates**: 45.5017, -73.5673
- **Colors**: Blue (#1E40AF) and Red (#DC2626)
- **Languages**: French, English
- **Specialty**: Bilingual culture, underground city, maple syrup

## Journey Categories (16 total)
Each city has 4 unique journey categories:
- **Cultural/Historical**: UNESCO sites, old towns, heritage
- **Gastronomic**: Local cuisine, markets, traditional restaurants
- **Adventure/Mystery**: Secret passages, legends, exploration
- **Modern/Artistic**: Contemporary culture, museums, art

## Steps/Points of Interest (40 total)
Each city has 10 carefully selected steps with:
- **Realistic GPS coordinates** and addresses
- **Detailed descriptions** with historical context
- **Appropriate point values** (15-40 points)
- **Validation radii** (50-200m based on location type)
- **High-quality images** from Unsplash
- **Quiz questions** for educational value

### Step Types Distribution:
- **Monuments**: Major landmarks and religious sites
- **Museums**: Cultural institutions and exhibitions
- **Restaurants**: Traditional cuisine and local specialties
- **Viewpoints**: Panoramic views and natural spaces
- **Landmarks**: Historic squares and iconic buildings
- **Activities**: Entertainment and cultural experiences
- **Shops**: Local markets and specialty stores

## Journeys (12 total)
Each city has 2-3 complete journeys with:
- **Logical step sequences** following geographic and thematic flow
- **Realistic durations** (120-240 minutes)
- **Calculated distances** (1.8-4.2 km)
- **Difficulty levels** (easy, medium)
- **Total points** automatically calculated

## Partners (16 total)
Each city has 4 local partners:
- **Restaurants**: Traditional and high-end establishments
- **Hotels**: Luxury accommodations with historical significance
- **Activities**: Cultural venues and entertainment
- **Shops**: Local markets and specialty retailers

## Rewards (16 total)
Each partner offers attractive rewards:
- **Discounts**: 15-30% off meals and experiences
- **Free items**: Complimentary drinks, souvenirs, access
- **Experiences**: Spa access, guided tours, tastings
- **Upgrades**: Hotel room upgrades, premium services

## Quiz Questions
- **Educational content** about history, architecture, culture
- **Multiple choice format** with 4 options
- **Detailed explanations** for correct answers
- **Appropriate difficulty** for tourist education
- **Bonus points** for quick answers

## Content Documents
- **Historical information** for each step
- **Practical information** (hours, prices, access)
- **Cultural context** and interesting facts
- **Multilingual support** where appropriate

## Data Quality Features
- **Realistic coordinates** based on actual locations
- **Appropriate validation radii** for different venue types
- **Logical journey flows** following tourist routes
- **Balanced point distribution** for fair gameplay
- **Diverse imagery** from high-quality sources
- **Comprehensive descriptions** for immersive experience

## Technical Implementation
- **Foreign key consistency** maintained throughout
- **Automatic point calculation** for journeys
- **Proper data types** and constraints
- **Optimized queries** with appropriate indexes
- **Error handling** for data insertion
- **Success reporting** with row counts

## Testing and Validation
The data provides comprehensive coverage for testing:
- **Multi-city scenarios** with different themes
- **Various journey types** and difficulties
- **Complete user flows** from discovery to reward redemption
- **International diversity** for global appeal
- **Cultural authenticity** with local specialties

This comprehensive test data set enables full application testing while providing an engaging and educational experience for users exploring these beautiful cities.