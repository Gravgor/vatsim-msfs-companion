import React, { createContext, useContext } from 'react';
import { useVatsimData } from '../hooks/useVatsimData';
import { VatsimData } from '../types/vatsim';

interface VatsimContextType {
  data: VatsimData | null;
  loading: boolean;
  error: Error | null;
}

const VatsimContext = createContext<VatsimContextType | undefined>(undefined);

export function VatsimProvider({ children }: { children: React.ReactNode }) {
  const vatsimData = useVatsimData();

  return (
    <VatsimContext.Provider value={vatsimData}>
      {children}
    </VatsimContext.Provider>
  );
}

export function useVatsimContext() {
  const context = useContext(VatsimContext);
  if (context === undefined) {
    throw new Error('useVatsimContext must be used within a VatsimProvider');
  }
  return context;
} 