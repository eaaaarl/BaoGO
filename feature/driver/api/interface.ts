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