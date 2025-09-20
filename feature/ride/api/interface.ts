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
