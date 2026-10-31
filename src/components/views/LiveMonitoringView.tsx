/**
 * Jal-Nikaas: Live Multi-Node Sensor Monitoring View
 * Dual ultrasonic telemetry, open-channel non-contact radar velocity/discharge,
 * hydraulic state evaluation, blockage diagnostic indicators, and 72-hour historical charting.
 */

import React, { useState } from 'react';
import { LocationData, Language, RiskThresholdConfig } from '../../types';
import { getTranslation } from '../../utils/i18n';
import { WaterLevelChart } from '../charts/WaterLevelChart';
import {
  Droplets,
  Activity,
  BatteryCharging,
  Wifi,
  Thermometer,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Sliders,
  Play,
  Pause,
  CloudRain,
  Radio,
  Clock,
  Compass,
  Filter,
  Search,
  Waves,
  Zap,
} from 'lucide-react';

interface LiveMonitoringViewProps {
  locations: LocationData[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  language: Language;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onTriggerStorm: () => void;
  onTriggerBackflow: () => void;
  onOpenThresholdModal: () => void;
  onToggleBeacon?: (locationId: string) => void;
  thresholds?: RiskThresholdConfig;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  language,
  isSimulating,
  onToggleSimulation,
  onTriggerStorm,
  onTriggerBackflow,
  onOpenThresholdModal,
  onToggleBeacon,
  thresholds,
}) => {
  const [localityFilter, setLocalityFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLocations = locations.filter((loc) => {
    if (localityFilter !== 'ALL' && loc.localityId !== localityFilter) return false;
    if (riskFilter !== 'ALL' && loc.riskLevel !== riskFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        loc.nodeCode.toLowerCase().includes(q) ||
        loc.name.toLowerCase().includes(q) ||
        loc.localityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const location =
    locations.find((l) => l.id === selectedLocationId) || filteredLocations[0] || locations[0];

  const farm = location.farmSideSensor;
  const downstream = location.downstreamSensor;

  const isBackflow = location.differentialLevelCm <= 0;
  const isRisingFast = location.rateOfRiseCmHr >= 4.0;

  return (
    <div className="space-y-6">
      {/* Top Header & Search / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">
              Multi-Node Drainage Telemetry &amp; Hydraulic Monitoring
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            12 Distributed monitoring junctions across 4 agricultural localities with dual-level sensing &amp; open-channel radar velocity
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Locality Filter */}
          <select
            value={localityFilter}
            onChange={(e) => setLocalityFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-emerald-600"
          >
            <option value="ALL">All 4 Localities</option>
            <option value="LOC-DHR-A">Locality A: Diamond Harbour South</option>
            <option value="LOC-KKD-B">Locality B: Kakdwip Island North</option>
            <option value="LOC-BSR-C">Locality C: Basirhat Basin</option>
            <option value="LOC-SNG-D">Locality D: Singur-Haripal Plain</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-emerald-600"
          >
            <option value="ALL">All Risk Conditions</option>
            <option value="NORMAL">Normal</option>
            <option value="ELEVATED">Elevated</option>
            <option value="WARNING">Warning</option>
            <option value="DANGER">Danger</option>
            <option value="CRITICAL">Critical</option>
            <option value="SENSOR_FAULT">Sensor Fault</option>
          </select>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search node code, junction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-52 rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
            />
          </div>

          {/* Configure Risk Rules Button */}
          <button
            type="button"
            onClick={onOpenThresholdModal}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold transition-colors shadow-xs"
            title="Configure hydraulic risk rules and submergence limits"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-700" />
            <span>Risk Rules</span>
          </button>
        </div>
      </div>

      {/* 12-Node Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {locations.map((loc) => {
          const isSelected = loc.id === location.id;
          let badgeColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
          if (isSelected) {
            badgeColor = 'bg-emerald-800 text-white shadow-xs ring-1 ring-emerald-600';
          } else if (loc.riskLevel === 'CRITICAL' || loc.riskLevel === 'DANGER') {
            badgeColor = 'bg-red-50 text-red-800 border border-red-300';
          } else if (loc.riskLevel === 'WARNING') {
            badgeColor = 'bg-amber-50 text-amber-800 border border-amber-300';
          }

          return (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${badgeColor}`}
            >
              <span className="font-mono text-[10px] font-bold">{loc.nodeCode}</span>
              <span className="truncate max-w-[120px]">{loc.name.split(' ')[0]}</span>
              {loc.beaconState.isActive && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Node Detailed Inspection Deck */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-emerald-800 text-white font-mono text-xs px-2.5 py-1 font-bold">
                {location.nodeCode}
              </span>
              <h3 className="text-xl font-bold text-slate-900">{location.name}</h3>
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  location.riskLevel === 'NORMAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : location.riskLevel === 'ELEVATED'
                    ? 'bg-sky-100 text-sky-800'
                    : location.riskLevel === 'WARNING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {location.riskLevel.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Locality: {location.localityName} • {location.block} Block, {location.district} District • Canal Type: {location.canalType.replace('_', ' ')} • Ground Elevation: {location.elevationMeters}m
            </p>
          </div>

          <div className="flex items-center gap-2">
            {location.beaconState.isActive && (
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse">
                <Radio className="h-4 w-4" /> WARNING BEACON ACTIVE
              </span>
            )}
            {onToggleBeacon && (
              <button
                onClick={() => onToggleBeacon(location.id)}
                className="rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Toggle Beacon
              </button>
            )}
          </div>
        </div>

        {/* Operational Hydraulic State Banner */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Operational Hydraulic Condition
            </span>
            <span className="font-mono text-xs font-bold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
              {location.hydraulicState}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            {location.hydraulicReason}
          </p>
        </div>

        {/* Main Hydraulic Telemetry Gauges (Dual-Sensor + Flow Rate) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Farm-Side Intake */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-emerald-600" />
                <span>Farm-Side Level</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">JSN-SR04T</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {farm.levelCm !== null ? farm.levelCm : 'FAULT'}
              </span>
              <span className="text-xs text-slate-500 font-bold">cm</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
              <span>Raw Dist: {location.rawSensorDistanceCm}cm</span>
              <span>Bat: {farm.batteryPct}%</span>
            </div>
          </div>

          {/* Downstream Canal Level */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-sky-600" />
                <span>Downstream Canal</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">JSN-SR04T</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {downstream.levelCm !== null ? downstream.levelCm : 'FAULT'}
              </span>
              <span className="text-xs text-slate-500 font-bold">cm</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
              <span>Freeboard: {location.freeboardCm}cm</span>
              <span>Bat: {downstream.batteryPct}%</span>
            </div>
          </div>

          {/* Differential Head (Δh) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-purple-600" />
                <span>Differential Head (Δh)</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">h_farm - h_down</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  isBackflow ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {location.differentialLevelCm > 0
                  ? `+${location.differentialLevelCm}`
                  : location.differentialLevelCm}
              </span>
              <span className="text-xs text-slate-500 font-bold">cm</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
              <span>Rate: {location.rateOfRiseCmHr > 0 ? `+${location.rateOfRiseCmHr}` : location.rateOfRiseCmHr} cm/h</span>
              <span>Cap: {location.channelCapacityPct}%</span>
            </div>
          </div>

          {/* Flow Velocity & Discharge */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Waves className="h-4 w-4 text-sky-600" />
                <span>Open-Channel Flow</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">24GHz Radar</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {location.flowSensor.velocityMs}
              </span>
              <span className="text-xs text-slate-500 font-bold">m/s</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
              <span>Discharge: {location.flowSensor.dischargeLs} L/s</span>
              <span className="uppercase font-bold text-slate-700">{location.flowSensor.direction}</span>
            </div>
          </div>
        </div>

        {/* Blockage Diagnosis & Reason Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Diagnostic Analysis &amp; Blockage Evaluation:</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Blockage Probability: <strong>{location.blockageDiagnosis.confidenceScore}%</strong> • Severity: <strong>{location.blockageDiagnosis.severity}</strong>
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {location.riskReason}
          </p>
          <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 flex flex-wrap gap-4">
            <span><strong>Affected Segment:</strong> {location.blockageDiagnosis.affectedSegment}</span>
            <span><strong>Action:</strong> {location.blockageDiagnosis.recommendedAction}</span>
          </div>
        </div>

        {/* Historical Charting (Dual Level + Differential + Rainfall) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Telemetry Time-Series (Last 72 Hours)
            </h4>
            <span className="font-mono text-[11px] text-slate-500">
              Updated: {new Date(location.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <div className="h-72 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <WaterLevelChart
              history={location.history}
              submergenceCriticalCm={thresholds?.submergenceCriticalCm ?? 75}
              submergenceWarningCm={thresholds?.submergenceWarningCm ?? 50}
              locationName={location.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
