export interface FlightData {
  flight_number?: string;
  origin?: string;
  destination?: string;
  frequency?: string;
  days?: string;
  departure_time?: string;
  arrival_time?: string;
  effective_date?: string | null;
  discontinued_date?: string | null;
  suspension_start?: string | null;
  suspension_end?: string | null;
  notes?: string | null;
}
