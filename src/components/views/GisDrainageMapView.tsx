/**
 * Jal-Nikaas: Dedicated GIS & Drainage Map Central Operational View
 * Combines full vector drainage network map with the deep Area-Specific Information Panel
 */

import React from 'react';
import {
  LocationData,
  AgriculturalArea,
  HistoricalIncident,
  HistoricalEvent,
  AreaRecommendation,
  Language,
} from '../../types';
import { DrainageMap } from '../gis/DrainageMap';
import { AreaDetailPanel } from '../gis/AreaDetailPanel';
import { Map, Layers, Compass, CheckCircle2, RotateCcw } from 'lucide-react';

interface GisDrainageMapViewProps {
  locations: LocationData[];
  areas: AgriculturalArea[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  incidents: HistoricalIncident[];
  events: HistoricalEvent[];
  recommendations: AreaRecommendation[];
  language: Language;
  onNavigateToMonitoring: (id: string) => void;
  onNavigateToAlerts: (id: string) => void;
  onToggleBeacon?: (locationId: string) => void;
}

export const GisDrainageMapView: React.FC<GisDrainageMapViewProps> = ({
  locations,
  areas,
  selectedAreaId,
  onSelectArea,
  selectedLocationId,
  onSelectLocation,
  incidents,
  events,
  recommendations,
  language,
  onNavigateToMonitoring,
  onNavigateToAlerts,
  onToggleBeacon,
}) => {
  const currentArea = areas.find((a) => a.id === selectedAreaId);
  const currentLocation = currentArea
    ? locations.find((l) => l.id === currentArea.locationId) || locations[0]
    : locations.find((l) => l.id === selectedLocationId) || locations[0];

  const currentRecommendation = currentArea
    ? recommendations.find((r) => r.areaId === currentArea.id)
    : undefined;

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
      {/* Top Operational Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              Drainage Network GIS &amp; Area Intelligence Platform
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Eastern India Basin • Hooghly &amp; Nadia Rural Drainage Catchments • Click an area polygon to inspect
          </p>
        </div>

        {/* Area Quick Selector Pills & Clear button */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {areas.map((a) => {
            const isSelected = a.id === selectedAreaId;
            return (
              <button
                key={a.id}
                onClick={() => {
                  onSelectArea(a.id);
                  onSelectLocation(a.locationId);
                }}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {a.name.split(' ')[0]} ({a.id})
              </button>
            );
          })}

          {selectedAreaId && (
            <button
              onClick={() => onSelectArea(null)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 transition-colors ml-1"
              title="Return to full network view"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Full Network</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Map on left (flex-1), Area Detail Panel on right (when area selected) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden rounded-2xl shadow-xs">
        {/* Vector GIS Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
          <DrainageMap
            locations={locations}
            areas={areas}
            selectedAreaId={selectedAreaId}
            onSelectArea={(areaId) => {
              onSelectArea(areaId);
              const a = areas.find((x) => x.id === areaId);
              if (a) onSelectLocation(a.locationId);
            }}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
            historicalIncidents={incidents}
            language={language}
            onNavigateToMonitoring={onNavigateToMonitoring}
            onNavigateToAlerts={onNavigateToAlerts}
            interactive={true}
          />
        </div>

        {/* Dedicated Area-Specific Information Panel */}
        {currentArea && (
          <AreaDetailPanel
            area={currentArea}
            location={currentLocation}
            incidents={incidents}
            events={events}
            recommendation={currentRecommendation}
            language={language}
            onClose={() => onSelectArea(null)}
            onNavigateToMonitoring={onNavigateToMonitoring}
            onNavigateToAlerts={onNavigateToAlerts}
            onToggleBeacon={onToggleBeacon}
          />
        )}
      </div>
    </div>
  );
};
