/**
 * Jal-Nikaas: Reports & Event History View
 * Historical trends, sensor uptime, packet availability, event timeline, and real CSV report download
 */

import React, { useState } from 'react';
import { LocationData, AlertItem, Language } from '../../types';
import { getTranslation } from '../../utils/i18n';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  Database,
  ShieldCheck,
} from 'lucide-react';

interface ReportsHistoryViewProps {
  locations: LocationData[];
  alerts: AlertItem[];
  language: Language;
}

export const ReportsHistoryView: React.FC<ReportsHistoryViewProps> = ({
  locations,
  alerts,
  language,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'6h' | '24h' | '7d'>('24h');

  const filteredLocations =
    selectedLocationId === 'ALL'
      ? locations
      : locations.filter((l) => l.id === selectedLocationId);

  // Generate downloadable CSV report from actual current telemetry and historical logs
  const handleExportCSV = () => {
    const rows = [
      [
        'Timestamp',
        'Location_ID',
        'Location_Name',
        'District',
        'Block',
        'Farm_Water_Level_cm',
        'Downstream_Canal_Level_cm',
        'Differential_Delta_h_cm',
        'Rate_of_Rise_cm_per_hr',
        'Risk_Classification',
        'Hydraulic_Status_Reason',
        'Sluice_Gate_Status',
        'Sensor_Health',
        'Data_Source',
      ],
    ];

    filteredLocations.forEach((loc) => {
      // Include historical readings
      loc.history.forEach((pt) => {
        rows.push([
          pt.timestamp,
          loc.id,
          `"${loc.name}"`,
          loc.district,
          loc.block,
          pt.farmLevel.toString(),
          pt.downstreamLevel.toString(),
          pt.differential.toString(),
          loc.rateOfRiseCmHr.toString(),
          loc.riskLevel,
          `"${loc.riskReason.replace(/"/g, '""')}"`,
          loc.sluiceGateStatus,
          loc.farmSideSensor.status,
          'JAL_NIKAAS_SIMULATED_TELEMETRY',
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute(
      'download',
      `jal-nikaas-agro-drain-telemetry-report-${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              {getTranslation(language, 'nav_reports')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs, sensor availability statistics, and verifiable waterlogging telemetry export
          </p>
        </div>

        {/* Filter controls and Export CSV Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Location Filter */}
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-emerald-600"
          >
            <option value="ALL">All Monitored Locations (6)</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* Time range */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 p-0.5 text-xs">
            {(['6h', '24h', '7d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                  dateRange === r
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Download CSV Report */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV Dataset
          </button>
        </div>
      </div>

      {/* Network Health & Availability KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Data Availability Rate
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">99.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">2,880 packets received (24h)</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Sensor Network Uptime
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-1">98.8%</div>
          <div className="text-[11px] text-slate-500 mt-1">5 of 6 nodes online and calibrated</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Alert Resolution Speed
          </div>
          <div className="text-2xl font-mono font-bold text-sky-700 mt-1">18 mins</div>
          <div className="text-[11px] text-slate-500 mt-1">Average Panchayat response time</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Local SQLite Edge Cache
          </div>
          <div className="text-2xl font-mono font-bold text-slate-800 mt-1">4.2 MB</div>
          <div className="text-[11px] text-slate-500 mt-1">Offline retention on RPi storage</div>
        </div>
      </div>

      {/* Historical Telemetry Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-700" />
            <h3 className="font-bold text-slate-800 text-sm">
              Recorded Telemetry Log &amp; Differential Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Showing latest 10 historical records per location
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">Location ID</th>
                <th className="px-3 py-2.5">Location Name</th>
                <th className="px-3 py-2.5">Farm Level</th>
                <th className="px-3 py-2.5">Canal Level</th>
                <th className="px-3 py-2.5">Differential (Δh)</th>
                <th className="px-3 py-2.5">Risk State</th>
                <th className="px-3 py-2.5">Sluice State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {filteredLocations.flatMap((loc) =>
                loc.history.slice(0, 4).map((pt, idx) => (
                  <tr key={`${loc.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 text-slate-500 font-sans">
                      {new Date(pt.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-900">{loc.id}</td>
                    <td className="px-3 py-2 font-sans font-medium text-slate-800">
                      {loc.name}
                    </td>
                    <td className="px-3 py-2 text-emerald-700 font-bold">{pt.farmLevel} cm</td>
                    <td className="px-3 py-2 text-sky-700 font-bold">{pt.downstreamLevel} cm</td>
                    <td
                      className={`px-3 py-2 font-bold ${
                        pt.differential <= 0 ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {pt.differential > 0 ? `+${pt.differential}` : pt.differential} cm
                    </td>
                    <td className="px-3 py-2 font-sans">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          loc.riskLevel === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : loc.riskLevel === 'BACKFLOW_RISK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {loc.riskLevel}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 font-sans">{loc.sluiceGateStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
