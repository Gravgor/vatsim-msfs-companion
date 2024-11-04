import { useState, useEffect, useMemo } from 'react';
import { Coordinates, VatsimData } from '../types/vatsim';

export function useFlightTracking(vatsimData: VatsimData | null, callsign: string) {
  const flightData = useMemo(() => {
    if (!vatsimData) return null;
    return vatsimData.pilots.find(pilot => pilot.callsign === callsign);
  }, [vatsimData, callsign]);

  const [flightPath, setFlightPath] = useState<Array<Coordinates>>([]);

  useEffect(() => {
    if (flightData) {
      setFlightPath(prevPath => [
        ...prevPath,
        { lat: flightData.latitude, lng: flightData.longitude }
      ]);
    }
  }, [flightData]);

  return {
    currentFlight: flightData,
    flightPath,
    clearFlightPath: () => setFlightPath([])
  };
} 