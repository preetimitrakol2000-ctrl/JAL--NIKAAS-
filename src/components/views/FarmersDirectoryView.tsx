/**
 * Jal-Nikaas: Farmers & Agricultural Plots Directory View
 * Recipient management, plot-level risk analysis, crop vulnerability, and communication preferences
 */

import React, { useState } from 'react';
import {
  FarmerRecord,
  AgriculturalPlot,
  AgriculturalArea,
  Language,
} from '../../types';
import {
  Users,
  Sprout,
  Search,
  Filter,
  Plus,
  Phone,
  MessageSquare,
  Volume2,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
  Edit2,
  Send,
} from 'lucide-react';

interface FarmersDirectoryViewProps {
  farmers: FarmerRecord[];
  plots: AgriculturalPlot[];
  areas: AgriculturalArea[];
  language: Language;
  onAddFarmer?: (farmer: FarmerRecord) => void;
  onUpdateFarmer?: (farmer: FarmerRecord) => void;
  onDispatchTestAlert?: (farmer: FarmerRecord, channel: 'SMS' | 'IVR') => void;
}

export const FarmersDirectoryView: React.FC<FarmersDirectoryViewProps> = ({
  farmers,
  plots,
  areas,
  language,
  onAddFarmer,
  onUpdateFarmer,
  onDispatchTestAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'farmers' | 'plots'>('farmers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<FarmerRecord | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState<Partial<FarmerRecord>>({
    name: '',
    phone: '',
    localityId: 'LOC-DHR-A',
    primaryCrop: 'Pointed Gourd (Potol)',
    language: 'bn',
    notificationMethod: 'SMS_AND_IVR',
    plotIds: [],
  });

  const filteredFarmers = farmers.filter((f) => {
    if (selectedLocality !== 'ALL' && f.localityId !== selectedLocality) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.primaryCrop.toLowerCase().includes(q) ||
        f.localityName.toLowerCase().includes(q) ||
        f.plotIds.some((p) => p.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredPlots = plots.filter((p) => {
    if (selectedLocality !== 'ALL' && p.localityId !== selectedLocality) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.farmerName.toLowerCase().includes(q) ||
        p.nodeCode.toLowerCase().includes(q) ||
        p.cropName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      phone: '+91-98300-',
      localityId: 'LOC-DHR-A',
      primaryCrop: 'Pointed Gourd (Potol)',
      language: 'bn',
      notificationMethod: 'SMS_AND_IVR',
      plotIds: [],
    });
    setEditingFarmer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (farmer: FarmerRecord) => {
    setFormData({ ...farmer });
    setEditingFarmer(farmer);
    setIsAddModalOpen(true);
  };

  const handleSaveFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const matchedArea = areas.find((a) => a.id === formData.localityId) || areas[0];

    if (editingFarmer) {
      const updated: FarmerRecord = {
        ...editingFarmer,
        name: formData.name!,
        phone: formData.phone!,
        localityId: formData.localityId!,
        localityName: matchedArea.name,
        primaryCrop: formData.primaryCrop || 'Pointed Gourd (Potol)',
        language: formData.language || 'bn',
        notificationMethod: formData.notificationMethod || 'SMS_AND_IVR',
        plotIds: formData.plotIds || [],
      };
      if (onUpdateFarmer) onUpdateFarmer(updated);
      setFeedbackMsg(`Farmer ${updated.name} updated successfully.`);
    } else {
      const newFarmer: FarmerRecord = {
        id: `FARMER-${Date.now().toString().slice(-4)}`,
        name: formData.name!,
        phone: formData.phone!,
        localityId: formData.localityId!,
        localityName: matchedArea.name,
        primaryCrop: formData.primaryCrop || 'Pointed Gourd (Potol)',
        language: formData.language || 'bn',
        notificationMethod: formData.notificationMethod || 'SMS_AND_IVR',
        plotIds: formData.plotIds || [`PLOT-${Date.now().toString().slice(-3)}`],
        registeredAt: new Date().toISOString().split('T')[0],
      };
      if (onAddFarmer) onAddFarmer(newFarmer);
      setFeedbackMsg(`New farmer ${newFarmer.name} registered successfully.`);
    }

    setIsAddModalOpen(false);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleTestDispatch = (farmer: FarmerRecord, channel: 'SMS' | 'IVR') => {
    if (onDispatchTestAlert) {
      onDispatchTestAlert(farmer, channel);
    }
    setFeedbackMsg(`Test ${channel} alert sent to ${farmer.name} (${farmer.phone}).`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">
              Registered Farmers &amp; Agricultural Plots Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Plot-level submergence vulnerability, Gram Panchayat contacts, multilingual SMS/IVR recipient preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Farmer</span>
          </button>
        </div>
      </div>

      {/* Confirmation feedback */}
      {feedbackMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Filters and Sub-tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('farmers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'farmers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Registered Farmers ({farmers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('plots')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'plots'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="h-3.5 w-3.5" />
            <span>Agricultural Plots ({plots.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Locality Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-emerald-600"
            >
              <option value="ALL">All 4 Localities</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'farmers' ? 'Search farmer name, phone, crop...' : 'Search plot, farmer, crop, node...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-64 rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* ---------------- VIEW 1: REGISTERED FARMERS TABLE ---------------- */}
      {activeTab === 'farmers' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Farmer &amp; ID</th>
                  <th className="px-4 py-3">Mobile Phone</th>
                  <th className="px-4 py-3">Locality</th>
                  <th className="px-4 py-3">Linked Plots</th>
                  <th className="px-4 py-3">Primary Crop</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Notification Channel</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredFarmers.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{f.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{f.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{f.localityName.split('/')[0]}</div>
                      <div className="text-[10px] text-slate-400">{f.localityId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {f.plotIds.map((pid) => (
                          <span key={pid} className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {pid}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-800">{f.primaryCrop}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                        {f.language === 'bn' ? 'বাংলা (BN)' : f.language === 'hi' ? 'हिन्दी (HI)' : 'English (EN)'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {f.notificationMethod.includes('SMS') && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            <MessageSquare className="h-3 w-3" /> SMS
                          </span>
                        )}
                        {f.notificationMethod.includes('IVR') && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            <Volume2 className="h-3 w-3" /> IVR Call
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTestDispatch(f, 'SMS')}
                          title="Simulate SMS Alert Dispatch"
                          className="rounded p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleTestDispatch(f, 'IVR')}
                          title="Simulate IVR Voice Call"
                          className="rounded p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(f)}
                          title="Edit Farmer Record"
                          className="rounded p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- VIEW 2: AGRICULTURAL PLOTS TABLE ---------------- */}
      {activeTab === 'plots' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Plot ID &amp; Name</th>
                  <th className="px-4 py-3">Locality &amp; Monitoring Node</th>
                  <th className="px-4 py-3">Farmer</th>
                  <th className="px-4 py-3">Area &amp; Elevation</th>
                  <th className="px-4 py-3">Crop &amp; Growth Stage</th>
                  <th className="px-4 py-3">Current Water Depth</th>
                  <th className="px-4 py-3">Vulnerability Status</th>
                  <th className="px-4 py-3">Hours to Damage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPlots.map((p) => {
                  let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  let statusIcon = ShieldCheck;
                  let statusLabel = 'Safe';

                  if (p.currentStatus === 'CRITICAL_WATERLOGGED') {
                    statusBg = 'bg-red-50 text-red-800 border-red-300';
                    statusIcon = Flame;
                    statusLabel = 'Critical Submerged';
                  } else if (p.currentStatus === 'AT_RISK') {
                    statusBg = 'bg-amber-50 text-amber-800 border-amber-300';
                    statusIcon = AlertTriangle;
                    statusLabel = 'Elevated Risk';
                  }

                  const StatusIcon = statusIcon;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{p.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800">{p.localityName.split('/')[0]}</div>
                        <div className="font-mono text-[10px] text-emerald-700 font-bold">Node: {p.nodeCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">{p.farmerName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div>{p.acreageHectares} ha</div>
                        <div className="text-[10px] text-slate-400">{p.elevationMeters}m MSL • {p.soilType}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-emerald-800">{p.cropName}</div>
                        <div className="text-[10px] text-slate-500">{p.cropStage}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={p.currentWaterDepthCm > p.maxStandingWaterCm ? 'text-red-700 font-bold' : 'text-slate-700'}>
                          {p.currentWaterDepthCm} cm
                        </span>
                        <div className="text-[10px] text-slate-400">Tolerance: {p.maxStandingWaterCm} cm</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${statusBg}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {p.hoursToCriticalDamage !== null ? (
                          <div className={p.hoursToCriticalDamage <= 6 ? 'text-red-700 font-bold flex items-center gap-1' : 'text-slate-700'}>
                            <Clock className="h-3 w-3 inline text-slate-400" />
                            {p.hoursToCriticalDamage} hrs remaining
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans text-[11px]">Normal drainage</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- ADD / EDIT FARMER MODAL ---------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingFarmer ? 'Edit Farmer Profile & Notification Settings' : 'Register New Farmer & Assign Plots'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFarmer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra Das"
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (for SMS/IVR)</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91-98300-XXXXX"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-800 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Locality / Basin</label>
                  <select
                    value={formData.localityId}
                    onChange={(e) => setFormData({ ...formData, localityId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Agricultural Crop</label>
                  <select
                    value={formData.primaryCrop}
                    onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
                  >
                    <option value="Pointed Gourd (Potol)">Pointed Gourd (Potol)</option>
                    <option value="Aman Paddy">Aman Paddy</option>
                    <option value="Brinjal">Brinjal / Eggplant</option>
                    <option value="Green Chilli">Green Chilli</option>
                    <option value="Betel Vine (Pan Baroj)">Betel Vine (Pan Baroj)</option>
                    <option value="Boro Paddy">Boro Paddy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advisory Audio Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-emerald-600"
                  >
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alert Channel Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'SMS_AND_IVR', label: 'SMS & Voice Call' },
                    { id: 'SMS_ONLY', label: 'SMS Only' },
                    { id: 'IVR_ONLY', label: 'Voice Call Only' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, notificationMethod: m.id as any })}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        formData.notificationMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  {editingFarmer ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
