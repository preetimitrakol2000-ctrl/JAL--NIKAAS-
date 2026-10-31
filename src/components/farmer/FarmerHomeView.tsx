/**
 * Jal-Nikaas: Farmer Interface Home View
 * High simplicity, large visual indicators, observable field status, actionable voice advisories
 */

import React from 'react';
import {
  AgriculturalArea,
  LocationData,
  AlertItem,
  CropInfo,
  Language,
  AreaRecommendation,
  HistoricalIncident,
  AgriculturalPlot,
  FarmerTab,
} from '../../types';
import { getTranslation } from '../../utils/i18n';
import { VoicePlayer } from '../common/VoicePlayer';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Droplets,
  Sprout,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  Clock,
  Volume2,
  ChevronRight,
  PhoneCall,
  Waves,
  ArrowRight,
  ArrowLeft,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface FarmerHomeViewProps {
  areas: AgriculturalArea[];
  selectedAreaId: string;
  onSelectArea: (areaId: string) => void;
  location: LocationData;
  alerts: AlertItem[];
  crops: CropInfo[];
  plots?: AgriculturalPlot[];
  recommendation?: AreaRecommendation;
  recentIncidents: HistoricalIncident[];
  language: Language;
  onNavigateTab: (tab: FarmerTab) => void;
}

export const FarmerHomeView: React.FC<FarmerHomeViewProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  location,
  alerts,
  crops,
  plots = [],
  recommendation,
  recentIncidents,
  language,
  onNavigateTab,
}) => {
  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0];

  const getLocalizedAreaName = (area: AgriculturalArea) => {
    if (language === 'bn') return area.localNameBengali || area.name;
    if (language === 'hi') return area.localNameHindi || area.name;
    return area.name;
  };

  const getAdvisoryText = () => {
    if (!recommendation) {
      if (language === 'bn') return 'আপনার জমিতে জলস্তর নিরাপদ রয়েছে। সাধারণ পরিচর্যা চালিয়ে যান।';
      if (language === 'hi') return 'आपके खेत में जलस्तर सुरक्षित है। सामान्य निगरानी जारी रखें।';
      return 'Water levels in your area are currently safe. Continue regular field monitoring.';
    }
    if (language === 'bn') return recommendation.farmerAdvisoryBengali;
    if (language === 'hi') return recommendation.farmerAdvisoryHindi;
    return recommendation.farmerAdvisory;
  };

  // Robust Risk Level Classification covering all risk engine outputs
  const isCritical = location.riskLevel === 'CRITICAL' || (location.riskLevel as string) === 'SUBMERGENCE_ALERT';
  const isDanger = location.riskLevel === 'DANGER' || (location.riskLevel as string) === 'BACKFLOW_RISK';
  const isWarning = location.riskLevel === 'WARNING';
  const isElevated = location.riskLevel === 'ELEVATED';
  const isFault = location.riskLevel === 'SENSOR_FAULT';
  const isSafe = !isCritical && !isDanger && !isWarning && !isElevated && !isFault;

  const getStatusTitle = () => {
    if (isCritical) {
      if (language === 'bn') return 'বিপদ — জমিতে অতি বিপজ্জনক জলাবদ্ধতা!';
      if (language === 'hi') return 'खतरा — खेत में गंभीर जलभराव!';
      return 'CRITICAL — Severe Waterlogging Inundation!';
    }
    if (isDanger) {
      if (language === 'bn') return 'বিপদজনক — খালের জল উল্টো জমিতে ঢুকছে!';
      if (language === 'hi') return 'खतरा — नहर का पानी खेत में घुस रहा है!';
      return 'DANGER — Canal Water Backflow / Severe Surge!';
    }
    if (isWarning) {
      if (language === 'bn') return 'সতর্কতা — জলস্তর সতর্কতামূলক সীমায়';
      if (language === 'hi') return 'सावधानी — जलस्तर चेतावनी स्तर पर';
      return 'WARNING — Water Approaching Caution Limit';
    }
    if (isElevated) {
      if (language === 'bn') return 'উন্নীত — জমিতে জল জমতে শুরু করেছে';
      if (language === 'hi') return 'बढ़ता हुआ — खेत में पानी जमा होना शुरू';
      return 'ELEVATED — Moderate Water Accumulation';
    }
    if (isFault) {
      if (language === 'bn') return 'সেন্সর অফলাইন — মাঠে গিয়ে নিজে দেখুন';
      if (language === 'hi') return 'सेंसर ऑफलाइन — खेत में स्वयं जांच करें';
      return 'SENSOR OFFLINE — Inspect Field Manually';
    }
    if (language === 'bn') return 'নিরাপদ — জল স্বাভাবিকভাবে নামছে';
    if (language === 'hi') return 'सुरक्षित — पानी सामान्य रूप से निकल रहा है';
    return 'SAFE — Water Draining Normally';
  };

  const getStatusDescription = () => {
    if (isCritical) {
      if (language === 'bn') return 'জমির জলস্তর ফসলের শিকড় ডুবিয়ে দিচ্ছে। দ্রুত পার্শ্ববর্তী নালা কেটে নিকাশী করুন এবং পাম্প চালান।';
      if (language === 'hi') return 'खेत में पानी फसल के डूबने की सीमा पार कर रहा है। तुरंत नालियां खोलें व पंप चलाएं।';
      return 'Water depth is exceeding critical root inundation thresholds. Dig drainage furrows and deploy de-watering pumps immediately.';
    }
    if (isDanger) {
      if (language === 'bn') return 'খালের জলস্তর আপনার জমির চেয়ে বেশি। খালের জল যাতে জমিতে না ঢোকে সেজন্য ইনলেট গেট শক্ত করে বন্ধ রাখুন।';
      if (language === 'hi') return 'नहर का पानी आपके खेत से ऊपर है। खेत में पानी घुसने से रोकने के लिए इनलेट गेट तुरंत बंद रखें।';
      return 'Canal water is higher than your field furrow. Keep field inlet gates tightly shut to prevent reverse tidal ingress.';
    }
    if (isWarning) {
      if (language === 'bn') return 'জমিতে জল জমছে এবং নিকাশীর গতি মন্থর। আইল ও নালার আগাছা পরিষ্কার রাখুন।';
      if (language === 'hi') return 'खेत में पानी जमा हो रहा है और बहाव धीमा है। मेड़ और नालियों के अवरोध साफ रखें।';
      return 'Water accumulation is nearing caution threshold. Clear weed debris from ditch exits and inspect field bunds.';
    }
    if (isElevated) {
      if (language === 'bn') return 'জলস্তর সাধারণের চেয়ে সামান্য বেশি, তবে এখনও ফসলের সহনশীলতার ভেতরে রয়েছে।';
      if (language === 'hi') return 'जलस्तर सामान्य से थोड़ा अधिक है, परंतु अभी फसल के लिए सहनीय सीमा में है।';
      return 'Water level is elevated above baseline but remains safely within crop tolerance limits.';
    }
    if (isFault) {
      if (language === 'bn') return 'টেলিমেট্রি সংযোগে সাময়িক সমস্যা। নিজের চোখে গিয়ে জমির জলস্তর দেখে আসুন।';
      if (language === 'hi') return 'सेंसर से संपर्क बाधित। स्वयं जाकर खेत की जल निकासी का निरीक्षण करें।';
      return 'Telemetry link temporarily unreachable. Visually verify field furrow drainage.';
    }
    if (language === 'bn') return 'জমির নিকাশী পুরোপুরি স্বাভাবিক। জল অবাধে স্লুইস গেট ও মূল খালের দিকে নেমে যাচ্ছে।';
    if (language === 'hi') return 'जल निकासी सुचारू है। पानी बिना किसी रुकावट के मुख्य नहर की ओर बह रहा है।';
    return 'Water is draining smoothly toward the outfall canal without obstructions.';
  };

  // Hydraulic figures
  const farmLevel = location.farmSideSensor?.levelCm ?? 0;
  const canalLevel = location.downstreamSensor?.levelCm ?? 0;
  const diff = location.differentialLevelCm;
  const isDrainingAway = diff > 0;

  // Filter plots for this area
  const areaPlots = plots.filter((p) => p.localityId === selectedArea.id);

  // Active crops for this area
  const areaCrops = crops.filter((c) =>
    selectedArea.primaryCropIds.includes(c.id)
  );

  // Gauge calculations (0 - 120 cm range)
  const gaugePercent = Math.min(100, Math.max(0, (farmLevel / 100) * 100));

  return (
    <div className="space-y-6">
      {/* Area Selector Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-700" />
            {getTranslation(language, 'select_your_area')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {getLocalizedAreaName(selectedArea)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {selectedArea.block} Block • {selectedArea.district} District • {selectedArea.acreageHectares} Hectares Farmland
          </p>
        </div>

        {/* Quick Area Dropdown */}
        <select
          value={selectedArea.id}
          onChange={(e) => onSelectArea(e.target.value)}
          className="rounded-xl border-2 border-emerald-600 bg-emerald-50/50 px-4 py-2.5 text-sm font-bold text-emerald-900 focus:outline-emerald-700 shadow-xs cursor-pointer"
        >
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {getLocalizedAreaName(a)}
            </option>
          ))}
        </select>
      </div>

      {/* =========================================================================
          OBSERVABLE FIELD STATUS HERO CARD
          Explicitly displays status, color indicators, depth numbers, and actionable description
         ========================================================================= */}
      <div
        className={`rounded-2xl border-2 p-6 shadow-sm transition-all ${
          isCritical
            ? 'border-red-600 bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 text-red-950'
            : isDanger
            ? 'border-rose-600 bg-gradient-to-br from-rose-50 via-red-50 to-amber-50 text-rose-950'
            : isWarning
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-amber-950'
            : isElevated
            ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 via-amber-50 to-stone-50 text-yellow-950'
            : isFault
            ? 'border-slate-400 bg-slate-50 text-slate-900'
            : 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 text-emerald-950'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Dynamic Status Icon */}
            <div
              className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl shadow-md ${
                isCritical
                  ? 'bg-red-600 text-white animate-bounce'
                  : isDanger
                  ? 'bg-rose-600 text-white animate-pulse'
                  : isWarning
                  ? 'bg-amber-500 text-white animate-pulse'
                  : isElevated
                  ? 'bg-yellow-600 text-white'
                  : isFault
                  ? 'bg-slate-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isCritical && <AlertOctagon className="h-10 w-10 sm:h-12 sm:w-12" />}
              {isDanger && <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12" />}
              {isWarning && <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12" />}
              {isElevated && <Droplets className="h-10 w-10 sm:h-12 sm:w-12" />}
              {isFault && <Droplets className="h-10 w-10 sm:h-12 sm:w-12" />}
              {isSafe && <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest opacity-80">
                  {language === 'bn' ? 'জমির বর্তমান অবস্থা' : language === 'hi' ? 'खेत की वर्तमान स्थिति' : 'Real-Time Field Status'}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                    isCritical
                      ? 'bg-red-200 text-red-900'
                      : isDanger
                      ? 'bg-rose-200 text-rose-900'
                      : isWarning
                      ? 'bg-amber-200 text-amber-900'
                      : isElevated
                      ? 'bg-yellow-200 text-yellow-900'
                      : isFault
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {location.riskLevel}
                </span>
              </div>

              {/* Title is guaranteed never to be empty */}
              <h3 className="text-2xl sm:text-3xl font-black mt-1">
                {getStatusTitle()}
              </h3>

              {/* Actionable localized description is guaranteed never to be empty */}
              <p className="mt-1.5 text-sm sm:text-base font-medium opacity-90 max-w-2xl leading-relaxed">
                {getStatusDescription()}
              </p>
            </div>
          </div>

          {/* Water Depth Readout Box */}
          <div className="rounded-xl bg-white/95 p-4 border border-slate-200/80 shadow-xs min-w-[170px] text-center self-stretch sm:self-auto flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              {language === 'bn' ? 'জমিতে জলস্তর' : language === 'hi' ? 'खेत में जलस्तर' : 'Field Water Depth'}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 mt-0.5">
              {location.farmSideSensor.levelCm !== null
                ? `${location.farmSideSensor.levelCm} cm`
                : 'N/A'}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs font-bold">
              {location.rateOfRiseCmHr > 0.5 ? (
                <span className="text-red-600 flex items-center gap-0.5">
                  <ArrowUpRight className="h-4 w-4" />
                  {language === 'bn' ? 'জল বাড়ছে' : language === 'hi' ? 'जल बढ़ रहा है' : 'Rising'} (+{location.rateOfRiseCmHr} cm/h)
                </span>
              ) : location.rateOfRiseCmHr < -0.5 ? (
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <ArrowDownRight className="h-4 w-4" />
                  {language === 'bn' ? 'জল কমছে' : language === 'hi' ? 'जल घट रहा है' : 'Draining'} ({location.rateOfRiseCmHr} cm/h)
                </span>
              ) : (
                <span className="text-slate-600 flex items-center gap-0.5">
                  <Minus className="h-3 w-3" />
                  {language === 'bn' ? 'স্থির রয়েছে' : language === 'hi' ? 'स्थिर' : 'Stable'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            OBSERVABLE WATER DEPTH GAUGE (Safe / Caution / Submergence)
           ------------------------------------------------------------- */}
        <div className="mt-6 pt-5 border-t border-black/10">
          <div className="flex flex-wrap items-center justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 opacity-90">
              <Activity className="h-4 w-4 text-emerald-800" />
              {language === 'bn' ? 'জলাবদ্ধতা গভীরতা মিটার' : language === 'hi' ? 'जलभराव गहराई गेज' : 'Water Inundation Gauge'}
            </span>
            <span className="font-mono">
              {language === 'bn' ? 'বর্তমান গভীরতা:' : language === 'hi' ? 'वर्तमान स्तर:' : 'Current:'}{' '}
              <strong className="underline decoration-2">{farmLevel} cm</strong>
            </span>
          </div>

          {/* Visual Multi-Zone Gauge */}
          <div className="relative h-4 w-full rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
            {/* Safe 0-40cm (40%) */}
            <div
              className="h-full bg-emerald-500"
              style={{ width: '40%' }}
              title="Safe Zone (0 - 40 cm)"
            />
            {/* Caution 40-70cm (30%) */}
            <div
              className="h-full bg-amber-400"
              style={{ width: '30%' }}
              title="Caution Zone (40 - 70 cm)"
            />
            {/* Critical 70-100cm+ (30%) */}
            <div
              className="h-full bg-red-600"
              style={{ width: '30%' }}
              title="Critical Submergence (> 70 cm)"
            />
          </div>

          {/* Gauge Labels */}
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 mt-1.5">
            <span className="text-emerald-700">0 cm ({language === 'bn' ? 'নিরাপদ' : language === 'hi' ? 'सुरक्षित' : 'Safe'})</span>
            <span className="text-amber-700">40 cm ({language === 'bn' ? 'সতর্কতা' : language === 'hi' ? 'सावधानी' : 'Caution'})</span>
            <span className="text-red-700">70+ cm ({language === 'bn' ? 'বিপজ্জনক তলিয়ে যাওয়া' : language === 'hi' ? 'गंभीर जलमग्न' : 'Critical Submergence'})</span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            OBSERVABLE CANAL FLOW DIRECTION & DIFFERENTIAL READOUT
           ------------------------------------------------------------- */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Farm-Side Intake */}
          <div className="rounded-xl bg-white/80 p-3.5 border border-slate-200 text-center">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              {language === 'bn' ? 'জমির প্রান্তের ইনটেক' : language === 'hi' ? 'खेत का इनटेक स्तर' : 'Your Farm Inflow'}
            </span>
            <div className="text-2xl font-black font-mono text-emerald-800 mt-0.5">
              {farmLevel} cm
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              {farmLevel > 70
                ? language === 'bn' ? 'আইল ছাপিয়ে জল' : language === 'hi' ? 'मेड़ से ऊपर पानी' : 'Submerged over ridges'
                : farmLevel > 40
                ? language === 'bn' ? 'মাঝারি জল জমেছে' : language === 'hi' ? 'मध्यम जल जमाव' : 'Caution furrow level'
                : language === 'bn' ? 'স্বাভাবিক আর্দ্রতা' : language === 'hi' ? 'सामान्य नमी' : 'Normal moisture depth'}
            </p>
          </div>

          {/* Differential Flow Vector */}
          <div
            className={`rounded-xl p-3.5 border text-center flex flex-col justify-center items-center ${
              isDrainingAway
                ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950'
                : 'bg-amber-100/90 border-amber-300 text-amber-950'
            }`}
          >
            <span className="text-[11px] font-black uppercase tracking-wider">
              {language === 'bn' ? 'নিকাশী নালার ঢাল (Δh)' : language === 'hi' ? 'जल निकासी ढाल (Δh)' : 'Drainage Gradient (Δh)'}
            </span>
            <div className="text-xl font-black font-mono mt-0.5 flex items-center gap-1">
              <span>{diff > 0 ? `+${diff}` : diff} cm</span>
              {isDrainingAway ? (
                <ArrowRight className="h-5 w-5 text-emerald-700" />
              ) : (
                <ArrowLeft className="h-5 w-5 text-amber-700" />
              )}
            </div>
            <p className="text-[11px] font-bold mt-0.5">
              {isDrainingAway
                ? language === 'bn'
                  ? 'জমি থেকে খালে স্বাভাবিক নিকাশী হচ্ছে'
                  : language === 'hi'
                  ? 'खेत से नहर में सामान्य निकासी जारी'
                  : 'Outward flow to canal (Safe)'
                : language === 'bn'
                  ? 'খালের জল জমিতে উল্টো ঢুকছে — গেট বন্ধ রাখুন'
                  : language === 'hi'
                  ? 'नहर का पानी उल्टे खेत में आ रहा है — गेट बंद रखें'
                  : 'Reverse backflow into field — Close inlet gates!'}
            </p>
          </div>

          {/* Downstream Canal */}
          <div className="rounded-xl bg-white/80 p-3.5 border border-slate-200 text-center">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              {language === 'bn' ? 'নিকাশী খালের জলস্তর' : language === 'hi' ? 'निकास नहर का स्तर' : 'Downstream Canal'}
            </span>
            <div className="text-2xl font-black font-mono text-sky-800 mt-0.5">
              {canalLevel} cm
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium truncate" title={selectedArea.canalJunction}>
              {selectedArea.canalJunction}
            </p>
          </div>
        </div>

        {/* Quick Navigate Button to Full Field Diagrams */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onNavigateTab('field')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-black underline underline-offset-4 decoration-slate-400 hover:decoration-black cursor-pointer"
          >
            <span>{language === 'bn' ? 'সম্পূর্ণ নিকাশী চিত্র ও চার্ট দেখুন' : language === 'hi' ? 'विस्तृत नहर एवं जल आरेख देखें' : 'Inspect Full Canal Hydraulic Diagram & Charts'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          OBSERVABLE PLOTS IN THIS AREA
          Lists real-time waterlogging hours, standing water depth, and damage timeline
         ========================================================================= */}
      {areaPlots.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-700" />
              <div>
                <h4 className="font-black text-base text-slate-900">
                  {language === 'bn' ? 'এই এলাকার জমিগুলির জলাবদ্ধতার স্থিতি' : language === 'hi' ? 'इस क्षेत्र के खेतों में जलभराव की स्थिति' : 'Observable Plot-by-Plot Waterlogging Status'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? `${areaPlots.length} টি নিবন্ধিত কৃষি প্লট পর্যবেক্ষণাধীন` : language === 'hi' ? `${areaPlots.length} पंजीकृत खेत निगरानी में हैं` : `${areaPlots.length} registered plots monitored in this basin`}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('field')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সকল প্লট বিশদ' : language === 'hi' ? 'सभी खेत विवरण' : 'All Plot Details'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {areaPlots.map((plot) => {
              const isPlotCritical = plot.currentStatus === 'CRITICAL_WATERLOGGED';
              const isPlotRisk = plot.currentStatus === 'AT_RISK';
              return (
                <div
                  key={plot.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                    isPlotCritical
                      ? 'border-red-300 bg-red-50/60 shadow-xs'
                      : isPlotRisk
                      ? 'border-amber-300 bg-amber-50/60'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs text-slate-900 truncate" title={plot.name}>
                        {plot.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black shrink-0 ${
                          isPlotCritical
                            ? 'bg-red-600 text-white'
                            : isPlotRisk
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isPlotCritical
                          ? language === 'bn' ? 'অতি জলাবদ্ধ' : language === 'hi' ? 'अत्यधिक जलभराव' : 'Critical Inundation'
                          : isPlotRisk
                          ? language === 'bn' ? 'ঝুঁকিপূর্ণ' : language === 'hi' ? 'जोखिम में' : 'At Risk'
                          : language === 'bn' ? 'নিরাপদ' : language === 'hi' ? 'सुरक्षित' : 'Safe'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{plot.farmerName}</span>
                      <span className="font-semibold text-slate-700">{plot.cropName}</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'bn' ? 'জলস্তর:' : language === 'hi' ? 'जलस्तर:' : 'Water Depth:'}
                        </span>
                        <strong className="font-mono text-slate-900 text-sm">
                          {plot.currentWaterDepthCm} cm
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'bn' ? 'জলাবদ্ধ সময়:' : language === 'hi' ? 'जलभराव समय:' : 'Waterlogged:'}
                        </span>
                        <strong className="font-mono text-slate-900 text-sm">
                          {plot.hoursWaterlogged}h / {plot.criticalHours}h
                        </strong>
                      </div>
                    </div>
                  </div>

                  {plot.hoursToCriticalDamage !== null && (
                    <div className="mt-2.5 pt-1.5 border-t border-slate-200/40 text-[11px] font-bold">
                      {plot.hoursToCriticalDamage <= 10 ? (
                        <span className="text-red-700">
                          ⚠️ {language === 'bn' ? `ক্ষতি হতে বাকি: ${plot.hoursToCriticalDamage} ঘণ্টা!` : language === 'hi' ? `नुकसान में शेष: ${plot.hoursToCriticalDamage} घंटे!` : `${plot.hoursToCriticalDamage} hrs to critical damage!`}
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          ⏱️ {language === 'bn' ? `সহনশীল বাকি: ${plot.hoursToCriticalDamage} ঘণ্টা` : language === 'hi' ? `सहनीय शेष: ${plot.hoursToCriticalDamage} घंटे` : `${plot.hoursToCriticalDamage} hrs tolerance remaining`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Voice Advisory Card (Prominent & Voice-Enabled) */}
      <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-700 p-2 text-white">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'bn' ? 'আজকের জরুরি কৃষক পরামর্শ' : language === 'hi' ? 'आज की महत्वपूर्ण किसान सलाह' : 'Today\'s Actionable Advisory'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? 'পরামর্শটি শুনতে স্পিকার বোতামে চাপ দিন' : language === 'hi' ? 'सलाह सुनने के लिए स्पीकर बटन दबाएं' : 'Click the speaker button to listen to audio advice'}
              </p>
            </div>
          </div>

          {/* Voice Player */}
          <VoicePlayer
            text={getAdvisoryText()}
            language={language}
            size="lg"
            variant="primary"
          />
        </div>

        {/* Advisory Text Display */}
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          "{getAdvisoryText()}"
        </p>

        {/* Local Contact Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-emerald-700" />
            <span>
              {language === 'bn'
                ? `স্থানীয় পঞ্চায়েত বা সেচ সহকারী: ${selectedArea.block} ব্লক কন্ট্রোল রুম`
                : language === 'hi'
                ? `स्थानीय पंचायत अथवा सिंचाई सहायक: ${selectedArea.block} ब्लॉक नियंत्रण कक्ष`
                : `Local Panchayat Drainage Contact: ${selectedArea.block} Block Assistance`}
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('recommendations')}
            className="flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সকল পরামর্শ দেখুন' : language === 'hi' ? 'सभी सलाह देखें' : 'View All Guidance'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Two Column Section: My Crops & Recent Area Incidents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Crops in this Area */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-700" />
              <h4 className="font-bold text-base text-slate-900">
                {language === 'bn' ? 'এই এলাকার প্রধান ফসল' : language === 'hi' ? 'इस क्षेत्र की प्रमुख फसलें' : 'Crops in this Agricultural Zone'}
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('field')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              {language === 'bn' ? 'বিস্তারিত' : language === 'hi' ? 'विवरण' : 'Details →'}
            </button>
          </div>

          <div className="space-y-3">
            {areaCrops.map((crop) => {
              const isCropAtRisk = crop.currentRisk !== 'NORMAL';
              return (
                <div
                  key={crop.id}
                  className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">
                      {language === 'bn'
                        ? crop.localNameBengali
                        : language === 'hi'
                        ? crop.localNameHindi
                        : crop.name}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn' ? `সর্বোচ্চ সহনশীলতা: ${crop.criticalHours} ঘণ্টা` : language === 'hi' ? `अधिकतम सहनशीलता: ${crop.criticalHours} घंटे` : `Max tolerance: ${crop.criticalHours} hrs`}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isCropAtRisk
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isCropAtRisk
                      ? language === 'bn' ? 'ঝুঁকি রয়েছে' : language === 'hi' ? 'जोखिम में' : 'At Risk'
                      : language === 'bn' ? 'নিরাপদ' : language === 'hi' ? 'सुरक्षित' : 'Safe'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Waterlogging Incidents in this Area */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-700" />
              <h4 className="font-bold text-base text-slate-900">
                {language === 'bn' ? 'এই এলাকার অতীত জলাবদ্ধতা রেকর্ড' : language === 'hi' ? 'इस क्षेत्र का पिछला जलभराव रिकॉर्ड' : 'Recent Area Waterlogging Events'}
              </h4>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {recentIncidents.length} {language === 'bn' ? 'টি ঘটনা' : language === 'hi' ? 'घटनाएं' : 'Recorded'}
            </span>
          </div>

          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No major historical flood incidents recorded for this area.
              </p>
            ) : (
              recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      {inc.startDate.split(' ')[0]} ({inc.incidentType.replace('_', ' ')})
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-700">
                      Peak: {inc.peakWaterLevelCm} cm
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {inc.description}
                  </p>
                  <div className="text-[11px] font-medium text-emerald-800 pt-1">
                    ✓ Outcome: {inc.outcome}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
