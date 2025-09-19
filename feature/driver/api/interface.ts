export interface UpdateDriverProfilePayload {
  id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_plate_number: string;
  vehicle_year: string;
}

export interface DriverProfile {
  id: string;
  vehicle_type: string;
  license_number: string;
  vehicle_color: string;
  vehicle_model: string;
  vehicle_year: string;
}

export interface UpdateDriverLocationPayload {
  id: string;
  latitude: number;
  longitude: number;
  last_location_update: Date;
}

export interface Ride {
  rider_id: string;
  pickup: string;
  destination: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
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
