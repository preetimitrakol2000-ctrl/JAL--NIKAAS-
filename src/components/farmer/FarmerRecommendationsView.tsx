/**
 * Jal-Nikaas: Farmer Interface - Recommendations View
 * Dedicated actionable advisories with voice playback controls
 */

import React from 'react';
import { AgriculturalArea, AreaRecommendation, CropInfo, Language } from '../../types';
import { Sparkles, Phone, ShieldCheck, Droplet, Sprout } from 'lucide-react';
import { VoicePlayer } from '../common/VoicePlayer';

interface FarmerRecommendationsViewProps {
  area: AgriculturalArea;
  recommendations: AreaRecommendation[];
  crops: CropInfo[];
  language: Language;
}

export const FarmerRecommendationsView: React.FC<FarmerRecommendationsViewProps> = ({
  area,
  recommendations,
  crops,
  language,
}) => {
  const areaRec = recommendations.find((r) => r.areaId === area.id) || recommendations[0];

  const getAdvisoryText = (rec: AreaRecommendation) => {
    if (language === 'bn') return rec.farmerAdvisoryBengali;
    if (language === 'hi') return rec.farmerAdvisoryHindi;
    return rec.farmerAdvisory;
  };

  const areaCrops = crops.filter((c) => area.primaryCropIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-emerald-700" />
          <h2 className="text-xl font-black text-slate-900">
            {language === 'bn' ? 'জরুরি কৃষক সুপারিশ ও পরামর্শ' : language === 'hi' ? 'महत्वपूर्ण किसान सिफारिशें एवं सलाह' : 'Actionable Agricultural Recommendations'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'bn' ? 'জমির ফসল ও নিকাশী সুরক্ষার জন্য ব্যবহারিক নির্দেশাবলী' : language === 'hi' ? 'फसल सुरक्षा एवं जल निकासी के लिए व्यावहारिक निर्देश' : 'Practical guidance for crop protection and drainage management'}
        </p>
      </div>

      {/* Featured Primary Recommendation for Selected Area */}
      {areaRec && (
        <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1">
                {language === 'bn' ? `${area.name} এর জন্য প্রধান পরামর্শ` : language === 'hi' ? `${area.name} के लिए मुख्य सलाह` : `Priority Advisory for ${area.name}`}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                {language === 'bn' ? 'বর্তমান মাঠ পরিস্থিতি ও পদক্ষেপ' : language === 'hi' ? 'वर्तमान स्थिति एवं कार्रवाई' : 'Current Field Condition & Action'}
              </h3>
            </div>

            <VoicePlayer
              text={getAdvisoryText(areaRec)}
              language={language}
              size="lg"
            />
          </div>

          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            "{getAdvisoryText(areaRec)}"
          </p>
        </div>
      )}

      {/* Crop-Specific Protection Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sprout className="h-5 w-5 text-emerald-700" />
          <h3 className="font-bold text-base text-slate-900">
            {language === 'bn' ? 'ফসলভিত্তিক প্রতিরক্ষামূলক ব্যবস্থা' : language === 'hi' ? 'फसल-वार सुरक्षात्मक उपाय' : 'Crop-Specific Protection Strategies'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areaCrops.map((c) => {
            const cropAdvice =
              language === 'bn'
                ? c.actionAdviceBengali
                : language === 'hi'
                ? c.actionAdviceHindi
                : c.actionAdvice;

            return (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">
                      {language === 'bn' ? c.localNameBengali : language === 'hi' ? c.localNameHindi : c.name}
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {c.stage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed">
                    "{cropAdvice}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                  <VoicePlayer
                    text={`${c.name}: ${cropAdvice}`}
                    language={language}
                    size="sm"
                    variant="secondary"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Panchayat & Drainage Assistance Contacts */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Phone className="h-5 w-5 text-emerald-700" />
          <h4>
            {language === 'bn' ? 'জরুরি সেচ ও নিকাশী সহায়তা কেন্দ্র' : language === 'hi' ? 'आपातकालीन सिंचाई एवं जल निकासी सहायता' : 'Emergency Drainage & Sluice Gate Contacts'}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-1">
          <div className="rounded-xl bg-white p-3 border border-slate-200">
            <strong>{area.block} Gram Panchayat:</strong>
            <p className="text-slate-500 mt-0.5">Water User Association (WUA) Liaison Officer</p>
          </div>
          <div className="rounded-xl bg-white p-3 border border-slate-200">
            <strong>Assistant Agricultural Officer (AAO):</strong>
            <p className="text-slate-500 mt-0.5">{area.district} District Field Division</p>
          </div>
        </div>
      </div>
    </div>
  );
};
