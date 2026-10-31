/**
 * Jal-Nikaas: Overview Dashboard View
 * Comprehensive multi-node telemetry monitoring, blockage tracking, warning beacons, and scenario controls.
 */

import React, { useState } from 'react';
import {
  LocationData,
  AlertItem,
  WorkOrder,
  CommunicationLogItem,
  Language,
  RiskThresholdConfig,
} from '../../types';
import { getTranslation } from '../../utils/i18n';
import { WaterLevelChart } from '../charts/WaterLevelChart';
import { DrainageMap } from '../gis/DrainageMap';
import { SimulationControlPanel } from './SimulationControlPanel';
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wrench,
  Radio,
  ArrowUpRight,
  Droplets,
  Activity,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Zap,
  Volume2,
  Waves,
  Users,
} from 'lucide-react';

interface OverviewViewProps {
  locations: LocationData[];
  alerts: AlertItem[];
  workOrders?: WorkOrder[];
  commLogs?: CommunicationLogItem[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
  language: Language;
  onAcknowledgeAlert: (alertId: string) => void;
  onTriggerScenario: (scenarioNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  onResetSimulation: () => void;
  isOfflineMode: boolean;
  activeScenarioName?: string | null;
  thresholds?: RiskThresholdConfig;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  locations,
  alerts,
  workOrders = [],
  commLogs = [],
  selectedLocationId,
  onSelectLocation,
  onNavigateToTab,
  language,
  onAcknowledgeAlert,
  onTriggerScenario,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onSpeedChange,
  onResetSimulation,
  isOfflineMode,
  activeScenarioName,
  thresholds,
}) => {
  const [showScenarioDrawer, setShowScenarioDrawer] = useState(true);

  const selectedLocation =
    locations.find((l) => l.id === selectedLocationId) || locations[0];

  const normalCount = locations.filter((l) => l.riskLevel === 'NORMAL').length;
  const elevatedCount = locations.filter((l) => l.riskLevel === 'ELEVATED').length;
  const warningCount = locations.filter((l) => l.riskLevel === 'WARNING').length;
  const dangerCount = locations.filter((l) => l.riskLevel === 'DANGER').length;
  const criticalCount = locations.filter((l) => l.riskLevel === 'CRITICAL').length;
  const faultCount = locations.filter((l) => l.riskLevel === 'SENSOR_FAULT').length;

  const activeBeaconsCount = locations.filter((l) => l.beaconState.isActive).length;
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const openWorkOrders = workOrders.filter((w) => w.status !== 'CLEARED');

  return (
    <div className="space-y-6">
      {/* 1. Demonstration Scenarios Control Bar */}
      {showScenarioDrawer ? (
        <SimulationControlPanel
          language={language}
          isSimulating={isSimulating}
          onToggleSimulation={onToggleSimulation}
          simulationSpeed={simulationSpeed}
          onSpeedChange={onSpeedChange}
          onTriggerScenario={onTriggerScenario}
          onResetSimulation={onResetSimulation}
          isOfflineMode={isOfflineMode}
          activeScenarioName={activeScenarioName}
          onClose={() => setShowScenarioDrawer(false)}
        />
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Demonstration Scenarios:</span>
            <span className="text-xs text-slate-400">
              {activeScenarioName ? `Active: ${activeScenarioName}` : 'Baseline Nominal State'}
            </span>
          </div>
          <button
            onClick={() => setShowScenarioDrawer(true)}
            className="rounded-lg bg-emerald-800 hover:bg-emerald-700 px-3 py-1 text-xs font-bold text-white transition-colors"
          >
            Open Scenario Controller →
          </button>
        </div>
      )}

      {/* 2. Top Network Status KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Nodes */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nodes Monitored</span>
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{locations.length}</span>
            <span className="text-[10px] text-slate-500">in 4 localities</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Shared RPi 3B+ Gateway</span>
          </div>
        </div>

        {/* Normal Gravity Flow */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Normal Flow</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-700">{normalCount}</span>
            <span className="text-[10px] text-slate-500">nodes</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Positive gravity head</div>
        </div>

        {/* Elevated / Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Warning</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-700">
              {elevatedCount + warningCount}
            </span>
            <span className="text-[10px] text-amber-800">nodes</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-700">Rising head / weeds</div>
        </div>

        {/* Danger / Critical */}
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Danger / Critical</span>
            <Flame className="h-3.5 w-3.5 text-red-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-red-600">
              {dangerCount + criticalCount}
            </span>
            <span className="text-[10px] text-red-700">nodes</span>
          </div>
          <div className="mt-1 text-[10px] text-red-700 font-semibold">Submerged / Backflow</div>
        </div>

        {/* Active Warning Beacons */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Beacons</span>
            <Radio className="h-3.5 w-3.5 text-red-600 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-red-600">
              {activeBeaconsCount}
            </span>
            <span className="text-[10px] text-slate-500">junctions</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Strobe &amp; buzzer active</div>
        </div>

        {/* Open Work Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Drainage Orders</span>
            <Wrench className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{openWorkOrders.length}</span>
            <span className="text-[10px] text-slate-500">in progress</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Panchayat de-siltation</div>
        </div>
      </div>

      {/* 3. Main Content Grid: Detailed Inspection & Mini GIS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Selected Node Telemetry Trend & Diagnostics */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-800 text-white font-mono text-xs px-2 py-0.5 font-bold">
                  {selectedLocation.nodeCode}
                </span>
                <h3 className="font-bold text-slate-800 text-sm">
                  {selectedLocation.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedLocation.localityName} • Canal Type: {selectedLocation.canalType.replace('_', ' ')}
              </p>
            </div>

            {/* Quick Node Switcher */}
            <select
              value={selectedLocation.id}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-emerald-600"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nodeCode}: {loc.name.split(' ')[0]} ({loc.riskLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Hydraulic Telemetry Quick Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Farm Level</span>
              <span className="text-lg font-mono font-bold text-slate-900">
                {selectedLocation.farmSideSensor.levelCm !== null
                  ? `${selectedLocation.farmSideSensor.levelCm} cm`
                  : 'FAULT'}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Canal Level</span>
              <span className="text-lg font-mono font-bold text-slate-900">
                {selectedLocation.downstreamSensor.levelCm !== null
                  ? `${selectedLocation.downstreamSensor.levelCm} cm`
                  : 'FAULT'}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Differential (Δh)</span>
              <span
                className={`text-lg font-mono font-bold ${
                  selectedLocation.differentialLevelCm <= 0 ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {selectedLocation.differentialLevelCm > 0
                  ? `+${selectedLocation.differentialLevelCm}`
                  : selectedLocation.differentialLevelCm}{' '}
                cm
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Flow Velocity</span>
              <span className="text-lg font-mono font-bold text-sky-700">
                {selectedLocation.flowSensor.velocityMs} m/s
              </span>
            </div>
          </div>

          {/* 72-Hour Historical Time-Series Chart */}
          <div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-2">
            <WaterLevelChart
              history={selectedLocation.history}
              submergenceCriticalCm={thresholds?.submergenceCriticalCm ?? 75}
              submergenceWarningCm={thresholds?.submergenceWarningCm ?? 50}
              locationName={selectedLocation.name}
            />
          </div>

          {/* Operational Assessment Bar */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs flex items-start justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800">Hydraulic Status: </span>
              <span className="text-slate-600">{selectedLocation.riskReason}</span>
            </div>
            <button
              onClick={() => onNavigateToTab('monitoring')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-700 shrink-0 flex items-center gap-1"
            >
              <span>Full Sensors</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Mini GIS Map Preview */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-700" />
                <h3 className="font-bold text-slate-800 text-sm">GIS Drainage Map Overview</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('gis')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-700"
              >
                <span>Full GIS View</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border border-slate-800">
              <DrainageMap
                locations={locations}
                selectedLocationId={selectedLocation.id}
                onSelectLocation={onSelectLocation}
                language={language}
                onNavigateToMonitoring={(id) => {
                  onSelectLocation(id);
                  onNavigateToTab('monitoring');
                }}
                interactive={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Early Warnings & Work Orders Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Early Warnings */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Active Drainage Early Warnings ({unacknowledgedAlerts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('alerts')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-700"
            >
              Alert Centre →
            </button>
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50/80 transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{a.nodeCode}</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        a.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {a.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{a.locationName}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{a.triggerCondition}</div>
                <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-100">
                  <span className="text-slate-400">Action: {a.recommendedAction}</span>
                  {!a.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(a.id)}
                      className="rounded bg-slate-900 hover:bg-slate-800 text-white px-2 py-0.5 text-[10px] font-bold"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Work Orders Feed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Gram Panchayat Drainage Work Orders ({workOrders.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('alerts')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-700"
            >
              Manage Orders →
            </button>
          </div>

          <div className="space-y-2">
            {workOrders.map((w) => (
              <div
                key={w.id}
                className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50/80 transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                    <span>{w.id}</span>
                    <span>• Node {w.nodeCode}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      w.status === 'CLEARED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{w.segment}</div>
                <div className="text-[11px] text-slate-500">
                  Assigned: {w.assignedPersonnel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
