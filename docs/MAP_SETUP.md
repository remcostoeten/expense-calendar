# Map and Distance Configuration

## Setup

The onboarding flow includes an interactive map with automatic distance calculation between home and office addresses.

### Distance Calculation Service

The app uses multiple fallback methods for distance calculation:

1. **OpenRouteService API** (Recommended for production)
   - Get a free API key from [OpenRouteService](https://openrouteservice.org/)
   - Add to your `.env.local`: `OPENROUTE_API_KEY=your_api_key_here`
   - Provides accurate driving routes and distances

2. **Fallback Method** (Default)
   - Uses straight-line distance calculation with a 30% adjustment for road routing
   - No API key required
   - Less accurate but functional for development

### Map Integration

- Uses **Leaflet** with OpenStreetMap tiles (free)
- Interactive map showing home and office locations
- Route visualization with dashed line
- Custom icons for home (🏠) and office (🏢)
- Auto-fits bounds to show both locations

### Features

- **Automatic Calculation**: Distance is calculated automatically 1 second after the user finishes entering both addresses
- **Manual Recalculation**: Users can manually trigger recalculation
- **Error Handling**: Graceful fallbacks and user-friendly error messages  
- **Visual Route**: Interactive map with route preview
- **Real-time Updates**: Map updates as addresses are entered

### Geocoding

Uses Nominatim (OpenStreetMap's geocoding service) for address-to-coordinates conversion:
- Free service, no API key required
- Focused on Netherlands addresses (`countrycodes=nl`)
- Includes proper rate limiting and user agent headers