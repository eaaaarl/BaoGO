export interface CreateChatRoomPayload {
  driverId: string;
  riderId: string;
}

export interface SendMessagePayload {
  chatRoomId: string;
  senderId?: string;
  senderType: "driver" | "rider" | "system";
  message: string;
}

export interface ChatRoom {
  id: string;
  driver_id: string;
  rider_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  driver: Driver;
  latest_message: any[];
}

export interface Driver {
  id: string;
  profile: Profile;
  latitude: number;
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

export interface Profile {
  id: string;
  email: string;
  userRole: string;
  full_name: string;
  avatar_url: null;
  created_at: Date;
  phone_number: null;
}
