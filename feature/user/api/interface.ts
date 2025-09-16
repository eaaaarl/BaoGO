export interface AvailableDriver {
  id: string;
  is_available: boolean;
  last_location_update: Date;
  latitude: number;
  longitude: number;
  license_number: string;
  vehicle_type: string;
  vehicle_color: string;
  vehicle_year: string;
  profiles: {
    avatar_url: string;
    full_name: string;
  };
}

export interface RequestRidePayload {
  riderId: string;
  pickupLocation: string;
  destinationLocation: string;
  status: "Pending" | "Cancel" | "Complete";
}
