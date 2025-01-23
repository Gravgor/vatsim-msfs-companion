import { Plane } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="animate-spin text-blue-500">
          <Plane className="h-12 w-12" />
        </div>
        <p className="text-slate-400">Loading Flight Tracker...</p>
      </div>
    </div>
  )
} 