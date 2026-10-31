/**
 * Jal-Nikaas: Advanced Interactive GIS Drainage & Canal Network Map
 * Geospatial vector engine representing 4 agricultural localities and 12 monitoring nodes
 * Features:
 * - 4 Localities with distinct geographic polygons
 * - 12 Monitoring nodes (JN-001 to JN-012) with live risk statuses
 * - Drainage channels with dynamic directional flow vectors (normal, reduced, reversed, static)
 * - Suspected blockage segments highlighted with animated warning stripes
 * - Active beacon strobe indicators at alarmed nodes
 * - Historical GIS scrubber (-72h to Now) to inspect previous drainage states geographically
 * - Interactive node click drawer & locality selector
 */

import React, { useState } from 'react';
import {
  LocationData,
  AgriculturalArea,
  HistoricalIncident,
  RiskLevel,
  Language,
} from '../../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Radio,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Eye,
  Layers,
  ChevronRight,
  Info,
  Droplets,
  Wind,
} from 'lucide-react';

interface DrainageMapProps {
  locations: LocationData[];
  areas?: AgriculturalArea[];
  selectedAreaId?: string | null;
  onSelectArea?: (areaId: string) => void;
  selectedLocationId?: string | null;
  onSelectLocation?: (locationId: string) => void;
  historicalIncidents?: HistoricalIncident[];
  language: Language;
  onNavigateToMonitoring?: (id: string) => void;
  onNavigateToAlerts?: (id: string) => void;
  interactive?: boolean;
}

export const DrainageMap: React.FC<DrainageMapProps> = ({
  locations,
  areas = [],
  selectedAreaId,
  onSelectArea,
  selectedLocationId,
  onSelectLocation,
  historicalIncidents = [],
  language,
  onNavigateToMonitoring,
  onNavigateToAlerts,
  interactive = true,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [historyHourOffset, setHistoryHourOffset] = useState<number>(0); // 0 = Live, -72 to 0
  const [layers, setLayers] = useState({
    canals: true,
    nodes: true,
    areaPolygons: true,
    flowVectors: true,
    blockageSegments: true,
    beacons: true,
    historicalIncidents: true,
  });

  const [activeIncidentModal, setActiveIncidentModal] = useState<HistoricalIncident | null>(null);

  // Map projections for coordinates
  // Lat range: 21.75 to 23.00, Lng range: 87.95 to 89.05
  const minLng = 87.95;
  const maxLng = 89.05;
  const minLat = 21.75;
  const maxLat = 23.00;

  const project = (lng: number, lat: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 880 + 60;
    const y = 630 - ((lat - minLat) / (maxLat - minLat)) * 540;
    return { x, y };
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'NORMAL':
        return '#059669'; // Emerald-600
      case 'ELEVATED':
        return '#0284c7'; // Sky-600
      case 'WARNING':
        return '#d97706'; // Amber-600
      case 'DANGER':
        return '#ea580c'; // Orange-600
      case 'CRITICAL':
        return '#dc2626'; // Red-600
      case 'SENSOR_FAULT':
        return '#64748b'; // Slate-500
    }
  };

  const visibleLocations = locations.filter((loc) => {
    if (riskFilter === 'ALL') return true;
    return loc.riskLevel === riskFilter;
  });

  const selectedLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  // Helper for historical playback values
  const getLocationDisplayAtOffset = (loc: LocationData) => {
    if (historyHourOffset === 0 || !loc.history || loc.history.length === 0) {
      return loc;
    }
    const idx = Math.max(0, loc.history.length - 1 + historyHourOffset);
    const pt = loc.history[idx] || loc.history[loc.history.length - 1];
    return {
      ...loc,
      farmSideSensor: { ...loc.farmSideSensor, levelCm: pt.farmLevel },
      downstreamSensor: { ...loc.downstreamSensor, levelCm: pt.downstreamLevel },
      differentialLevelCm: pt.differential,
      flowSensor: { ...loc.flowSensor, velocityMs: pt.flowVelocityMs, dischargeLs: pt.dischargeLs },
    };
  };

  // Channels interconnecting the 12 nodes
  const canalPaths = [
    // Locality A channels: Hugli Estuary to Kulpi & Kakdwip Rd (JN-001 <-> JN-002 <-> JN-003)
    { id: 'CANAL-A1', d: 'M 160,530 Q 210,500 240,480 T 260,420', segment: 'Segment A1/A2', isBlocked: false },
    { id: 'CANAL-A2', d: 'M 260,420 Q 230,360 210,320', segment: 'Segment A3 (NH Siphon)', isBlocked: false },

    // Locality B channels: Muriganga Estuary to Kakdwip Polder & Namkhana (JN-004 <-> JN-005 <-> JN-006)
    { id: 'CANAL-B1', d: 'M 250,560 Q 290,580 340,600 T 420,580', segment: 'Channel Segment B1 (Polder Collector to Sluice J-05)', isBlocked: true },
    { id: 'CANAL-B2', d: 'M 340,600 Q 380,630 430,640', segment: 'Channel Segment B2 (Namkhana Collector)', isBlocked: false },

    // Locality C channels: Ichhamati River to Basirhat & Hasnabad (JN-007 <-> JN-008 <-> JN-009)
    { id: 'CANAL-C1', d: 'M 720,380 Q 750,330 780,290 T 820,240', segment: 'Segment C1 (Itinda Vegetable Drain Trunk)', isBlocked: false },
    { id: 'CANAL-C2', d: 'M 780,290 Q 840,320 890,340', segment: 'Segment C2 (Regulator Outfall)', isBlocked: false },

    // Locality D channels: Damodar River to Singur & Haripal (JN-010 <-> JN-011 <-> JN-012)
    { id: 'CANAL-D1', d: 'M 230,220 Q 280,240 330,250 T 420,270', segment: 'Segment D1 (Haripal Confluence to Sluice S-02)', isBlocked: false },
    { id: 'CANAL-D2', d: 'M 230,220 Q 180,180 140,150', segment: 'Segment D3 (Kana Damodar Branch)', isBlocked: false },
  ];

  return (
    <div className="relative flex flex-col h-full rounded-2xl border border-slate-800 bg-[#08101a] overflow-hidden shadow-lg">
      {/* Top Map Toolbar */}
      {interactive && (
        <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-2.5 backdrop-blur-md">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
              Risk:
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'NORMAL', label: 'Normal' },
                { id: 'WARNING', label: 'Warning' },
                { id: 'DANGER', label: 'Danger' },
                { id: 'CRITICAL', label: 'Critical' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRiskFilter(rf.id)}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                    riskFilter === rf.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layer toggles & Zoom */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden lg:flex items-center gap-2.5 text-[11px] text-slate-300">
              <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.areaPolygons}
                  onChange={(e) => setLayers({ ...layers, areaPolygons: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                Localities (4)
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.canals}
                  onChange={(e) => setLayers({ ...layers, canals: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                Canal Network
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.flowVectors}
                  onChange={(e) => setLayers({ ...layers, flowVectors: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                Flow Vectors
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.blockageSegments}
                  onChange={(e) => setLayers({ ...layers, blockageSegments: e.target.checked })}
                  className="rounded text-amber-500"
                />
                Blockages
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.beacons}
                  onChange={(e) => setLayers({ ...layers, beacons: e.target.checked })}
                  className="rounded text-red-500"
                />
                Beacons
              </label>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center rounded-lg bg-slate-800 p-0.5 text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))}
                title="Zoom In"
                className="p-1 hover:text-white hover:bg-slate-700 rounded"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
                title="Zoom Out"
                className="p-1 hover:text-white hover:bg-slate-700 rounded"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                title="Reset View"
                className="p-1 hover:text-white hover:bg-slate-700 rounded"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Time Scrubber Bar */}
      {interactive && (
        <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/60 px-4 py-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">Historical GIS Scrubber:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {historyHourOffset === 0 ? 'Live Telemetry (Now)' : `${historyHourOffset} Hours Ago`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-[10px] font-mono">-72h</span>
            <input
              type="range"
              min="-72"
              max="0"
              step="1"
              value={historyHourOffset}
              onChange={(e) => setHistoryHourOffset(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] font-mono">Now</span>
          </div>

          {historyHourOffset !== 0 && (
            <button
              onClick={() => setHistoryHourOffset(0)}
              className="rounded bg-emerald-800/80 hover:bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white transition-colors"
            >
              Return to Live
            </button>
          )}
        </div>
      )}

      {/* Main SVG Vector Canvas */}
      <div className="relative flex-1 overflow-auto bg-[#08101a] min-h-[500px]">
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full min-w-[850px] transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            <linearGradient id="gisRiverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
            </linearGradient>

            {/* Blockage Warning Hatch Pattern */}
            <pattern id="blockageHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#ea580c" strokeWidth="3" strokeOpacity="0.85" />
            </pattern>

            <filter id="neonGlowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Deep Base Matrix */}
          <rect width="1000" height="700" fill="#08101a" />

          {/* 1. Agricultural Area Polygons (4 Localities) */}
          {layers.areaPolygons &&
            areas.map((area) => {
              const isSelected = area.id === selectedAreaId;
              const pointsStr = area.svgPolygon.map(([px, py]) => `${px},${py}`).join(' ');
              const loc = locations.find((l) => l.id === area.locationId);
              const riskCol = loc ? getRiskColor(loc.riskLevel) : '#059669';

              return (
                <g
                  key={area.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    if (onSelectArea) onSelectArea(area.id);
                    if (onSelectLocation && loc) onSelectLocation(loc.id);
                  }}
                >
                  <polygon
                    points={pointsStr}
                    fill={riskCol}
                    fillOpacity={isSelected ? 0.38 : 0.18}
                    stroke={isSelected ? '#38bdf8' : riskCol}
                    strokeWidth={isSelected ? 3.5 : 1.8}
                    strokeDasharray={isSelected ? 'none' : '4 3'}
                  />
                  <text
                    x={area.svgPolygon[0][0] + 10}
                    y={area.svgPolygon[0][1] + 24}
                    className={`text-[11px] font-bold ${
                      isSelected ? 'fill-sky-300' : 'fill-slate-300'
                    }`}
                  >
                    {area.code}: {area.name.split('/')[0]}
                  </text>
                  <text
                    x={area.svgPolygon[0][0] + 10}
                    y={area.svgPolygon[0][1] + 40}
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {area.acreageHectares} ha • {area.farmerCount} farmers
                  </text>
                </g>
              );
            })}

          {/* 2. Drainage Network & Interconnecting Canal Topologies */}
          {layers.canals && (
            <g>
              {/* Hooghly River Main Tidal Waterway */}
              <path
                d="M 520,20 Q 480,180 430,320 T 360,540 Q 320,640 290,700"
                fill="none"
                stroke="url(#gisRiverGrad)"
                strokeWidth="26"
                strokeLinecap="round"
                opacity="0.85"
              />
              <text x="440" y="320" className="fill-sky-200 font-serif italic text-xs tracking-wider" transform="rotate(78 440 320)">
                HOOGHLY RIVER (TIDAL DISCHARGE)
              </text>

              {/* Damodar River Channel */}
              <path
                d="M 90,40 Q 150,140 220,220 T 360,340"
                fill="none"
                stroke="#0284c7"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.75"
              />
              <text x="140" y="110" className="fill-sky-300 font-serif italic text-[10px]" transform="rotate(45 140 110)">
                DAMODAR RIVER
              </text>

              {/* Ichhamati River Channel */}
              <path
                d="M 680,140 Q 760,260 840,360 T 940,540"
                fill="none"
                stroke="#0284c7"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.8"
              />
              <text x="760" y="270" className="fill-sky-300 font-serif italic text-[10px]" transform="rotate(52 760 270)">
                ICHHAMATI RIVER
              </text>

              {/* Interconnecting Canal Network Lines */}
              {canalPaths.map((c) => (
                <path
                  key={c.id}
                  d={c.d}
                  fill="none"
                  stroke={c.isBlocked && layers.blockageSegments ? '#ea580c' : '#38bdf8'}
                  strokeWidth={c.isBlocked ? '7' : '4.5'}
                  strokeLinecap="round"
                  strokeDasharray={c.isBlocked ? '8 4' : 'none'}
                  className={c.isBlocked ? 'animate-pulse' : ''}
                />
              ))}
            </g>
          )}

          {/* 3. Blocked Segment Indicator Highlight */}
          {layers.blockageSegments && (
            <g>
              {/* Highlight Segment B1 between JN-004 and JN-005 */}
              <path
                d="M 250,560 Q 290,580 340,600"
                fill="none"
                stroke="#ef4444"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.7"
                className="animate-pulse"
              />
              <g transform="translate(295, 575)">
                <rect x="-6" y="-6" width="12" height="12" fill="#ef4444" rx="2" />
                <AlertTriangle className="h-3 w-3 text-white -translate-x-[6px] -translate-y-[6px]" />
                <text x="12" y="3" className="fill-red-400 font-mono text-[9px] font-bold">
                  SUSPECTED BLOCKAGE (260m)
                </text>
              </g>
            </g>
          )}

          {/* 4. Dynamic Flow Direction Vectors */}
          {layers.flowVectors && (
            <g>
              {/* Normal Flow Vectors (Green outbound) */}
              <g transform="translate(390, 260)">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#10b981" strokeWidth="2.5" />
                <polygon points="10,-4 18,0 10,4" fill="#10b981" />
                <text x="-20" y="-6" className="fill-emerald-400 text-[9px] font-mono">0.65 m/s →</text>
              </g>

              <g transform="translate(800, 310)">
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#10b981" strokeWidth="2.5" />
                <polygon points="12,-4 20,0 12,4" fill="#10b981" />
                <text x="-25" y="-6" className="fill-emerald-400 text-[9px] font-mono">0.95 m/s →</text>
              </g>

              {/* Reversed Tidal Flow Vector (Amber/Red Backflow at Diamond Harbour JN-001) */}
              <g transform="translate(190, 520)">
                <line x1="16" y1="0" x2="-12" y2="0" stroke="#f59e0b" strokeWidth="3" />
                <polygon points="-8,-5 -18,0 -8,5" fill="#f59e0b" className="animate-pulse" />
                <text x="-70" y="-8" className="fill-amber-400 text-[9px] font-mono font-bold">
                  ← REVERSE BACKFLOW (-0.16 m/s)
                </text>
              </g>

              {/* Choked Low Velocity Vector (Kakdwip JN-004) */}
              <g transform="translate(320, 595)">
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#ea580c" strokeWidth="2" strokeDasharray="3 2" />
                <polygon points="6,-3 12,0 6,3" fill="#ea580c" />
                <text x="-35" y="-6" className="fill-orange-400 text-[8px] font-mono font-bold">
                  0.12 m/s (CHOKED)
                </text>
              </g>
            </g>
          )}

          {/* 5. Historical Incidents Pins */}
          {layers.historicalIncidents &&
            historicalIncidents.map((inc, i) => {
              const matchedArea = areas.find((a) => a.id === inc.areaId);
              if (!matchedArea) return null;
              const baseX = matchedArea.svgPolygon[0][0] + 45 + (i % 2) * 35;
              const baseY = matchedArea.svgPolygon[0][1] + 65 + (i % 2) * 20;

              return (
                <g
                  key={inc.id}
                  className="cursor-pointer transition-transform hover:scale-125"
                  transform={`translate(${baseX}, ${baseY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIncidentModal(inc);
                  }}
                >
                  <circle r="11" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                  <Flame className="h-3.5 w-3.5 text-amber-300 -translate-x-[7px] -translate-y-[7px]" />
                  <title>{inc.id}: {inc.description}</title>
                </g>
              );
            })}

          {/* 6. All 12 Telemetry Sensor Nodes */}
          {layers.nodes &&
            visibleLocations.map((loc) => {
              const displayLoc = getLocationDisplayAtOffset(loc);
              const { x, y } = project(loc.coordinates.lng, loc.coordinates.lat);
              const isSelected = loc.id === selectedLocationId;
              const color = getRiskColor(displayLoc.riskLevel);
              const isDangerOrCritical = displayLoc.riskLevel === 'DANGER' || displayLoc.riskLevel === 'CRITICAL';
              const hasBeacon = displayLoc.beaconState.isActive && layers.beacons;

              return (
                <g
                  key={loc.id}
                  className="cursor-pointer transition-transform hover:scale-115"
                  onClick={() => {
                    if (onSelectLocation) onSelectLocation(loc.id);
                    if (onSelectArea && loc.localityId) onSelectArea(loc.localityId);
                  }}
                  transform={`translate(${x}, ${y})`}
                >
                  {/* Ping effect for critical or alarmed node */}
                  {isDangerOrCritical && (
                    <circle r="20" fill="none" stroke={color} strokeWidth="2" opacity="0.8" className="animate-ping" />
                  )}

                  {/* Beacon indicator halo */}
                  {hasBeacon && (
                    <circle r="26" fill="#dc2626" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" />
                  )}

                  {/* Node Outer Circle */}
                  <circle
                    r={isSelected ? 14 : 10}
                    fill={color}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Inner Node Icon or Strobe Dot */}
                  <circle r={isSelected ? 5 : 3.5} fill="#ffffff" />

                  {/* Node ID label */}
                  <rect
                    x="-24"
                    y="14"
                    width="48"
                    height="15"
                    rx="3"
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="25"
                    textAnchor="middle"
                    className="font-mono text-[9px] font-bold fill-white"
                  >
                    {loc.nodeCode}
                  </text>

                  {/* Beacon Icon when Active */}
                  {hasBeacon && (
                    <g transform="translate(10, -18)">
                      <circle r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
                      <Radio className="h-3 w-3 text-amber-200 -translate-x-[6px] -translate-y-[6px] animate-pulse" />
                    </g>
                  )}
                </g>
              );
            })}
        </svg>

        {/* Floating Quick Legend */}
        <div className="absolute bottom-3 left-3 rounded-xl border border-slate-800 bg-slate-950/85 p-3 text-[11px] text-slate-300 backdrop-blur-md space-y-1.5 shadow-md">
          <div className="font-bold text-white text-xs mb-1">GIS Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>Normal Gravity Outflow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span>Warning / Backflow Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span>Critical Submergence / Blockage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-1 border-t-2 border-dashed border-red-500"></span>
            <span>Suspected Blockage Segment</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="h-3 w-3 text-red-500" />
            <span>Active Junction Beacon Strobe</span>
          </div>
        </div>
      </div>

      {/* Historical Incident Modal */}
      {activeIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                <h4 className="font-bold text-white text-sm">
                  Historical Incident [{activeIncidentModal.id}]
                </h4>
              </div>
              <button
                onClick={() => setActiveIncidentModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300">{activeIncidentModal.description}</p>
            <div className="rounded-lg bg-slate-800/80 p-2.5 text-[11px] space-y-1">
              <div><strong>Primary Cause:</strong> {activeIncidentModal.cause}</div>
              <div><strong>Intervention:</strong> {activeIncidentModal.intervention}</div>
              <div><strong>Outcome:</strong> {activeIncidentModal.outcome}</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveIncidentModal(null)}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
