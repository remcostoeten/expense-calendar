declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class AutocompleteService {
      getPlacePredictions(
        request: AutocompletionRequest,
        callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
      ): void;
    }

    class PlacesService {
      constructor(div: Element);
      getDetails(
        request: PlaceDetailsRequest,
        callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void
      ): void;
    }

    class DistanceMatrixService {
      getDistanceMatrix(
        request: DistanceMatrixRequest,
        callback: (response: DistanceMatrixResponse | null, status: DistanceMatrixStatus) => void
      ): void;
    }

    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
      ): void;
    }

    interface AutocompletionRequest {
      input: string;
      componentRestrictions?: ComponentRestrictions;
      types?: string[];
    }

    interface ComponentRestrictions {
      country?: string | string[];
    }

    interface AutocompletePrediction {
      description: string;
      place_id: string;
    }

    interface PlaceDetailsRequest {
      placeId: string;
      fields: string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      address_components?: AddressComponent[];
    }

    interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface DistanceMatrixRequest {
      origins: string[];
      destinations: string[];
      travelMode: TravelMode;
      unitSystem: UnitSystem;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
    }

    interface DistanceMatrixResponse {
      rows: DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
      elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: DistanceMatrixElementStatus;
      distance?: TextValuePair;
      duration?: TextValuePair;
    }

    interface TextValuePair {
      text: string;
      value: number;
    }

    interface GeocoderRequest {
      address: string;
    }

    interface GeocoderResult {
      geometry: GeocoderGeometry;
    }

    interface GeocoderGeometry {
      location: LatLng;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    enum PlacesServiceStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    enum DistanceMatrixStatus {
      OK = 'OK',
      INVALID_REQUEST = 'INVALID_REQUEST',
      MAX_ELEMENTS_EXCEEDED = 'MAX_ELEMENTS_EXCEEDED',
      MAX_DIMENSIONS_EXCEEDED = 'MAX_DIMENSIONS_EXCEEDED',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    enum DistanceMatrixElementStatus {
      OK = 'OK',
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS'
    }

    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum UnitSystem {
      METRIC = 'METRIC',
      IMPERIAL = 'IMPERIAL'
    }
  }
}

export {};