/**
 * Jal-Nikaas: Alert Centre, Maintenance Work Orders & Communication Dispatch
 * Comprehensive incident management, Panchayat work orders, and SMS/IVR delivery logs.
 */

import React, { useState } from 'react';
import {
  AlertItem,
  WorkOrder,
  CommunicationLogItem,
  RiskLevel,
  AlertSeverity,
  Language,
} from '../../types';
import { getTranslation } from '../../utils/i18n';
import { VoicePlayer } from '../common/VoicePlayer';
import {
  BellRing,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Wrench,
  Filter,
  Check,
  Clock,
  Compass,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Volume2,
  Phone,
  MessageSquare,
  Plus,
  Send,
  X,
  Radio,
  RotateCcw,
} from 'lucide-react';

interface AlertCenterViewProps {
  alerts: AlertItem[];
  workOrders?: WorkOrder[];
  commLogs?: CommunicationLogItem[];
  language: Language;
  onAcknowledgeAlert: (alertId: string, operatorName?: string, notes?: string) => void;
  onSelectLocation: (locId: string) => void;
  onNavigateToMonitoring: (locId: string) => void;
  onCreateWorkOrder?: (workOrder: WorkOrder) => void;
  onResolveWorkOrder?: (workOrderId: string, notes?: string) => void;
  onResendNotification?: (logId: string) => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  alerts,
  workOrders = [],
  commLogs = [],
  language,
  onAcknowledgeAlert,
  onSelectLocation,
  onNavigateToMonitoring,
  onCreateWorkOrder,
  onResolveWorkOrder,
  onResendNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'workOrders' | 'comms'>('alerts');
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [showOnlyUnacknowledged, setShowOnlyUnacknowledged] = useState<boolean>(false);

  // Operator acknowledgement modal state
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState<string>('P. Banerjee (Gram Panchayat Pradhan)');
  const [operatorNotes, setOperatorNotes] = useState<string>('Inspected outfall. Canal sluice opened to 100%.');

  // Work order creation modal state
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [newWorkOrder, setNewWorkOrder] = useState<Partial<WorkOrder>>({
    nodeCode: 'JN-004',
    segment: 'Channel Segment B1 (Polder Collector)',
    severity: 'SEVERE_BLOCKAGE',
    suspectedLocation: '260m downstream of culvert',
    assignedPersonnel: 'Panchayat Emergency Drain Clearance Team 1',
    notes: 'JCB mini-excavator and bamboo rake crew mobilized.',
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (categoryFilter !== 'ALL' && alert.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (showOnlyUnacknowledged && alert.acknowledged) return false;
    return true;
  });

  const activeAlert = alerts.find((a) => a.id === selectedAlertId) || filteredAlerts[0] || alerts[0];

  const handleConfirmAcknowledge = () => {
    if (acknowledgingAlertId) {
      onAcknowledgeAlert(acknowledgingAlertId, operatorName, operatorNotes);
      setAcknowledgingAlertId(null);
    }
  };

  const handleCreateWorkOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateWorkOrder) return;
    const wo: WorkOrder = {
      id: `WO-${Date.now().toString().slice(-4)}`,
      nodeCode: newWorkOrder.nodeCode || 'JN-004',
      nodeName: 'Kakdwip Polder Outfall Canal J-05',
      localityId: 'LOC-KKD-B',
      localityName: 'Kakdwip Island North Polder',
      segment: newWorkOrder.segment || 'Primary Collector Sump',
      severity: newWorkOrder.severity || 'SEVERE_BLOCKAGE',
      suspectedLocation: newWorkOrder.suspectedLocation || 'Downstream outfall apron',
      supportingEvidence: ['Radar flow velocity dropped by >70% with high upstream differential head.'],
      assignedPersonnel: newWorkOrder.assignedPersonnel || 'Gram Panchayat Drain Clearance Team',
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
      notes: newWorkOrder.notes || 'De-siltation initiated.',
    };
    onCreateWorkOrder(wo);
    setIsWorkOrderModalOpen(false);
  };

  const getAdvisoryText = (alert: AlertItem) => {
    if (language === 'bn') return alert.recommendedActionBengali || alert.recommendedAction;
    if (language === 'hi') return alert.recommendedActionHindi || alert.recommendedAction;
    return alert.recommendedAction;
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Drainage Early-Warning Alert Centre &amp; Work Orders
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated danger-level escalation, physical beacon tracking, Panchayat maintenance orders, and SMS/IVR dispatch logs
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'alerts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="h-3.5 w-3.5 text-red-600" />
            <span>Active Alerts ({alerts.filter((a) => !a.acknowledged).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('workOrders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'workOrders'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="h-3.5 w-3.5 text-amber-600" />
            <span>Work Orders ({workOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'comms'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-sky-600" />
            <span>SMS/IVR Logs ({commLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ---------------- VIEW 1: ACTIVE ALERTS ---------------- */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Filterable Alerts List */}
          <div className="lg:col-span-1 space-y-3">
            {/* Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="DANGER">Danger / Blockage</option>
                <option value="CRITICAL">Critical Submergence</option>
                <option value="WARNING">Warning</option>
                <option value="SENSOR_FAULT">Sensor Fault</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-600 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyUnacknowledged}
                  onChange={(e) => setShowOnlyUnacknowledged(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                Unacknowledged only
              </label>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredAlerts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  No alerts matching the selected filter.
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isSelected = alert.id === selectedAlertId;
                  const isCritical = alert.severity === 'CRITICAL';

                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlertId(alert.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {alert.nodeCode}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {alert.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {alert.locationName}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {alert.triggerCondition}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-slate-100 pt-1.5">
                        <span className="font-mono text-slate-500">
                          Δh: {alert.readings.differential !== null ? `${alert.readings.differential}cm` : 'N/A'}
                        </span>
                        {alert.acknowledged ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Acknowledged
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Pending Action
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Alert Inspection & Actions */}
          <div className="lg:col-span-2">
            {activeAlert ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-xs">
                        {activeAlert.id}
                      </span>
                      <span className="font-mono text-xs text-emerald-800 font-bold">
                        Node: {activeAlert.nodeCode}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                          activeAlert.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {activeAlert.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      {activeAlert.locationName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Locality: {activeAlert.localityName} • Logged at: {new Date(activeAlert.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!activeAlert.acknowledged ? (
                      <button
                        onClick={() => setAcknowledgingAlertId(activeAlert.id)}
                        className="rounded-lg bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="h-4 w-4" />
                        <span>Acknowledge Alert</span>
                      </button>
                    ) : (
                      <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Acknowledged</span>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setNewWorkOrder({
                          nodeCode: activeAlert.nodeCode,
                          segment: `Segment at ${activeAlert.locationName}`,
                          severity: 'SEVERE_BLOCKAGE',
                          suspectedLocation: 'Immediate downstream culvert',
                          assignedPersonnel: 'Panchayat Emergency Drain Clearance Team',
                          notes: activeAlert.triggerCondition,
                        });
                        setIsWorkOrderModalOpen(true);
                      }}
                      className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <Wrench className="h-3.5 w-3.5 text-amber-600" />
                      <span>Create Work Order</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry Snapshot at Trigger */}
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Farm Level</span>
                    <span className="text-lg font-bold text-slate-900">
                      {activeAlert.readings.farmLevel !== null ? `${activeAlert.readings.farmLevel} cm` : 'N/A'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Canal Level</span>
                    <span className="text-lg font-bold text-slate-900">
                      {activeAlert.readings.downstreamLevel !== null ? `${activeAlert.readings.downstreamLevel} cm` : 'N/A'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Differential Head</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {activeAlert.readings.differential !== null ? `${activeAlert.readings.differential} cm` : 'N/A'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Rate of Rise</span>
                    <span className="text-lg font-bold text-red-600">
                      {activeAlert.readings.rateOfRise} cm/h
                    </span>
                  </div>
                </div>

                {/* Trigger Condition & Action Recommendation */}
                <div className="rounded-xl bg-red-50/80 border border-red-200 p-4 space-y-2 text-xs">
                  <div className="font-bold text-red-900 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-red-600" />
                    <span>Trigger Condition:</span>
                  </div>
                  <p className="text-red-800 font-medium">
                    {activeAlert.triggerCondition}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-3 text-xs">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-emerald-700" />
                    <span>Recommended Agricultural &amp; Drainage Mitigation:</span>
                  </div>
                  <p className="text-emerald-950 font-medium leading-relaxed">
                    {getAdvisoryText(activeAlert)}
                  </p>
                  <div className="pt-2 border-t border-emerald-200/80">
                    <VoicePlayer
                      text={getAdvisoryText(activeAlert)}
                      language={language}
                      label="Play Audio Advisory"
                    />
                  </div>
                </div>

                {/* Acknowledgement Log if signed */}
                {activeAlert.acknowledged && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">Inspection &amp; Verification Record:</div>
                    <div>Acknowledged by: <strong>{activeAlert.acknowledgedBy}</strong></div>
                    <div>Notes: <em>{activeAlert.notes}</em></div>
                    {activeAlert.acknowledgedAt && (
                      <div className="font-mono text-[10px] text-slate-400">
                        Timestamp: {new Date(activeAlert.acknowledgedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ---------------- VIEW 2: MAINTENANCE WORK ORDERS ---------------- */}
      {activeTab === 'workOrders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Gram Panchayat Siltation &amp; Drainage Work Orders ({workOrders.length})
            </h3>
            <button
              onClick={() => setIsWorkOrderModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Work Order</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {workOrders.map((wo) => {
              const isCleared = wo.status === 'CLEARED';
              return (
                <div
                  key={wo.id}
                  className={`rounded-xl border p-4 space-y-3 ${
                    isCleared ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-amber-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {wo.id} • Node {wo.nodeCode}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        isCleared
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {wo.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{wo.segment}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{wo.localityName} • Suspected at: {wo.suspectedLocation}</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] space-y-1">
                    <div><strong>Assigned Team:</strong> {wo.assignedPersonnel}</div>
                    <div><strong>Operational Notes:</strong> {wo.notes}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Created: {new Date(wo.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {!isCleared && onResolveWorkOrder && (
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onResolveWorkOrder(wo.id, 'Obstruction dredged. Natural flow velocity restored.')}
                        className="rounded-lg bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                      >
                        Confirm Drainage Cleared →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- VIEW 3: COMMUNICATION DISPATCH LOGS ---------------- */}
      {activeTab === 'comms' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Log ID</th>
                  <th className="px-4 py-3">Recipient &amp; Role</th>
                  <th className="px-4 py-3">Mobile Number</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Message Summary</th>
                  <th className="px-4 py-3">Delivery Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {commLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-900">
                      {log.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{log.recipientName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{log.recipientType}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{log.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.channel === 'SMS' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {log.channel === 'SMS' ? <MessageSquare className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 uppercase font-mono text-[10px] text-slate-500">
                      {log.language}
                    </td>
                    <td className="px-4 py-3 text-[11px] max-w-xs truncate text-slate-800" title={log.messageContent}>
                      {log.messageContent}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'QUEUED_OFFLINE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status === 'DELIVERED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {onResendNotification && (
                        <button
                          onClick={() => onResendNotification(log.id)}
                          title="Resend notification"
                          className="rounded p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Acknowledge Alert Modal */}
      {acknowledgingAlertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">
                Acknowledge Alert [{acknowledgingAlertId}]
              </h4>
              <button
                onClick={() => setAcknowledgingAlertId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operator / Officer Name</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Field Inspection Notes</label>
              <textarea
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAcknowledgingAlertId(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcknowledge}
                className="rounded-lg bg-emerald-800 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
              >
                Confirm Acknowledgement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      {isWorkOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">
                Create Siltation &amp; Drainage Work Order
              </h4>
              <button
                onClick={() => setIsWorkOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateWorkOrderSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Monitoring Node</label>
                <input
                  type="text"
                  value={newWorkOrder.nodeCode}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, nodeCode: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drainage Segment / Channel</label>
                <input
                  type="text"
                  value={newWorkOrder.segment}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, segment: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Maintenance Team</label>
                <input
                  type="text"
                  value={newWorkOrder.assignedPersonnel}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, assignedPersonnel: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operation Details</label>
                <textarea
                  value={newWorkOrder.notes}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWorkOrderModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-800 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
