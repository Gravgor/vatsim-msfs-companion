export interface VatsimData {
  general: {
    version: number;
    reload: number;
    update: string;
    update_timestamp: string;
    connected_clients: number;
    unique_users: number;
  };
  pilots: Array<{
    cid: number;
    name: string;
    callsign: string;
    server: string;
    pilot_rating: number;
    latitude: number;
    longitude: number;
    altitude: number;
    groundspeed: number;
    transponder: string;
    heading: number;
    qnh_i_hg: number;
    qnh_mb: number;
    flight_plan?: {
      flight_rules: string;
      aircraft: string;
      departure: string;
      arrival: string;
      alternate: string;
      cruise_tas: string;
      altitude: string;
      deptime: string;
      enroute_time: string;
      fuel_time: string;
      remarks: string;
      route: string;
    };
  }>;
}

export interface Coordinates {
  lat: number;
  lng: number;
} 