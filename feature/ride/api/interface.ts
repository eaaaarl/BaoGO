export interface CreateRidePayload {
  driver_id: string;
  rider_id: string;
  chat_room_id: string;
  pickup_location: string;
  destination_location: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  status: "pending" | "accepted" | "started" | "completed" | "cancelled";
  accepted_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  notes?: string;
}

export interface StartRidePayload {
  driver_id: string;
  chat_room_id: string;
  status: "pending" | "accepted" | "started" | "completed" | "cancelled";
  started_at: Date;
}

export interface CompleteRidePayload {
  driver_id: string;
  chat_room_id: string;
  status: "pending" | "accepted" | "started" | "completed" | "cancelled";
  completed_at: Date;
}

export interface CancelRidePayload {
  driver_id: string;
  chat_room_id: string;
  status: "pending" | "accepted" | "started" | "completed" | "cancelled";
  cancelled_at: Date;
}

// Recents Response

export interface Ride {
  id: string;
  driver_id: string;
  rider_id: string;
  chat_room_id: string;
  pickup_location: string;
  destination_location: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  status: string;
  requested_at: Date;
  accepted_at: Date;
  started_at: Date;
  completed_at: Date;
  cancelled_at: Date;
  notes: null;
  created_at: Date;
  updated_at: Date;
  driver: Driver;
  rider: Profiles;
}

export interface Driver {
  id: string;
  latitude: number;
  profiles: Profiles;
  longitude: number;
  created_at: Date;
  total_rides: number;
  is_available: boolean;
  vehicle_type: string;
  vehicle_year: number;
  vehicle_color: string;
  license_number: string;
  last_location_update: null;
}

export interface Profiles {
  id: string;
  email: string;
  userRole: string;
  full_name: string;
  avatar_url: null;
  created_at: Date;
  phone_number: null;
}
