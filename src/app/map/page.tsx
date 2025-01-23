import MapView from '@/components/map-view';
import { Suspense } from 'react';

export default async function Map() {

  return (
    <main className="h-screen">
      <Suspense fallback={<div>Loading map...</div>}>
        <MapView />
      </Suspense>
    </main>
  );
}
