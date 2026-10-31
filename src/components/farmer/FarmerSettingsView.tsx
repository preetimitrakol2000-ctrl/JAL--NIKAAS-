/**
 * Jal-Nikaas: Farmer Interface - Language & Voice Settings View
 */

import React, { useState } from 'react';
import { Language } from '../../types';
import { getTranslation } from '../../utils/i18n';
import { Globe, Volume2, CheckCircle2, Play, Radio } from 'lucide-react';
import { VoicePlayer } from '../common/VoicePlayer';

interface FarmerSettingsViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const FarmerSettingsView: React.FC<FarmerSettingsViewProps> = ({
  language,
  onLanguageChange,
}) => {
  const testPhrases = {
    en: 'Testing speech output for Jal-Nikaas agricultural waterlogging early-warning platform. System is functioning properly.',
    bn: 'জল-নিকাশ প্ল্যাটফর্মের ভয়েস অডিও পরীক্ষা করা হচ্ছে। আপনার জমিতে জলস্তর নিরাপদ রয়েছে।',
    hi: 'जल-निकास प्रणाली की आवाज का परीक्षण किया जा रहा है। आपके खेत में जल निकासी व्यवस्था चालू है।',
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-emerald-700" />
          <h2 className="text-xl font-black text-slate-900">
            {language === 'bn' ? 'ভাষা ও ভয়েস সেটিংস' : language === 'hi' ? 'भाषा एवं आवाज सेटिंग्स' : 'Language & Voice Settings'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'bn' ? 'আপনার পছন্দের ভাষা নির্বাচন করুন এবং অডিও পরীক্ষা করুন' : language === 'hi' ? 'अपनी पसंदीदा भाषा चुनें एवं आवाज का परीक्षण करें' : 'Select your interface language and test audio playback'}
        </p>
      </div>

      {/* Language Selection Big Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          {language === 'bn' ? 'ভাষা নির্বাচন করুন' : language === 'hi' ? 'भाषा का चयन करें' : 'Choose Interface Language:'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'en' as Language, title: 'English', subtitle: 'English Language' },
            { id: 'bn' as Language, title: 'বাংলা (Bengali)', subtitle: 'বাংলা ভাষা' },
            { id: 'hi' as Language, title: 'हिन्दी (Hindi)', subtitle: 'हिन्दी भाषा' },
          ].map((item) => {
            const isSelected = language === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onLanguageChange(item.id)}
                className={`rounded-2xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">{item.title}</span>
                  {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-700" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Playback Test Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-emerald-700" />
            <h3 className="font-bold text-base text-slate-900">
              {language === 'bn' ? 'ভয়েস অডিও পরীক্ষা' : language === 'hi' ? 'बोलकर सलाह की जांच' : 'Test Voice Audio Playback'}
            </h3>
          </div>

          <VoicePlayer
            text={testPhrases[language]}
            language={language}
            size="md"
            label={language === 'bn' ? 'ভয়েস শুনুন' : language === 'hi' ? 'आवाज सुनें' : 'Play Audio Test'}
          />
        </div>

        <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-medium">
          "{testPhrases[language]}"
        </p>

        <div className="text-[11px] text-slate-500 space-y-1">
          <p>
            ✓ <strong>Offline Browser Speech:</strong> Uses locally installed browser speech synthesis. No internet required for playback.
          </p>
          <p>
            ✓ <strong>Language Alignment:</strong> Reads the exact recommendation in your currently selected language ({language.toUpperCase()}).
          </p>
        </div>
      </div>
    </div>
  );
};
