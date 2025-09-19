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
}
