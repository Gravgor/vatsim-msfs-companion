'use client'

import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useSettingsStore } from '@/store/settings'
import { Switch } from './ui/switch'

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full bg-black/80 hover:bg-black/60 backdrop-blur-md border border-slate-800 z-10"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="h-5 w-5 text-blue-400" />
      </Button>

      {isOpen && <SettingsPanel onClose={() => setIsOpen(false)} />}
    </>
  )
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { 
    userCallsign, 
    userCid, 
    mapSettings,
    setUserCallsign, 
    setUserCid,
    updateMapSettings 
  } = useSettingsStore()

  const [tempCallsign, setTempCallsign] = useState(userCallsign)
  const [tempCid, setTempCid] = useState(userCid)

  const handleSave = () => {
    setUserCallsign(tempCallsign)
    setUserCid(tempCid)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-96 bg-black/80 border-slate-800 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-bold text-white">Settings</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-800"
          >
            <X size={16} className="text-slate-400" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-400" htmlFor="callsign">Your Callsign</Label>
            <Input
              id="callsign"
              value={tempCallsign}
              onChange={(e) => setTempCallsign(e.target.value)}
              placeholder="e.g., BAW123"
              className="bg-slate-900/50 border-slate-800 text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-400" htmlFor="cid">VATSIM CID</Label>
            <Input
              id="cid"
              value={tempCid}
              onChange={(e) => setTempCid(e.target.value)}
              placeholder="e.g., 1234567"
              className="bg-slate-900/50 border-slate-800"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-400">Map Settings</Label>
            <div className="space-y-2">
              {Object.entries(mapSettings)
                .filter(([key]) => typeof mapSettings[key as keyof typeof mapSettings] === 'boolean')
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <Label htmlFor={key} className="capitalize text-sm">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={key}
                      checked={value as boolean}
                      onCheckedChange={(checked) =>
                        updateMapSettings({ [key]: checked })
                      }
                    />
                  </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-400">Map Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {['dark', 'light', 'satellite'].map((style) => (
                <Button
                  key={style}
                  variant="outline"
                  size="sm"
                  className={`
                    capitalize
                    ${mapSettings.mapStyle === style 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                      : 'bg-slate-900/50 border-slate-800'}
                  `}
                  onClick={() => updateMapSettings({ 
                    mapStyle: style as typeof mapSettings.mapStyle 
                  })}
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-6"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 