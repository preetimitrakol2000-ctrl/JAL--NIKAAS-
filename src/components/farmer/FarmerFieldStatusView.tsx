/**
 * Jal-Nikaas: Farmer Interface - My Field / Area Status View
 * Visual water depth illustration, simple canal drainage gradient, and crop risk
 */

import React from 'react';
import { AgriculturalArea, LocationData, CropInfo, Language } from '../../types';
import { Droplet, ArrowDown, ArrowUp, AlertTriangle, ShieldCheck, Sprout } from 'lucide-react';
import { VoicePlayer } from '../common/VoicePlayer';

interface FarmerFieldStatusViewProps {
  area: AgriculturalArea;
  location: LocationData;
  crops: CropInfo[];
  language: Language;
}

export const FarmerFieldStatusView: React.FC<FarmerFieldStatusViewProps> = ({
  area,
  location,
  crops,
  language,
}) => {
  const farmLevel = location.farmSideSensor.levelCm || 0;
  const canalLevel = location.downstreamSensor.levelCm || 0;
  const diff = location.differentialLevelCm;
  const isDrainingAway = diff > 0;

  const areaCrops = crops.filter((c) => area.primaryCropIds.includes(c.id));

  const explanation = isDrainingAway
    ? language === 'bn'
      ? `আপনার জমির জলস্তর (${farmLevel} সেমি) খালের চেয়ে ${diff} সেমি উপরে রয়েছে। জল স্বাভাবিকভাবে নেমে যাচ্ছে।`
      : language === 'hi'
      ? `आपके खेत का जलस्तर (${farmLevel} सेमी) नहर से ${diff} सेमी ऊपर है। पानी सामान्य रूप से निकल रहा है।`
      : `Your field level (${farmLevel} cm) is ${diff} cm higher than the canal. Water is draining away safely.`
    : language === 'bn'
    ? `সতর্কতা: খালের জলস্তর (${canalLevel} সেমি) আপনার জমির চেয়ে ${Math.abs(diff)} সেমি বেশি। খালের জল উল্টো ঢুকতে পারে!`
    : language === 'hi'
    ? `सावधानी: नहर का जलस्तर (${canalLevel} सेमी) आपके खेत से ${Math.abs(diff)} सेमी ऊंचा है। नहर का पानी खेत में आ सकता है!`
    : `Warning: Canal water (${canalLevel} cm) is ${Math.abs(diff)} cm higher than your field. Canal water may backflow into crops!`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-xl font-black text-slate-900">
          {language === 'bn' ? `${area.localNameBengali || area.name} - জমির অবস্থা` : language === 'hi' ? `${area.localNameHindi || area.name} - खेत की स्थिति` : `${area.name} - Field Status`}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'bn' ? 'জমির জলস্তর এবং খালের জলনিকাশী প্রবাহ' : language === 'hi' ? 'खेत का जलस्तर और नहर में जल निकासी का बहाव' : 'Visual water level depth and canal discharge direction'}
        </p>
      </div>

      {/* Visual Water Level & Canal Comparison */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Droplet className="h-5 w-5 text-emerald-700" />
            {language === 'bn' ? 'জলনিকাশী প্রবাহের দিক' : language === 'hi' ? 'जल निकासी की दिशा' : 'Canal Drainage Direction'}
          </h3>

          <VoicePlayer text={explanation} language={language} size="sm" />
        </div>

        {/* Big Simple Two-Box Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farm-Side Box */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-5 text-center relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              {language === 'bn' ? 'আপনার জমির ধারের জলস্তর' : language === 'hi' ? 'आपके खेत की ओर जलस्तर' : 'Your Farm Furrow Level'}
            </span>
            <div className="text-5xl font-extrabold font-mono text-emerald-800 my-4">
              {farmLevel} <span className="text-xl font-sans font-bold">cm</span>
            </div>

            {/* Depth description */}
            <p className="text-xs font-semibold text-emerald-900">
              {farmLevel > 70
                ? language === 'bn' ? 'অতিরিক্ত জল (হাঁটু সমান)' : language === 'hi' ? 'अत्यधिक जल (घुटने तक)' : 'Critical standing water'
                : farmLevel > 40
                ? language === 'bn' ? 'মাঝারি জল (আইল পর্যন্ত)' : language === 'hi' ? 'मध्यम जल (मेड़ तक)' : 'Caution furrow level'
                : language === 'bn' ? 'স্বাভাবিক আর্দ্রতা' : language === 'hi' ? 'सामान्य नमी' : 'Normal moisture depth'}
            </p>
          </div>

          {/* Canal Box */}
          <div className="rounded-2xl border-2 border-sky-500 bg-sky-50/50 p-5 text-center relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
              {language === 'bn' ? 'নিকটবর্তী নিকাশী খালের জলস্তর' : language === 'hi' ? 'निकटवर्ती जल निकासी नहर का स्तर' : 'Nearby Outfall Canal Level'}
            </span>
            <div className="text-5xl font-extrabold font-mono text-sky-800 my-4">
              {canalLevel} <span className="text-xl font-sans font-bold">cm</span>
            </div>

            {/* Canal description */}
            <p className="text-xs font-semibold text-sky-900">
              {area.canalJunction}
            </p>
          </div>
        </div>

        {/* Direction Result Banner */}
        <div
          className={`rounded-xl p-4 text-center font-bold text-sm sm:text-base flex items-center justify-center gap-2 ${
            isDrainingAway
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-amber-100 text-amber-950 border border-amber-300'
          }`}
        >
          {isDrainingAway ? (
            <>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <span>
                {language === 'bn'
                  ? 'জল স্বাভাবিকভাবে জমি থেকে খালে নেমে যাচ্ছে (নিরাপদ)'
                  : language === 'hi'
                  ? 'पानी सामान्य रूप से खेत से नहर में जा रहा है (सुरक्षित)'
                  : 'Water is draining away from your field into the canal (Safe)'}
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-6 w-6 text-amber-700" />
              <span>
                {language === 'bn'
                  ? 'সতর্কতা: খালের জল জমিতে উল্টো ঢুকতে পারে — ইনলেট গেট বন্ধ রাখুন!'
                  : language === 'hi'
                  ? 'सावधानी: नहर का पानी खेत में घुस सकता है — इनलेट गेट बंद रखें!'
                  : 'Caution: Canal water may backflow into your field — Close inlet gates!'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Crops Planted in this Field */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sprout className="h-5 w-5 text-emerald-700" />
          <h3 className="font-bold text-base text-slate-900">
            {language === 'bn' ? 'ফসল সংবেদনশীলতা ও জল সহনশীলতা' : language === 'hi' ? 'फसल संवेदनशीलता एवं सहनशीलता' : 'Crops Vulnerability & Tolerance'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {areaCrops.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-slate-50/50"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">
                  {language === 'bn' ? c.localNameBengali : language === 'hi' ? c.localNameHindi : c.name}
                </h4>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    c.currentRisk === 'NORMAL'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {c.currentRisk === 'NORMAL'
                    ? language === 'bn' ? 'নিরাপদ' : language === 'hi' ? 'सुरक्षित' : 'Safe'
                    : language === 'bn' ? 'ঝুঁকিতে' : language === 'hi' ? 'जोखिम' : 'At Risk'}
                </span>
              </div>

              <div className="text-xs text-slate-600">
                <strong>{language === 'bn' ? 'সর্বোচ্চ জল দাঁড়ানোর সীমা:' : language === 'hi' ? 'अधिकतम जलभराव सहनीयता:' : 'Max Standing Water:'}</strong>{' '}
                {c.maxStandingWaterCm} cm
              </div>
              <div className="text-xs text-slate-600">
                <strong>{language === 'bn' ? 'ক্ষতির সময়সীমা:' : language === 'hi' ? 'नुकसान की समय सीमा:' : 'Critical Damage Window:'}</strong>{' '}
                {c.criticalHours} {language === 'bn' ? 'ঘণ্টা' : language === 'hi' ? 'घंटे' : 'hours'}
              </div>

              <p className="text-xs font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                {language === 'bn' ? c.actionAdviceBengali : language === 'hi' ? c.actionAdviceHindi : c.actionAdvice}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
