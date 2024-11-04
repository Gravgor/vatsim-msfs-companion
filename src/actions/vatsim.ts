'use server'

import { VatsimData } from '@/types/vatsim';

const VATSIM_API_URL = 'https://data.vatsim.net/v3/vatsim-data.json';

export async function fetchVatsimData(): Promise<VatsimData> {
  try {
    const response = await fetch(VATSIM_API_URL, {
      next: { revalidate: 15 }, // Revalidate every 15 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch VATSIM data');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching VATSIM data:', error);
    throw error;
  }
} 