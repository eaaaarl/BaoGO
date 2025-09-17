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
  driverId: string;
  pickupLocation: string;
  destinationLocation: string;
  status: "Pending" | "Cancel" | "Complete";
}

export interface Ride {
  rider_id: string;
  pickup: string;
  destination: string;
  created_at: string;
  id: string;
  status: string;
  driver_id: string;
  driver: Driver;
}

export interface Driver {
  id: string;
  profile: Profile;
  latitude: number;
  longitude: number;
  created_at: string;
  total_rides: number;
  is_available: boolean;
  vehicle_type: string;
  vehicle_year: number;
  vehicle_color: string;
  license_number: string;
  last_location_update: string | null;
}

export interface Profile {
  id: string;
  email: string;
  userRole: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  phone_number: string | null;
}

export interface updateRequestRidePayload {
  request_id: string;
  status: "Pending" | "Cancel" | "Complete";
  driverId?: string;
}
