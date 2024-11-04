import { fetchVatsimData } from '@/actions/vatsim';
import MapView from '@/components/map-view';
import { Suspense } from 'react';

export default async function Home() {

  return (
    <main className="h-screen">
      <Suspense fallback={<div>Loading map...</div>}>
        <MapView />
      </Suspense>
    </main>
  );
}
