/**
 * Jal-Nikaas: Farmer Interface - Waterlogging Alerts View
 * Simple, accessible cards with full voice playback
 */

import React from 'react';
import { AgriculturalArea, AlertItem, Language } from '../../types';
import { Bell, AlertTriangle, AlertOctagon, Volume2, CheckCircle2 } from 'lucide-react';
import { VoicePlayer } from '../common/VoicePlayer';

interface FarmerAlertsViewProps {
  area: AgriculturalArea;
  alerts: AlertItem[];
  language: Language;
}

export const FarmerAlertsView: React.FC<FarmerAlertsViewProps> = ({
  area,
  alerts,
  language,
}) => {
  // Filter alerts relevant to this area or show all if none
  const areaAlerts = alerts.filter(
    (a) => a.locationId === area.locationId || !a.acknowledged
  );

  const getAlertVoiceText = (alert: AlertItem) => {
    if (language === 'bn') {
      return `${alert.locationName} এলাকায় সতর্কতা: ${alert.recommendedActionBengali || alert.recommendedAction}`;
    }
    if (language === 'hi') {
      return `${alert.locationName} क्षेत्र में चेतावनी: ${alert.recommendedActionHindi || alert.recommendedAction}`;
    }
    return `Alert for ${alert.locationName}: ${alert.recommendedAction}`;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-black text-slate-900">
            {language === 'bn' ? 'জরুরি জলাবদ্ধতার সতর্কতা' : language === 'hi' ? 'महत्वपूर्ण जलभराव चेतावनियां' : 'Important Waterlogging Alerts'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'bn' ? 'আপনার এলাকার সাম্প্রতিক বিজ্ঞপ্তি ও করণীয় পদক্ষেপ' : language === 'hi' ? 'आपके क्षेत्र की हालिया सूचनाएं एवं आवश्यक कदम' : 'Timely notifications and required actions for your agricultural zone'}
        </p>
      </div>

      <div className="space-y-4">
        {areaAlerts.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center text-emerald-900">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-bold text-lg">
              {language === 'bn' ? 'কোনো সক্রিয় সতর্কতা নেই' : language === 'hi' ? 'कोई सक्रिय चेतावनी नहीं है' : 'No Active Critical Alerts'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-700 mt-1">
              {language === 'bn' ? 'আপনার এলাকার জলস্তর নিরাপদ সীমার মধ্যে রয়েছে।' : language === 'hi' ? 'आपके क्षेत्र का जलस्तर सुरक्षित सीमा में है।' : 'Water levels in your area are within safe operational limits.'}
            </p>
          </div>
        ) : (
          areaAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const actionText =
              language === 'bn'
                ? alert.recommendedActionBengali || alert.recommendedAction
                : language === 'hi'
                ? alert.recommendedActionHindi || alert.recommendedAction
                : alert.recommendedAction;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border-2 p-5 shadow-xs space-y-3 ${
                  isCritical
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-amber-300 bg-amber-50/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isCritical ? (
                      <AlertOctagon className="h-6 w-6 text-red-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        {alert.locationName}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} • {alert.id}
                      </span>
                    </div>
                  </div>

                  {/* Audio button for each alert! */}
                  <VoicePlayer
                    text={getAlertVoiceText(alert)}
                    language={language}
                    size="sm"
                    variant={isCritical ? 'primary' : 'secondary'}
                  />
                </div>

                {/* Farmer-friendly Action Text */}
                <div className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    {language === 'bn' ? 'আপনার করণীয়:' : language === 'hi' ? 'आपको क्या करना चाहिए:' : 'Action to take:'}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    "{actionText}"
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>
                    {language === 'bn' ? 'কারণ: ' : language === 'hi' ? 'कारण: ' : 'Cause: '}
                    {alert.triggerCondition}
                  </span>
                  <span>{alert.acknowledged ? '✓ Acknowledged by Panchayat' : '⚠ Pending action'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
